import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NEXUS_OPA_BIN = '/definitely/missing/opa';
const { initStore, readState } = await import('../src/simple-store.mjs');
const { executeTransition } = await import('../src/executor.mjs');

const dir = mkdtempSync(join(tmpdir(), 'nexus-opa-failclosed-'));
const log = join(dir, 'state.log');
initStore(log);

const request = {
  candidate_id: 'FAILCLOSED-C1',
  from_state: 'CANDIDATE',
  requested_state: 'CI_PASS',
  evidence: [{ type: 'CI', status: 'PASS' }]
};

const result = executeTransition({
  storePath: log,
  request,
  event: 'CI_OK',
  eventId: 'FAILCLOSED-1'
});

assert.deepEqual(result, {
  executed: false,
  reason: 'OPA_EVALUATION_FAILED'
});
assert.equal(readState(log).state, 'CANDIDATE');

rmSync(dir, { recursive: true, force: true });
console.log('OPA_SINGLE_AUTHORITY_FAILCLOSED: PASS');
