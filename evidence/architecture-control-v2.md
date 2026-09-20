# NEXUS Control Prototype — architecture expérimentale v2

## Changement depuis v1
La source de décision parallèle JavaScript a été supprimée.

Le chemin prototype validé est désormais :

JSON Schema
→ état courant durable
→ Evidence semantics
→ OPA décision unique ALLOW/DENY
→ exécuteur
→ journal durable
→ GitHub Ruleset côté atelier

## Invariant de décision
L'exécuteur ne possède aucune règle d'autorisation métier miroir.

Toute décision sensible de transition ou de composition provient de OPA.
Si OPA est indisponible, invalide ou ne rend aucune décision exploitable, l'exécuteur refuse l'action.

## Preuve expérimentale
- src/policy.mjs absent : PASS
- policies/nexus.rego présent : PASS
- E2E intégré avec OPA réel : PASS
- OPA indisponible → aucune transition : PASS
- Ruleset GitHub anti-bypass : PASS

## Statut
Architecture expérimentale démontrée dans le prototype TEST2 uniquement.
Aucune intégration ni autorité sur NEXUS CURRENT.
