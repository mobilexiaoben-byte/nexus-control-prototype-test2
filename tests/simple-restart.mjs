import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initStore, readState, transition, verifyStore, readAll } from '../src/simple-store.mjs';

const dir = mkdtempSync(join(tmpdir(), 'nexus-simple-'));
const log = join(dir, 'state.log');

initStore(log);
transition(log, 'CI_OK', 'E1');
assert.equal(readState(log).state, 'CI_PASS');
assert.equal(readState(log).state, 'CI_PASS');

transition(log, 'TERMINATE', 'E2');
assert.equal(readState(log).state, 'CI_PASS');

const before = readAll(log).length;
transition(log, 'CI_OK', 'E1');
assert.equal(readAll(log).length, before);

transition(log, 'DEVICE_OK', 'E3');
assert.equal(readState(log).state, 'DEVICE_PASS');
transition(log, 'TERMINATE', 'E4');
assert.equal(readState(log).state, 'TERMINATED');
assert.deepEqual(verifyStore(log), { ok: true });

const rows = readAll(log);
rows[1].state = 'DEVICE_PASS';
writeFileSync(log, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
assert.equal(verifyStore(log).ok, false);

rmSync(dir, { recursive: true, force: true });
console.log('SIMPLE_RESTART_HARDENED: PASS');
