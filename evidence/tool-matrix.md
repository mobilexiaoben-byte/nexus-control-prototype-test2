# NEXUS prototype — matrice incident → garantie → outil

| Incident du rapport | Garantie mécanique requise | Outil testé | Résultat prototype | Position provisoire |
|---|---|---|---|---|
| CI_PASS pris pour DEVICE_PASS | transitions fermées + preuve DEVICE obligatoire | XState + OPA | PASS | RETENIR |
| PASS déclaré au-delà de la preuve | claim lié à evidence explicite | JSON Schema + policy | PASS | RETENIR |
| Golden ancien régressif | preuve successor behavior obligatoire | policy + evidence contract | PASS | RETENIR |
| Monitoring après TERMINATED | état terminal non réactivable | XState | PASS | RETENIR |
| OPTIONAL pris pour Web réellement exécuté | distinguer autorisation / exécution prouvée | evidence semantics | PASS | RETENIR |
| Perte de continuité inter-session | état durable + journal rejouable | simple append-only hash chain | PASS | RETENIR CAPACITÉ |
| Double livraison/replay | idempotence par event_id | simple store | PASS | RETENIR |
| Falsification de l'historique | hash chain + vérification fail-closed | simple store | PASS | RETENIR |
| Workflow durable complexe | reprise orchestrée | Temporal | NON VALIDÉ / surcoût élevé | NE PAS RETENIR ENCORE |
| Contournement GitHub | check obligatoire hors workflow | GitHub Rulesets | TEST EN COURS | À ÉPROUVER |
