import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { initStore, readState, readAll, verifyStore } from '../src/simple-store.mjs';
import { executeTransition, executeCompositionCheck } from '../src/executor.mjs';
import { webAssessment, monitoringEventAllowed } from '../src/evidence.mjs';

const dir = mkdtempSync(join(tmpdir(), 'nexus-e2e-'));
const log = join(dir, 'state.log');
initStore(log);

// 1. Contract/CI stage enters CI_PASS through the journal.
const ciRequest = {
  candidate_id: 'E2E-C1',
  from_state: 'CANDIDATE',
  requested_state: 'CI_PASS',
  evidence: [{ type: 'CI', status: 'PASS' }]
};
const ci = executeTransition({
  storePath: log,
  request: ciRequest,
  event: 'CI_OK',
  eventId: 'E2E-1'
});
assert.equal(ci.executed, true);
assert.equal(readState(log).state, 'CI_PASS');

// 2. DEVICE_PASS without DEVICE proof must be denied and not change state.
const noDeviceRequest = {
  candidate_id: 'E2E-C1',
  from_state: 'CI_PASS',
  requested_state: 'DEVICE_PASS',
  evidence: [{ type: 'CI', status: 'PASS' }]
};
const denied = executeTransition({
  storePath: log,
  request: noDeviceRequest,
  event: 'DEVICE_OK',
  eventId: 'E2E-2'
});
assert.equal(denied.executed, false);
assert.equal(denied.reason, 'DEVICE_EVIDENCE_REQUIRED');
assert.equal(readState(log).state, 'CI_PASS');

// 3. ResearchPolicy permission must not imply actual Web execution.
assert.deepEqual(
  webAssessment('OPTIONAL', []),
  { web_allowed: true, web_execution_proven: false }
);

// 4. Old Golden without successor proof must be denied.
const composition = executeCompositionCheck({
  successor_required: true,
  evidence: [{ type: 'CI', status: 'PASS' }]
});
assert.deepEqual(
  composition,
  { executed: false, reason: 'SUCCESSOR_BEHAVIOR_NOT_PROVEN' }
);

// 5. DEVICE proof permits DEVICE_PASS.
const deviceRequest = {
  candidate_id: 'E2E-C1',
  from_state: 'CI_PASS',
  requested_state: 'DEVICE_PASS',
  evidence: [
    { type: 'CI', status: 'PASS' },
    { type: 'DEVICE', status: 'PASS' }
  ]
};
const device = executeTransition({
  storePath: log,
  request: deviceRequest,
  event: 'DEVICE_OK',
  eventId: 'E2E-3'
});
assert.equal(device.executed, true);
assert.equal(readState(log).state, 'DEVICE_PASS');

// 6. TERMINATED only from DEVICE_PASS.
const terminateRequest = {
  candidate_id: 'E2E-C1',
  from_state: 'DEVICE_PASS',
  requested_state: 'TERMINATED',
  evidence: [{ type: 'DEVICE', status: 'PASS' }]
};
const terminated = executeTransition({
  storePath: log,
  request: terminateRequest,
  event: 'TERMINATE',
  eventId: 'E2E-4'
});
assert.equal(terminated.executed, true);
assert.equal(readState(log).state, 'TERMINATED');
assert.equal(monitoringEventAllowed('TERMINATED'), false);

// 7. Replay same event id must be idempotent.
const beforeReplay = readAll(log).length;
executeTransition({
  storePath: log,
  request: terminateRequest,
  event: 'TERMINATE',
  eventId: 'E2E-4'
});
assert.equal(readAll(log).length, beforeReplay);

// 8. Tamper must be detected.
const rows = readAll(log);
rows[1].state = 'DEVICE_PASS';
writeFileSync(log, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
assert.equal(verifyStore(log).ok, false);

rmSync(dir, { recursive: true, force: true });
console.log('NEXUS_INTEGRATED_E2E: PASS');
