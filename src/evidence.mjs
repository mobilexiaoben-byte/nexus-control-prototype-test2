export function webAssessment(policy, runtimeEvidence) {
  return {
    web_allowed: policy === 'OPTIONAL' || policy === 'REQUIRED',
    web_execution_proven:
      runtimeEvidence.some(e => e.type === 'WEB_RUNTIME' && e.status === 'PASS')
  };
}

export function monitoringEventAllowed(state) {
  return state !== 'TERMINATED';
}
