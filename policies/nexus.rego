package nexus

default allow := false

device_evidence if {
  some e in input.evidence
  e.type == "DEVICE"
  e.status == "PASS"
}

allow if {
  input.requested_state == "DEVICE_PASS"
  device_evidence
}

deny_reason := "DEVICE_EVIDENCE_REQUIRED" if {
  input.requested_state == "DEVICE_PASS"
  not device_evidence
}
