# NEXUS Control Prototype — architecture cible expérimentale v1

## Statut
Prototype uniquement. Aucun effet sur NEXUS CURRENT.

## Noyau retenu
1. Validation de contrat — JSON Schema.
2. Machine à états déterministe — XState ou équivalent.
3. Evidence engine — sépare autorisé, exécuté, observé et prouvé.
4. Policy engine — OPA ou équivalent pour ALLOW/DENY fail-closed.
5. Journal durable intègre — append-only, idempotence, hash chain.
6. Exécuteur séparé — aucune promotion d'état sur déclaration de l'IA.

## Atelier de développement
- mêmes contrôles que le runtime ;
- CI obligatoire ;
- OPA comme gate externe ;
- tests de comportements successeurs ;
- BOM / dépendances ;
- GitHub Rulesets comme barrière anti-contournement.

## Temporal
Non retenu comme dépendance nécessaire à ce stade.
Le prototype simple couvre déjà reprise, idempotence et intégrité observées dans le rapport.
Temporal ne doit être réintroduit que si un besoin d'orchestration durable non couvert est démontré.

## Invariant central
Une IA peut proposer une transition. Elle ne peut pas déclarer souverainement PASS, DEVICE_PASS, CLOSED ou équivalent.

La transition effective doit être calculée à partir :
contrat valide + état courant + preuves requises + policy ALLOW + exécution réussie + receipt durable.

## Conclusion prototype
La combinaison minimale démontrée est :
JSON Schema + machine d'états + evidence engine + policy engine + journal durable + exécuteur contrôlé.
GitHub Rulesets est retenu pour l'atelier, pas comme composant du runtime utilisateur.
