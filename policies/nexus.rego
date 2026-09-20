package nexus

default decision := {"allow": false, "reason": "DENY_DEFAULT"}

has_evidence(type) if {
  some e in input.request.evidence
  e.type == type
  e.status == "PASS"
}

decision := {"allow": true, "reason": "POLICY_PASS"} if {
  input.operation == "transition"
  input.request.from_state == "CANDIDATE"
  input.request.requested_state == "CI_PASS"
}

decision := {"allow": false, "reason": "DEVICE_EVIDENCE_REQUIRED"} if {
  input.operation == "transition"
  input.request.requested_state == "DEVICE_PASS"
  not has_evidence("DEVICE")
}

decision := {"allow": true, "reason": "POLICY_PASS"} if {
  input.operation == "transition"
  input.request.from_state == "CI_PASS"
  input.request.requested_state == "DEVICE_PASS"
  has_evidence("DEVICE")
}

decision := {"allow": false, "reason": "TERMINATION_REQUIRES_DEVICE_PASS"} if {
  input.operation == "transition"
  input.request.requested_state == "TERMINATED"
  input.request.from_state != "DEVICE_PASS"
}

decision := {"allow": true, "reason": "POLICY_PASS"} if {
  input.operation == "transition"
  input.request.from_state == "DEVICE_PASS"
  input.request.requested_state == "TERMINATED"
}

decision := {"allow": false, "reason": "SUCCESSOR_BEHAVIOR_NOT_PROVEN"} if {
  input.operation == "composition"
  input.request.successor_required == true
  not has_evidence("SUCCESSOR_BEHAVIOR")
}

decision := {"allow": true, "reason": "COMPOSITION_PASS"} if {
  input.operation == "composition"
  input.request.successor_required == false
}

decision := {"allow": true, "reason": "COMPOSITION_PASS"} if {
  input.operation == "composition"
  input.request.successor_required == true
  has_evidence("SUCCESSOR_BEHAVIOR")
}
