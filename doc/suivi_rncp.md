# Suivi RNCP39583 — Albion Helper
> Fichier de suivi UNIQUE de la certification. Mis à jour le 2026-06-12.
> Contient **toutes** les compétences et tous les livrables officiels, point par point.
> ☑ = vérifié dans le repo le 12/06 · ☐ = à faire · ⚠️ ÉLIM = compétence éliminatoire (une seule non-acquise = bloc invalidé)

Sources officielles (dans `doc/`, ne pas modifier) :
- `Référentiel Expert en développement logiciel RNCP39583 (3).pdf` (compétences + critères d'évaluation)
- `25 09 15  Réglement spécial de certification… (3).pdf` (livrables exacts + éliminatoires)
- `25-26 Modalités_Evaluations_Titre EDL RNCP39583_YNOV_M2… (3).pdf` (dates + DigiformaCertif)
- `24 10 10 Grille évaluation Expert en développement logiciel (3).xlsx` (grille du jury)

## Règles de validation

- Bloc validé si **≥ 50% des compétences acquises** ET **aucune éliminatoire non-acquise**
- La certification = validation des **4 blocs**
- Dépôt obligatoire sur **DigiformaCertif** dans les délais, sinon bloc invalidé automatiquement

| Bloc | Épreuve | Date | Urgence |
|---|---|---|---|
| Bloc 2 | Dossier écrit 30p max + code source | **08–19/06/2026** | 🚨 **J-7** |
| Bloc 4 | Dossier écrit 20p max | 20–24/07/2026 | 🟠 |
| Bloc 3 | Oral 45' (30'+15') + démo live | 01–29/09/2026 | 🟡 |
| Bloc 1 | Oral 30' (20'+10') | Rentrée oct. 2026 | 🟡 |

---

# BLOC 2 — Concevoir et développer des applications logicielles 🚨 (rendu 19/06)

## Compétences

### C2.1.1 — Environnements de déploiement et de test
- [x] Environnement de développement en place (Docker Compose, Symfony 7.4, React 19, PostgreSQL)
- [x] Environnement de test séparé (SQLite, `.env.test`, fixtures)
- [x] Déploiement continu implémenté (12/06) : job `deploy` après succès de tous les tests, push `master` uniquement, SSH vers le serveur + `deploy/deploy.sh` (pull, composer --no-dev, migrations, cache, build front)
- [ ] Protocole de déploiement continu rédigé pour le dossier (séquences : tests → SSH → pull → migrations → build)
- [ ] Critères de qualité et de performance définis et documentés

### C2.1.2 — Intégration continue
- [x] Pipeline GitHub Actions : tests back (PHPUnit) + front (Jest) sur push/PR, génération clés JWT, schéma BDD test
- [ ] Protocole d'intégration continue explicité clairement (séquences d'intégration) — rédaction dossier

### C2.2.1 — Prototype de l'application ⚠️ ÉLIM
- [x] Prototype fonctionnel répondant aux besoins (auth, joueurs, guildes, carte, routes partagées, compositions, craft, admin, i18n, dark mode, tutoriel)
- [x] Ensemble cohérent de fonctionnalités principales + composants d'interface fonctionnels
- [x] Architecture logicielle structurée et maintenable (Controller → Service → Repository → Entity)
- [x] Frameworks et paradigmes de développement utilisés (Symfony/Doctrine, React/hooks/context)
- [ ] Présentation du prototype rédigée pour le dossier (spécificités ergonomiques, équipements ciblés)

### C2.2.2 — Harnais de tests unitaires ⚠️ ÉLIM
- [x] Tests backend : 18 tests PHPUnit / 50 assertions — verts (Symfony 7.4, vérifié 12/06)
- [x] Tests frontend : 12 suites Jest / 95 tests — **100% verts** (Admin.test.jsx réparé le 12/06)
- [ ] Jeu de tests couvrant une fonctionnalité complète, décrit dans le dossier (critère : « les tests couvrent la majorité du code »)

### C2.2.3 — Sécurisation, accessibilité, évolutivité ⚠️ ÉLIM
Critère officiel : « les mesures couvrent les 10 failles OWASP » + « référentiel d'accessibilité présenté et justifié ».
- [x] A01 contrôle d'accès : routes protégées JWT, contrôles de propriété (pas d'IDOR), `/api/admin` derrière `ROLE_ADMIN`
- [x] A02 crypto : bcrypt, clés RSA JWT non commitées, `APP_SECRET` renseigné, tokens de partage `random_bytes`
- [x] A03 injection : ORM Doctrine partout, entrées validées (regex, bornes, `substr`)
- [x] A10 SSRF : proxy d'icônes verrouillé par regex stricte
- [x] A04 : rate limiting — `login_throttling` (5/15 min) + limiteur `registration` (5/IP/h) — fait le 12/06
- [x] A05 : CORS via `%env(CORS_ALLOW_ORIGIN)%` (plus de wildcard) + headers de sécurité (`SecurityHeadersSubscriber` : nosniff, X-Frame-Options, Referrer-Policy, CSP) — fait le 12/06
- [x] A06 : dépendances — Symfony 7.2 (EOL) → 7.4.13 LTS (`composer audit` : 0 advisory, corrige CVE-2025-64500 high), axios 1.17.0 ; vulnérabilités restantes = chaîne de build react-scripts (dev uniquement, risque accepté)
- [x] A07 : mot de passe ≥ 8 caractères au register + rotation des refresh tokens (`single_use: true`) — fait le 12/06
- [ ] JWT en `localStorage` : justifier le choix + mitigations dans le dossier (TTL 1 h + rotation refresh) — ou migrer en cookie httpOnly plus tard
- [ ] Présentation des mesures de sécurité, faille OWASP par faille OWASP (rédaction dossier)
- [x] Accessibilité de base : `lang="fr"`, ARIA sur Login et Header (aria-label, aria-expanded, aria-live)
- [ ] Référentiel d'accessibilité choisi, présenté et **justifié** (RGAA 4.1 recommandé)
- [ ] Actions accessibilité handicap présentées + audit outillé (Lighthouse/axe-core) avec scores consignés

### C2.2.4 — Déploiement à chaque modification / gestion des versions
- [x] Système de gestion de versions utilisé (git, branches main/develop)
- [x] Dernière version du logiciel fonctionnelle, fiable et viable
- [x] Évolutions tracées : travail commité le 12/06 en 9 lots Conventional Commits (docs, feat back, feat front, test, fix security, chore deps, ci, build) — maintenir cette convention pour la suite

### C2.3.1 — Cahier de recettes ⚠️ ÉLIM
- [ ] Scénarios de tests numérotés : préconditions, étapes, résultats attendus
- [ ] Couverture de l'ensemble des fonctionnalités attendues (critère officiel)
- [ ] Exécution réelle : résultats obtenus + statuts PASS/FAIL datés (tests fonctionnels, structurels et de sécurité)

### C2.3.2 — Plan de correction des bogues
- [ ] Bogues détectés, qualifiés et traités (matière dispo : BUG-001→008 du CHANGELOG)
- [ ] Analyse des points d'amélioration pour chaque test en échec
- [ ] Document rédigé pour le dossier

### C2.4.1 — Documentation technique
- [ ] Manuel de déploiement
- [ ] Manuel d'utilisation
- [ ] Manuel de mise à jour
- [ ] Les manuels décrivent les choix de technologies et langages

## Livrable Bloc 2 — dossier 30 pages max (liste officielle du règlement)

- [ ] 1. Le protocole de déploiement continu
- [ ] 2. Les critères de qualité et de performance
- [ ] 3. Le protocole d'intégration continue
- [ ] 4. Une architecture logicielle structurée permettant la maintenabilité (schéma)
- [ ] 5. Une présentation d'un des prototypes réalisés
- [ ] 6. L'utilisation de frameworks et des paradigmes de développement
- [ ] 7. Un jeu de tests unitaires couvrant une fonctionnalité demandée
- [ ] 8. Une présentation des mesures de sécurité mises en œuvre
- [ ] 9. Une présentation des actions pour l'accès aux personnes en situation de handicap
- [ ] 10. L'historique des différentes versions
- [ ] 11. La dernière version du logiciel fonctionnel, fiable et viable
- [ ] 12. Le cahier de recettes
- [ ] 13. Le plan de correction des bogues
- [ ] 14. Le manuel de déploiement
- [ ] 15. Le manuel d'utilisation
- [ ] 16. Le manuel de mise à jour
- [ ] **Dépôt sur DigiformaCertif avant le 19/06** (code source + dossier)

---

# BLOC 4 — Maintenir l'application en condition opérationnelle 🟠 (dossier 20–24/07)

## Compétences

### C4.1.1 — Mise à jour des dépendances
- [x] Outils en place : Dependabot actif (composer + npm + GitHub Actions, `.github/dependabot.yml`) ; `composer audit` : 0 advisory ; mise à jour majeure réalisée (Symfony 7.4 LTS, 12/06) — exemple concret pour le dossier
- [ ] Processus documenté : fréquence des mises à jour, périmètre logiciel, type (automatique/manuel)

### C4.1.2 — Système de supervision et d'alerte ⚠️ ÉLIM
- [x] Sonde applicative : endpoint `/api/health` public (statut DB + API Albion)
- [x] Canal Monolog `incident` dédié (dev + prod)
- [ ] Sonde externe réellement configurée (ex. UptimeRobot sur `/api/health` prod) + modalité de signalement (alerte e-mail) + preuve (capture)
- [ ] Indicateurs de suivi pertinents définis (disponibilité, temps de réponse, taux d'erreur)
- [ ] Description du système de supervision rédigée (sondes + finalités + critères qualité/performance)

### C4.2.1 — Consignation des anomalies ⚠️ ÉLIM
- [ ] Processus de collecte et consignation structuré et documenté
- [ ] Fiche de consignation type (infos permettant de reproduire le bogue)
- [ ] Fiches remplies sur des anomalies réelles du projet (matière dispo : bug `isTokenValid`, base de test obsolète, mocks Admin.test.jsx…)

### C4.2.2 — Création et déploiement de correctifs
- [x] Correctifs réels disponibles comme matière (BUG-001→008 corrigés, pipeline CI qui valide)
- [ ] Présentation du traitement d'une anomalie de bout en bout (détection → correctif → CI → déploiement)

### C4.3.1 — Axes d'amélioration
- [ ] Recommandations argumentées (gains coût/délai, réalistes, basées sur indicateurs et retours utilisateurs)

### C4.3.2 — Journal des versions ⚠️ ÉLIM
- [x] CHANGELOG.md tenu et à jour (v1.0.0 → v2.1.0) : features v2.0.0 (admin, routes, compositions, craft, dark mode, tuto, i18n) + correctifs sécurité v2.1.0 (BUG-001→010) — complété le 12/06

### C4.3.3 — Collaboration avec le support client
- [ ] Un exemple de problème résolu avec un utilisateur : contexte + résolution + contribution des parties prenantes (utiliser un retour de testeur/utilisateur réel)

## Livrable Bloc 4 — dossier 20 pages max (liste officielle du règlement)

- [ ] 1. La description du processus de mise à jour des dépendances
- [ ] 2. La description du système de supervision
- [ ] 3. La description du processus de collecte et de consignation des anomalies
- [ ] 4. La présentation d'une fiche de consignation d'une anomalie rencontrée
- [ ] 5. La présentation du traitement d'une anomalie détectée
- [ ] 6. La présentation des recommandations argumentées d'amélioration
- [ ] 7. La présentation d'un exemplaire du journal de version
- [ ] 8. Un exemple de problème résolu en collaboration avec le support client
- [ ] **Dépôt sur DigiformaCertif entre le 20 et le 24/07**

---

# BLOC 3 — Coordonner et piloter le projet 🟡 (oral 01–29/09)

## Compétences

### C3.1 — Planification ⚠️ ÉLIM
- [ ] Méthodologie justifiée avec bénéfices attendus (Agile/Scrum/Kanban/V — adapter au solo)
- [ ] Planning détaillé découpé en phases/tâches/lots (Gantt, PERT ou rétroplanning), outil argumenté et compatible avec la méthodologie
- [ ] Ressources nécessaires identifiées (humaines, financières, matérielles)
- [ ] Tâches assignées selon les compétences (matrice RACI/RASCI — adapter au solo), prise en compte du handicap

### C3.2.1 — Pilotage et indicateurs ⚠️ ÉLIM
- [ ] Outil de suivi de projet en adéquation avec la méthodologie (GitHub Projects, Trello…)
- [ ] Indicateurs mesurables et quantifiables : avancement, coûts, délais, risques, RH
- [ ] Tableau de bord présentable au jury

### C3.2.2 — Arbitrages
- [ ] Un cas d'arbitrage : problématique + conséquences + options possibles + décision argumentée (outil d'aide à la décision type logigramme)

### C3.3.1 — Management d'équipe
- [ ] Affectation des missions réalisée au cours du projet
- [ ] Style(s) managérial(aux) identifié(s) et décrit(s) (directif, persuasif, participatif, délégatif — adapter : auto-pilotage)
- [ ] Outils de communication utilisés + leurs objectifs (prise en compte handicap, charge répartie)
- [ ] Analyse critique d'une situation managériale + recommandations

### C3.3.2 — Compétences de l'équipe
- [ ] Grille d'évaluation des compétences (actuelles vs à acquérir) commentée
- [ ] Plan de développement des compétences détaillé + formations préconisées (modalités adaptées au handicap)

### C3.4.1 — Comptes rendus et validation client
- [ ] Comptes rendus d'évolutions et améliorations, clairs et ordonnés
- [ ] Planification des points de validation réalisés
- [ ] Indicateurs de satisfaction définis et cohérents

### C3.4.2 — Démonstration du logiciel ⚠️ ÉLIM
- [x] Le logiciel est utilisable (app fonctionnelle, bugs critiques de juin corrigés)
- [ ] Script de démo reprenant les fonctionnalités attendues (inscription → connexion → dashboard → recherches → carte → route partagée → composition → craft → admin)
- [ ] Environnement de démo stable : back déployé, données préchargées, répétition la veille
- [ ] Vocabulaire adapté à une présentation client (pas de « JWT », « API », « localhost »)
- [ ] La démo aboutit à une validation (conclusion orientée commanditaire)

## Livrable Bloc 3 — présentation orale 45' (liste officielle du règlement)

- [ ] 1. Présentation de la méthodologie choisie
- [ ] 2. Planning détaillé du projet
- [ ] 3. Ressources nécessaires
- [ ] 4. Outil de suivi de projet
- [ ] 5. Un cas d'arbitrage rencontré
- [ ] 6. Affectation des missions
- [ ] 7. Style managérial / styles managériaux utilisés
- [ ] 8. Outils de communication + objectifs
- [ ] 9. Évaluation des besoins en compétences (grille)
- [ ] 10. Plan de développement des compétences
- [ ] 11. Comptes rendus sur les évolutions et améliorations
- [ ] 12. Planification des points de validation réalisés
- [ ] 13. Indicateurs de satisfaction mis en place
- [ ] 14. Démonstration des fonctionnalités devant le jury
- [ ] Support de présentation (30' + 15' d'échanges)

---

# BLOC 1 — Cadrer le projet 🟡 (oral rentrée oct.)

## Compétences

### C1.1.1 — Cartographie des parties prenantes ⚠️ ÉLIM
- [ ] Acteurs identifiés : développeurs, architectes, administrateurs, clients, acteurs externes
- [ ] Rôles et niveaux d'implication ; futurs utilisateurs identifiés et détaillés

### C1.1.2 — Analyse de la demande
- [ ] Besoins et attentes des parties prenantes recensés (entretien d'explicitation, état des lieux)
- [ ] Objectifs et enjeux définis par partie prenante ; problématique client identifiée ; pistes de solutions cohérentes

### C1.2.1 — Opportunités et menaces
- [ ] SWOT (ou outil équivalent) : impact environnemental, sécurité, points de vigilance, opportunités, interactions avec d'autres projets

### C1.2.2 — Faisabilité technique ⚠️ ÉLIM
- [ ] Démarche d'audit documentée et argumentée
- [ ] Étude technique : langages, bases de données, architecture existante, état des applications
- [ ] Contraintes techniques et financières (hébergement, OS, volume de données, nb utilisateurs, délais, budget)
- [ ] Avis critique sur la faisabilité

### C1.2.3 — Cartographie des risques
- [ ] Risques techniques et fonctionnels cartographiés et priorisés (perte de données, interruption, dégradation, sécurité)
- [ ] Référentiel d'évaluation des risques + suivi des incidents
- [ ] Indicateurs de contrôle explicités

### C1.3.1 — Veille technologique
- [ ] Méthodologie de recherche + principales sources consultées
- [ ] Outils de veille expliqués (automatisation, salons, réseaux pro) + bénéfices attendus
- [ ] Évolutions classifiées et justifiées (impact métier et environnemental)

### C1.3.2 — Étude comparative des solutions ⚠️ ÉLIM
- [ ] Analyse comparative (Symfony vs Laravel/Node, React vs Vue/Angular, JWT vs sessions…)
- [ ] Avantages/inconvénients en termes de : sécurité, environnements systèmes, réseaux, accessibilité, impact environnemental
- [ ] Choix retenus justifiés + ressources matérielles/techniques identifiées

### C1.4.1 — Charge de travail ⚠️ ÉLIM
- [ ] Diagramme de fonctionnalités ou cahier des charges fonctionnel (fonctions recensées, hiérarchisées)
- [ ] Charge exprimée en jours-homme ; outil d'analyse fonctionnelle explicité ; UX prise en compte

### C1.4.2 — Estimation des coûts
- [ ] Estimation cohérente avec la charge ; budget prévisionnel par postes (licences, développement, infrastructures…)

### C1.5 — Architecture logicielle
- [ ] Schémas légendés (méthode de modélisation justifiée : UML, C4, Merise…)
- [ ] Architecture maintenable, sécurisée, extensible ; interactions explicitées ; impact environnemental pris en compte (ex : bilan carbone)

### C1.6 — Préconisations au client ⚠️ ÉLIM
- [ ] Axes de solutions préconisés + arguments répondant à la problématique
- [ ] Discours vulgarisé, objections traitées, supports de communication adaptés

## Livrable Bloc 1 — présentation orale 30' (liste officielle du règlement)

- [ ] 1. Cartographie des parties prenantes
- [ ] 2. Analyse de la demande, objectifs et enjeux par partie prenante
- [ ] 3. Cartographie des opportunités et menaces
- [ ] 4. Démarche d'audit mise en œuvre
- [ ] 5. Diagnostic des infrastructures existantes
- [ ] 6. Cartographie des risques techniques et fonctionnels
- [ ] 7. Référentiel d'évaluation des risques et de suivi des incidents
- [ ] 8. Indicateurs de contrôle
- [ ] 9. Méthodologie de recherche + principales sources consultées
- [ ] 10. Sources d'information et outils de veille
- [ ] 11. Étude comparative des solutions techniques
- [ ] 12. Ressources matérielles/techniques nécessaires
- [ ] 13. Diagramme de fonctionnalités ou cahier des charges fonctionnel
- [ ] 14. Estimation de la charge de travail
- [ ] 15. Estimation des coûts + budget prévisionnel
- [ ] 16. Schémas de l'architecture logicielle proposée
- [ ] 17. Préconisation des axes de solutions + arguments
- [ ] Support de présentation (20' + 10' d'échanges)

---

# 🔧 Corrections (audit code du 12/06/2026)

## ✅ Corrigées le 12/06

1. ~~`Admin.test.jsx` 7 tests en échec~~ — cause réelle : mock `useTranslation` instable → boucle de fetch infinie. Réparé + bug réel corrigé (`newUsersToday` → `newToday`). 95/95 tests verts.
2. ~~CORS wildcard~~ — `nelmio_cors.yaml` branché sur `%env(CORS_ALLOW_ORIGIN)%` avec `origin_regex`.
3. ~~Rate limiting~~ — `login_throttling` (5/15 min) + limiteur `registration` (5/IP/h). `lock_factory: null` (le flock deadlockait les WebTestCase) ; limites désactivées en env test (compteurs persistants entre runs).
4. ~~Politique de mot de passe + code mort~~ — min 8 caractères au register ; `login()` remplacé par le pattern Symfony documenté (route requise pour le `check_path`, jamais exécutée).
5. ~~Mitigations localStorage~~ — rotation des refresh tokens activée (`single_use: true`), TTL token 1 h. *(Reste : rédiger la justification dans le dossier.)*
6. ~~Headers de sécurité~~ — `SecurityHeadersSubscriber` sur `/api` : nosniff, X-Frame-Options DENY, Referrer-Policy, CSP.
8. ~~CHANGELOG~~ — v2.0.0 (features) + v2.1.0 (sécurité) ajoutées.
9. ~~Dependabot~~ — `.github/dependabot.yml` créé (composer, npm, github-actions).
10. ~~Base de test locale~~ — schéma recréé ; procédure notée dans `CLAUDE.md`.

Bonus audit dépendances : **Symfony 7.2 (EOL) → 7.4.13 LTS** (`composer audit` : 36 advisories → 0, dont CVE-2025-64500 high) ; **axios 1.7.9 → 1.17.0**.

7. ~~Git~~ — travail commité le 12/06 en 9 lots Conventional Commits ; convention à maintenir.

## ☐ Restantes

- **Dossier** — rédiger la justification localStorage (mitigations : TTL 1 h + rotation refresh) dans la section sécurité.
- **npm audit (front)** — 57 vulnérabilités restantes, toutes dans la chaîne de build `react-scripts` (outillage de dev, non exposé en production) : documenter comme risque accepté dans le dossier ; migration hors CRA (Vite) en axe d'amélioration (C4.3.1).
- ~~Hook pre-commit~~ — réparé le 12/06 (lint depuis la racine du dépôt, grep sécurité affiné sur des patterns non ambigus).
- **GitHub** — passer la branche par défaut de `main` à `master` (Settings → Branches), puis supprimer `main` : `git push origin --delete main`.
- **Secrets GitHub Actions à créer** (Settings → Secrets and variables → Actions) pour le déploiement : `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH` (chemin du projet sur le serveur), `SSH_PORT` (optionnel, défaut 22).
