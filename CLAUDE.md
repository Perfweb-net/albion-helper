# Albion Helper

Companion app pour Albion Online — back Symfony 7.2 (`back/`, API REST + JWT) + front React 19 (`front/`, MUI, i18n).

Ce projet est le support de la **certification RNCP39583** (Expert en développement logiciel, YNOV M2).

## Suivi RNCP — règle stricte

- **Tout le suivi de la certification passe par `doc/suivi_rncp.md` et UNIQUEMENT ce fichier.**
  Le mettre à jour (cocher/décocher, ajouter aux corrections) — **ne jamais créer d'autre fichier de suivi, de check-list ou de récap d'avancement.**
- Les 4 documents officiels du diplôme (à ne jamais modifier ni supprimer) sont dans `doc/` :
  1. `Référentiel Expert en développement logiciel RNCP39583 (3).pdf`
  2. `25 09 15  Réglement spécial de certification - Expert en développement logiciel RNCP39583 (3).pdf`
  3. `25-26 Modalités_Evaluations_Titre EDL RNCP39583_YNOV_M2_filiere Info (3).pdf`
  4. `24 10 10 Grille évaluation Expert en développement logiciel (3).xlsx`

## Commandes

- Tests back : `cd back && APP_ENV=test php bin/phpunit` (si erreur de schéma : `rm var/test.db && php bin/console doctrine:schema:create --env=test`)
- Tests front : `cd front && CI=true npm test -- --watchAll=false`
- Commits : Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`…) — l'historique Git est une preuve évaluée par le jury (C2.2.4).
