import { createMachine, createActor } from 'xstate';

export const lifecycleMachine = createMachine({
  id: 'nexusCandidate',
  initial: 'CANDIDATE',
  states: {
    CANDIDATE: { on: { CI_OK: 'CI_PASS' } },
    CI_PASS: { on: { DEVICE_OK: 'DEVICE_PASS' } },
    DEVICE_PASS: { on: { TERMINATE: 'TERMINATED' } },
    TERMINATED: { type: 'final' }
  }
});

export function replay(events) {
  const actor = createActor(lifecycleMachine);
  actor.start();
  for (const event of events) actor.send({ type: event });
  return actor.getSnapshot().value;
}
