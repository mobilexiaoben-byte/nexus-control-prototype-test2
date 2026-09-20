import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { transition, readState } from './simple-store.mjs';

const schema = JSON.parse(
  readFileSync(new URL('../schemas/transition-request.schema.json', import.meta.url))
);
const ajv = new Ajv2020({ strict: false });
const validate = ajv.compile(schema);
const policyPath = fileURLToPath(new URL('../policies/nexus.rego', import.meta.url));
const opaBin = process.env.NEXUS_OPA_BIN || '/tmp/opa';

function opaDecision(input) {
  const result = spawnSync(
    opaBin,
    ['eval', '-f', 'json', '-d', policyPath, '--stdin-input', 'data.nexus.decision'],
    { input: JSON.stringify(input), encoding: 'utf8' }
  );

  if (result.status !== 0) {
    return { allow: false, reason: 'OPA_EVALUATION_FAILED' };
  }

  try {
    const parsed = JSON.parse(result.stdout);
    return parsed.result?.[0]?.expressions?.[0]?.value
      ?? { allow: false, reason: 'OPA_NO_DECISION' };
  } catch {
    return { allow: false, reason: 'OPA_RESULT_INVALID' };
  }
}

export function executeTransition({ storePath, request, event, eventId }) {
  if (!validate(request)) {
    return { executed: false, reason: 'CONTRACT_INVALID' };
  }

  const currentState = readState(storePath).state;
  if (currentState !== request.from_state) {
    return { executed: false, reason: 'STATE_MISMATCH' };
  }

  const decision = opaDecision({ operation: 'transition', request });
  if (!decision.allow) {
    return { executed: false, reason: decision.reason };
  }

  const record = transition(storePath, event, eventId);
  return {
    executed: true,
    reason: decision.reason,
    state: record.state,
    persisted_state: readState(storePath).state
  };
}

export function executeCompositionCheck(input) {
  const decision = opaDecision({ operation: 'composition', request: input });
  return { executed: decision.allow, reason: decision.reason };
}
