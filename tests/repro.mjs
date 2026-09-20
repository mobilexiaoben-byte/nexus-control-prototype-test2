import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { replay } from '../src/machine.mjs';
import { webAssessment, monitoringEventAllowed } from '../src/evidence.mjs';

const schema = JSON.parse(
  readFileSync(new URL('../schemas/transition-request.schema.json', import.meta.url))
);
const ajv = new Ajv2020({ strict: false });
const validate = ajv.compile(schema);

const noDevice = {
  candidate_id: 'C1',
  from_state: 'CI_PASS',
  requested_state: 'DEVICE_PASS',
  evidence: [{ type: 'CI', status: 'PASS' }]
};
assert.equal(validate(noDevice), true);

assert.equal(replay(['CI_OK']), 'CI_PASS');
assert.equal(replay(['CI_OK', 'TERMINATE']), 'CI_PASS');
assert.equal(replay(['CI_OK', 'DEVICE_OK', 'TERMINATE']), 'TERMINATED');

assert.equal(monitoringEventAllowed('TERMINATED'), false);
assert.deepEqual(
  webAssessment('OPTIONAL', []),
  { web_allowed: true, web_execution_proven: false }
);

console.log('NEXUS_BASE_GUARDS: PASS');
