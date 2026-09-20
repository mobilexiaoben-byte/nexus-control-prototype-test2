import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { authorizeTransition, authorizeComposition } from './policy.mjs';
import { transition, readState } from './simple-store.mjs';

const schema = JSON.parse(
  readFileSync(new URL('../schemas/transition-request.schema.json', import.meta.url))
);
const ajv = new Ajv2020({ strict: false });
const validate = ajv.compile(schema);

export function executeTransition({ storePath, request, event, eventId }) {
  if (!validate(request)) {
    return { executed: false, reason: 'CONTRACT_INVALID' };
  }

  const decision = authorizeTransition(request);
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
  const decision = authorizeComposition(input);
  return { executed: decision.allow, reason: decision.reason };
}
