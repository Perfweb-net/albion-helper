# Suivi RNCP39583 — Albion Helper
> Fichier de suivi UNIQUE de la certification. Mis à jour le 2026-07-06.
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
- Dépôt obligatoire sur **DigiformaCertif** (https://ynov.mycertif.app) dans les délais — livrables **ET** supports de présentation — sinon bloc invalidé automatiquement
- **Rattrapage** : accessible uniquement si **moins de 50 % des blocs sont invalidés** (donc 1 bloc raté max)
- **Diplôme/titre prérequis** : à transmettre au campus dès la rentrée, sinon **non-présentation au jury de certification** (modalités p. « Conseils ») — vérifier que c'est fait
- ⚠️ Le planning officiel (modalités) mentionne une fenêtre **17–21/08/2026 (S34)** en plus du 01–29/09 pour l'oral Bloc 3, « selon le campus » — **confirmer la date exacte avec le campus** (si août : la préparation Bloc 3 devient urgente dès juillet)

| Bloc | Épreuve | Date | Urgence |
|---|---|---|---|
| Bloc 2 | Dossier écrit 30p max + code source | **08–19/06/2026** | ✅ échéance passée — **confirmer que le dépôt DigiformaCertif a bien été fait** |
| Bloc 4 | Dossier écrit 20p max | **20–24/07/2026** | 🚨 **J-14** |
| Bloc 3 | Oral 45' (30'+15') + démo live | **17–21/08 ou 01–29/09 selon campus** | 🟠 rien commencé |
| Bloc 1 | Oral 30' (20'+10') | Rentrée oct. 2026 | 🟡 rien commencé |

---

# BLOC 2 — Concevoir et développer des applications logicielles 🚨 (rendu 19/06)

## Compétences

### C2.1.1 — Environnements de déploiement et de test
- [x] Environnement de développement en place (Docker Compose, Symfony 7.4, React 19, PostgreSQL)
- [x] Environnement de test séparé (SQLite, `.env.test`, fixtures)
- [x] Déploiement continu implémenté (12/06) : job `deploy` après succès de tous les tests, push `master` uniquement, SSH vers le serveur + `deploy/deploy.sh` (pull, composer --no-dev, migrations, cache, build front)
- [x] Protocole de déploiement continu rédigé (dossier §5 : 8 séquences détaillées)
- [x] Critères de qualité et de performance définis et documentés (dossier §4.3)

### C2.1.2 — Intégration continue
- [x] Pipeline GitHub Actions : tests back (PHPUnit) + front (Jest) sur push/PR, génération clés JWT, schéma BDD test
- [x] Protocole d'intégration continue explicité (dossier §4.2 : 7 séquences)

### C2.2.1 — Prototype de l'application ⚠️ ÉLIM
- [x] Prototype fonctionnel répondant aux besoins (auth, joueurs, guildes, carte, routes partagées, compositions, craft, admin, i18n, dark mode, tutoriel)
- [x] Ensemble cohérent de fonctionnalités principales + composants d'interface fonctionnels
- [x] Architecture logicielle structurée et maintenable (Controller → Service → Repository → Entity)
- [x] Frameworks et paradigmes de développement utilisés (Symfony/Doctrine, React/hooks/context)
- [x] Présentation du prototype rédigée avec 7 captures d'écran (dossier §1)

### C2.2.2 — Harnais de tests unitaires ⚠️ ÉLIM
- [x] Tests backend : 18 tests PHPUnit / 50 assertions — verts (Symfony 7.4, vérifié 12/06)
- [x] Tests frontend : 12 suites Jest / 95 tests — **100% verts** (Admin.test.jsx réparé le 12/06)
- [x] Jeu de tests décrit : authentification couverte de bout en bout API→UI→utilitaires (dossier §6.2)

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
- [x] JWT en `localStorage` : choix justifié + mitigations documentées dans le dossier (§7.1) — migration httpOnly en axe d'amélioration
- [x] Mesures de sécurité présentées faille OWASP par faille OWASP avec preuves de recette (dossier §7)
- [x] Accessibilité de base : `lang="fr"`, ARIA sur Login et Header (aria-label, aria-expanded, aria-live)
- [x] Référentiel RGAA 4.1 présenté et justifié (dossier §8.1)
- [x] Audit outillé du 12/06 : Lighthouse (login 100, register 100, accueil 93) + axe-core sur 7 pages — corrections immédiates (47 aria-label, labelId, contraste disabled 1,8→4,5:1), constat contraste chips consigné avec remédiation (dossier §8.3)

### C2.2.4 — Déploiement à chaque modification / gestion des versions
- [x] Système de gestion de versions utilisé (git, branches main/develop)
- [x] Dernière version du logiciel fonctionnelle, fiable et viable
- [x] Évolutions tracées : travail commité le 12/06 en 9 lots Conventional Commits (docs, feat back, feat front, test, fix security, chore deps, ci, build) — maintenir cette convention pour la suite

### C2.3.1 — Cahier de recettes ⚠️ ÉLIM
- [x] 26 scénarios numérotés (AUTH, RECH, CARTE, ROUTE, COMPO, CRAFT, ADM, CONF, SEC) avec préconditions, étapes, attendus — **exécutés le 12/06 via Playwright + API : 26/26 PASS**
- [x] 3 anomalies réelles détectées par la recette (BUG-011/012/013), corrigées et re-testées le jour même
- [x] Intégré au dossier (§10 de `dossier/Dossier_Bloc2_Albion_Helper.docx`)

### C2.3.2 — Plan de correction des bogues
- [x] Registre BUG-001→013 + OBS-01, qualifiés (gravité/origine) et traités (dossier §11.2)
- [x] Analyse des échecs : AUTH-05 FAIL→correctif→PASS documenté ; processus de correction décrit (dossier §11.1)
- [x] Plan de correction intégré au dossier (§11)

### C2.4.1 — Documentation technique
- [x] Manuel de déploiement VPS Nginx+PHP-FPM en 9 étapes (dossier §12.1)
- [x] Manuel d'utilisation par fonctionnalité (dossier §12.2)
- [x] Manuel de mise à jour : app, dépendances, schéma BDD, données (dossier §12.3)
- [x] Les manuels décrivent les technologies (Nginx, PHP-FPM, Doctrine, React build)

## Livrable Bloc 2 — dossier 30 pages max (liste officielle du règlement)

- [x] 1. Le protocole de déploiement continu
- [x] 2. Les critères de qualité et de performance
- [x] 3. Le protocole d'intégration continue
- [x] 4. Une architecture logicielle structurée permettant la maintenabilité (schéma)
- [x] 5. Une présentation d'un des prototypes réalisés
- [x] 6. L'utilisation de frameworks et des paradigmes de développement
- [x] 7. Un jeu de tests unitaires couvrant une fonctionnalité demandée
- [x] 8. Une présentation des mesures de sécurité mises en œuvre
- [x] 9. Une présentation des actions pour l'accès aux personnes en situation de handicap
- [x] 10. L'historique des différentes versions
- [x] 11. La dernière version du logiciel fonctionnel, fiable et viable
- [x] 12. Le cahier de recettes
- [x] 13. Le plan de correction des bogues
- [x] 14. Le manuel de déploiement
- [x] 15. Le manuel d'utilisation
- [x] 16. Le manuel de mise à jour
- [ ] **DERNIÈRE ÉTAPE : relire `dossier/Dossier_Bloc2_Albion_Helper.docx` (mettre à jour le sommaire dans Word) puis déposer code + dossier sur DigiformaCertif avant le 19/06**

---

# BLOC 4 — Maintenir l'application en condition opérationnelle 🟠 (dossier 20–24/07)

## Compétences

### C4.1.1 — Mise à jour des dépendances
- [x] Outils en place : Dependabot actif (composer + npm + GitHub Actions, `.github/dependabot.yml`) ; `composer audit` : 0 advisory ; mise à jour majeure réalisée (Symfony 7.4 LTS, 12/06) — exemple concret pour le dossier
- [x] Processus documenté : fréquence (hebdo + immédiat si critique), périmètre (composer/npm/actions), type auto+manuel (dossier Bloc 4 §2)

### C4.1.2 — Système de supervision et d'alerte ⚠️ ÉLIM
- [x] Sonde applicative : endpoint `/api/health` public (statut DB + API Albion)
- [x] Canal Monolog `incident` dédié (dev + prod)
- [ ] Sonde externe : créer le monitor UptimeRobot sur https://albion-back.perfweb.net/api/health (5 min, mot-clé OK, alerte e-mail) + **insérer la capture dans le dossier §3.4** ; sonde interne cron prête : installer `deploy/healthcheck-probe.sh` dans la crontab du VPS (*/5)
- [ ] 🚨 **BLOQUANT découvert le 06/07** : `/api/health` renvoie **404 en production** — le code déployé date d'avant le 12/06 (le job CI `deploy` n'a jamais tourné : secrets GitHub absents, et `deploy.sh` tire `master` alors que la branche par défaut distante est `main`). **Avant UptimeRobot** : ① pousser develop→master (`git push origin develop:master`), ② créer les secrets GitHub Actions OU se connecter en SSH au VPS et lancer `deploy/deploy.sh` à la main, ③ vérifier `curl https://albion-back.perfweb.net/api/health` → 200 `"status":"OK"`
- [x] Indicateurs définis avec cibles : dispo ≥99%, réponse <1s, détection ≤5 min, 5xx <1% (dossier Bloc 4 §3.1)
- [x] Système décrit avec schéma : 2 sondes (UptimeRobot + cron interne avec anti-spam et e-mail de rétablissement), /api/health détaillé, signalements, journaux (dossier Bloc 4 §3)

### C4.2.1 — Consignation des anomalies ⚠️ ÉLIM
- [x] Processus documenté : 6 canaux de collecte, cycle consignation→qualification→correctif→re-test, grille gravité/priorité (dossier Bloc 4 §4)
- [x] Fiche normalisée (11 champs dont reproduction obligatoire) — dossier Bloc 4 §4.3
- [x] Exemplaire réel rempli : BUG-011 (symptôme→reproduction→cause racine→correctif→validation) + registre BUG-001→013

### C4.2.2 — Création et déploiement de correctifs
- [x] Correctifs réels disponibles comme matière (BUG-001→008 corrigés, pipeline CI qui valide)
- [x] Traitement de BUG-011 en 9 étapes tirant profit de la CI/CD (dossier Bloc 4 §5)

### C4.3.1 — Axes d'amélioration
- [x] 7 recommandations chiffrées en effort, adossées aux constats d'audit (dossier Bloc 4 §7)

### C4.3.2 — Journal des versions ⚠️ ÉLIM
- [x] CHANGELOG.md tenu et à jour (v1.0.0 → v2.1.0) : features v2.0.0 (admin, routes, compositions, craft, dark mode, tuto, i18n) + correctifs sécurité v2.1.0 (BUG-001→010) — complété le 12/06

### C4.3.3 — Collaboration avec le support client
- [x] Cas support rédigé (prix N/A Brecilien : contexte→diagnostic→résolution→contributions) — l'infobulle décrite a été réellement implémentée dans Craft.jsx ; **à valider à la relecture** (dossier Bloc 4 §8)

## Livrable Bloc 4 — dossier 20 pages max (liste officielle du règlement)

- [x] 1. La description du processus de mise à jour des dépendances
- [x] 2. La description du système de supervision
- [x] 3. La description du processus de collecte et de consignation des anomalies
- [x] 4. La présentation d'une fiche de consignation d'une anomalie rencontrée
- [x] 5. La présentation du traitement d'une anomalie détectée
- [x] 6. La présentation des recommandations argumentées d'amélioration
- [x] 7. La présentation d'un exemplaire du journal de version
- [x] 8. Un exemple de problème résolu en collaboration avec le support client
- [ ] **DERNIÈRES ÉTAPES : créer le monitor UptimeRobot + insérer sa capture (§3.4), installer la sonde cron sur le VPS, relire le docx (sommaire) et déposer sur DigiformaCertif entre le 20 et le 24/07**

---

# BLOC 3 — Coordonner et piloter le projet 🟡 (oral 17–21/08 ou 01–29/09 selon campus)

> **06/07** : support de présentation v1 complet généré → `dossier/Support_Bloc3_Albion_Helper.html` (ouvrir dans un navigateur, flèches pour naviguer, P pour imprimer/PDF). Couvre les 14 points du règlement + script de démo en annexe A. **À relire, personnaliser et répéter.**

## Compétences

### C3.1 — Planification ⚠️ ÉLIM
- [x] Méthodologie justifiée avec bénéfices attendus : Kanban adapté solo (support v1, slide 3) — à relire
- [x] Planning détaillé découpé en phases/lots : rétroplanning 6 phases + Gantt calé sur les vraies dates git (support v1, slide 4) — à relire
- [x] Ressources nécessaires identifiées (humaines, financières, matérielles) : support v1, slide 5 — à relire
- [x] Tâches assignées selon les compétences : matrice RACI adaptée solo + prise en compte handicap (support v1, slide 8) — à relire

### C3.2.1 — Pilotage et indicateurs ⚠️ ÉLIM
- [ ] **Outil de suivi à matérialiser** : créer le tableau GitHub Projects (kanban Backlog/À faire/En cours/Recette/Fait) et y reporter les lots réels — le support (slide 6) le présente, il faut que le tableau existe pour l'oral (~30 min)
- [x] Indicateurs mesurables et quantifiables : avancement, coûts, délais, risques, RH (support v1, slide 6)
- [ ] Tableau de bord présentable au jury (GitHub Projects + dernier run CI ouverts en direct — cf. annexe B du support)

### C3.2.2 — Arbitrages
- [x] Cas d'arbitrage rédigé : stockage JWT localStorage vs cookie httpOnly — problématique, options chiffrées, logigramme, décision argumentée (support v1, slide 7)

### C3.3.1 — Management d'équipe
- [x] Affectation des missions : casquettes × créneaux + délégation à l'outillage (support v1, slide 8)
- [x] Styles managériaux : les 4 styles mappés sur le contexte solo (support v1, slide 9)
- [x] Outils de communication + objectifs, handicap pris en compte (support v1, slide 10)
- [x] Analyse critique d'une situation managériale : recette tardive de juin → recommandations appliquées (support v1, slide 9)

### C3.3.2 — Compétences de l'équipe
- [x] Grille d'évaluation des compétences (7 lignes, initial/requis/atteint, commentée) — support v1, slide 11
- [x] Plan de développement des compétences + formations préconisées, modalités adaptées au handicap — support v1, slide 12

### C3.4.1 — Comptes rendus et validation client
- [x] Comptes rendus d'évolutions : CHANGELOG v1.0→v3.0 + commits conventionnels + dossiers de jalon (support v1, slide 13)
- [x] Planification des points de validation réalisés (tableau daté, support v1, slide 13)
- [x] Indicateurs de satisfaction définis et cohérents (support v1, slide 14)

### C3.4.2 — Démonstration du logiciel ⚠️ ÉLIM
- [x] Le logiciel est utilisable (app fonctionnelle ; tests re-vérifiés verts le 06/07 : PHPUnit OK, Jest 95/95)
- [x] Script de démo détaillé en 10 étapes, vocabulaire commanditaire (support v1, annexe A)
- [ ] **Environnement de démo stable : la PROD N'EST PAS À JOUR** (déployée avant le 12/06, cf. bloquant Bloc 4) — redéployer, précharger les données, répéter la veille (check-list en annexe B du support)
- [x] Vocabulaire adapté client : intégré au script (annexe A)
- [ ] La démo aboutit à une validation : conclusion orientée commanditaire écrite (slide 15 + étape 10 du script) — à répéter à l'oral

## Livrable Bloc 3 — présentation orale 45' (liste officielle du règlement)

Les 14 points sont couverts par `dossier/Support_Bloc3_Albion_Helper.html` (v1 du 06/07). Reste à faire :
- [ ] Relire/personnaliser le support (vérifier les chiffres, ajouter des captures GitHub Projects et CI)
- [ ] Créer le tableau GitHub Projects réel (cf. C3.2.1)
- [ ] Redéployer la prod (cf. bloquant Bloc 4) + préparer les données de démo
- [ ] Répétition chronométrée (30' + démo ~8')
- [ ] **Déposer le support sur DigiformaCertif avant l'échéance** (date exacte de l'oral à confirmer avec le campus : 17–21/08 ou 01–29/09)

---

# BLOC 1 — Cadrer le projet 🟡 (oral rentrée oct.)

> **06/07** : support de présentation v1 complet généré → `dossier/Support_Bloc1_Albion_Helper.html` (navigateur, flèches, P pour imprimer/PDF). Couvre les 17 points du règlement + timing d'oral en annexe. **À relire, personnaliser et répéter.** Point d'attention : le commanditaire est présenté comme « une communauté/guilde de joueurs » — vérifier que cette fiction cadre avec ce qui a été dit au campus.

## Compétences

### C1.1.1 — Cartographie des parties prenantes ⚠️ ÉLIM
- [x] Acteurs identifiés (commanditaire, joueurs, dev, admins, éditeur du jeu, hébergeur, YNOV) + rôles, implication, lecture pouvoir×intérêt — support v1, slide 3 — à relire

### C1.1.2 — Analyse de la demande
- [x] Besoins par partie prenante (état des lieux + entretiens d'usage), objectifs, enjeux, problématique, 3 pistes de solutions dont celle retenue — support v1, slides 2 & 4

### C1.2.1 — Opportunités et menaces
- [x] SWOT complet + points de vigilance (impact environnemental, sécurité, interactions avec l'API du jeu) — support v1, slide 5

### C1.2.2 — Faisabilité technique ⚠️ ÉLIM
- [x] Démarche d'audit en 3 volets (fonctionnel, API du jeu, infra) — support v1, slide 6
- [x] Diagnostic infrastructures existantes + contraintes techniques et financières (hébergement, volumétrie, délais, budget) — support v1, slide 7
- [x] Avis critique sur la faisabilité (faisable sous 3 conditions) — support v1, slide 7

### C1.2.3 — Cartographie des risques
- [x] 6 risques priorisés (probabilité × impact) avec mesures — support v1, slide 8
- [x] Référentiel d'évaluation (seuils de criticité) + suivi des incidents (registre réel BUG-001→013) — support v1, slide 9
- [x] Indicateurs de contrôle explicités (6 indicateurs chiffrés) — support v1, slide 9

### C1.3.1 — Veille technologique
- [x] Méthodologie 3 niveaux + sources + outils + bénéfices + preuve d'efficacité (migration 7.4 LTS déclenchée par la veille) — support v1, slide 10

### C1.3.2 — Étude comparative des solutions ⚠️ ÉLIM
- [x] Comparatif 4 briques (Symfony/Laravel/Node, React/Vue/Angular, JWT/sessions, PostgreSQL/MySQL/Mongo) sur les 5 critères exigés (sécurité, systèmes, réseaux, accessibilité, impact env.) + ressources identifiées — support v1, slide 11

### C1.4.1 — Charge de travail ⚠️ ÉLIM
- [x] Diagramme de fonctionnalités hiérarchisé MoSCoW (F1→F6) + méthode d'analyse + UX prise en compte — support v1, slide 12
- [x] Charge en jours-homme par lot (85 + réserve 10 % ≈ 94 j-h), méthode par analogie, cohérence avec le réalisé — support v1, slide 13

### C1.4.2 — Estimation des coûts
- [x] Budget prévisionnel par postes (dev 37,6 k€ au TJM 400 €, infra 270 €/2 ans, licences 0 €) — support v1, slide 13

### C1.5 — Architecture logicielle
- [x] Schéma C4 niveau conteneurs, méthode justifiée (vs UML), propriétés maintenable/sécurisée/extensible/sobre — support v1, slide 14 — envisager un vrai schéma C4 contexte en plus

### C1.6 — Préconisations au client ⚠️ ÉLIM
- [x] Préconisation en 3 temps, discours vulgarisé, 4 objections traitées — support v1, slide 15

## Livrable Bloc 1 — présentation orale 30' (liste officielle du règlement)

Les 17 points sont couverts par `dossier/Support_Bloc1_Albion_Helper.html` (v1 du 06/07, mapping point→slide dans le support). Reste à faire :
- [ ] Relire/personnaliser (chiffres de charge et TJM à assumer à l'oral ; valider la présentation du commanditaire)
- [ ] Répétition chronométrée 20' (timing proposé en annexe du support)
- [ ] **Déposer le support sur DigiformaCertif avant l'échéance** (date exacte : rentrée octobre, à confirmer)

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
- **GitHub** — la branche par défaut distante est toujours `main` (vérifié le 06/07 via `git ls-remote`) alors que `deploy.sh` et le job CI déploient `master`, et que le travail se fait sur `develop` (22 commits d'avance sur `origin/master`). Aligner : passer la défaut à `master` (Settings → Branches), pousser `develop`→`master`, puis supprimer `main`.
- **Secrets GitHub Actions à créer** (Settings → Secrets and variables → Actions) pour le déploiement : `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH` (chemin du projet sur le serveur), `SSH_PORT` (optionnel, défaut 22).

# 🔎 Constats de la session du 06/07/2026

1. **Prod obsolète (bloquant Bloc 4 et démo Bloc 3)** : `curl https://albion-back.perfweb.net/api/health` → **404** (page d'erreur Symfony). Le back tourne mais sur du code d'avant le 12/06 : le déploiement continu n'a jamais été exécuté (secrets absents + `master` jamais poussée). Détail des étapes dans C4.1.2.
2. **Tests re-vérifiés** : back PHPUnit ✅ (exit 0, quelques dépréciations sans gravité), front Jest ✅ 95/95 — la base reste saine après les 33 commits de fonctionnalités de juin-juillet (i18n, multi-serveur, batailles, stats PvP).
3. **Supports d'oraux générés** : `dossier/Support_Bloc3_Albion_Helper.html` (14 points + script de démo) et `dossier/Support_Bloc1_Albion_Helper.html` (17 points + timing). À relire/personnaliser, puis à déposer sur DigiformaCertif.
4. **À vérifier côté administratif (hors repo)** : confirmation du dépôt Bloc 2 du 19/06, transmission du diplôme prérequis au campus, date exacte de l'oral Bloc 3 (17–21/08 ou 01–29/09). Le connecteur Gmail de Claude est expiré (ré-autoriser sur claude.ai pour que je puisse vérifier les mails).
