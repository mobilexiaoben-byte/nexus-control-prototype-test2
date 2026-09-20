import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

function digest(obj) {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

export function initStore(path) {
  if (!existsSync(path)) {
    const genesis = { state: 'CANDIDATE', seq: 0, event_id: 'GENESIS', prev_hash: null };
    writeFileSync(path, JSON.stringify({ ...genesis, hash: digest(genesis) }) + '\n');
  }
}

export function readAll(path) {
  return readFileSync(path, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
}

export function verifyStore(path) {
  const rows = readAll(path);
  for (let i = 0; i < rows.length; i++) {
    const { hash, ...body } = rows[i];
    if (digest(body) !== hash) return { ok: false, reason: 'HASH_MISMATCH', seq: body.seq };
    if (i > 0 && body.prev_hash !== rows[i - 1].hash) return { ok: false, reason: 'CHAIN_BREAK', seq: body.seq };
  }
  return { ok: true };
}

export function readState(path) {
  const integrity = verifyStore(path);
  if (!integrity.ok) throw new Error(integrity.reason);
  return readAll(path).at(-1);
}

export function transition(path, event, event_id) {
  const rows = readAll(path);
  if (rows.some(r => r.event_id === event_id)) return rows.find(r => r.event_id === event_id);

  const current = readState(path);
  let next = current.state;
  if (current.state === 'CANDIDATE' && event === 'CI_OK') next = 'CI_PASS';
  else if (current.state === 'CI_PASS' && event === 'DEVICE_OK') next = 'DEVICE_PASS';
  else if (current.state === 'DEVICE_PASS' && event === 'TERMINATE') next = 'TERMINATED';

  const body = { state: next, seq: current.seq + 1, event, event_id, prev_hash: current.hash };
  const record = { ...body, hash: digest(body) };
  appendFileSync(path, JSON.stringify(record) + '\n');
  return record;
}
