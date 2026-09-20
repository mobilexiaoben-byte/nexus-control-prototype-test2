export function hasPass(evidence, type) {
  return evidence.some(e => e.type === type && e.status === 'PASS');
}

export function authorizeTransition(req) {
  if (req.requested_state === 'DEVICE_PASS' && !hasPass(req.evidence, 'DEVICE')) {
    return { allow: false, reason: 'DEVICE_EVIDENCE_REQUIRED' };
  }
  if (req.requested_state === 'TERMINATED' && req.from_state !== 'DEVICE_PASS') {
    return { allow: false, reason: 'TERMINATION_REQUIRES_DEVICE_PASS' };
  }
  return { allow: true, reason: 'POLICY_PASS' };
}

export function authorizeComposition({ successor_required, evidence }) {
  if (successor_required && !hasPass(evidence, 'SUCCESSOR_BEHAVIOR')) {
    return { allow: false, reason: 'SUCCESSOR_BEHAVIOR_NOT_PROVEN' };
  }
  return { allow: true, reason: 'COMPOSITION_PASS' };
}
