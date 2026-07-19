# Suivi RNCP39583 — Albion Helper
> Fichier de suivi UNIQUE de la certification. Reconstruit le **2026-07-14** à partir des 4 documents officiels, chaque case re-vérifiée dans le repo/prod ce jour.
> ☑ = vérifié le 14/07 · ☐ = à faire · ⚠️ ÉLIM = compétence éliminatoire (une seule non-acquise = bloc invalidé)

Sources officielles (dans `doc/`, ne pas modifier) :
- `Référentiel Expert en développement logiciel RNCP39583 (3).pdf` (compétences + critères d'évaluation)
- `25 09 15  Réglement spécial de certification… (3).pdf` (livrables exacts + éliminatoires — listes re-pointées le 14/07, le présent fichier les couvre toutes)
- `25-26 Modalités_Evaluations_Titre EDL RNCP39583_YNOV_M2… (3).pdf` (dates + DigiformaCertif)
- `24 10 10 Grille évaluation Expert en développement logiciel (3).xlsx` (grille du jury)

## Règles de validation (règlement §2)

- Bloc validé si **≥ 50% des compétences acquises** ET **aucune éliminatoire non-acquise**
- La certification = validation des **4 blocs**
- Dépôt obligatoire sur **DigiformaCertif** (https://ynov.mycertif.app) dans les délais — livrables **ET** supports de présentation — sinon bloc invalidé automatiquement
- **Rattrapage** : accessible uniquement si **moins de 50 % des blocs sont invalidés** (donc 1 bloc raté max)
- **Diplôme/titre prérequis** : à transmettre au campus, sinon non-présentation au jury — **à confirmer que c'est fait**
- ⚠️ Oral Bloc 3 : le planning mentionne **17–21/08/2026 (S34)** ou **01–29/09** « selon le campus » — **date exacte toujours pas confirmée** (si août : préparation urgente dès maintenant)

| Bloc | Épreuve | Date | État au 14/07 |
|---|---|---|---|
| Bloc 2 | Dossier écrit 30p max + code source | ~~08–19/06~~ **décalé — date à confirmer** | 🟢 **dossier v3 prêt** (`Dossier_Bloc2_Albion_Helper_v3.docx`, 15/07 — skill docx, XML validé, corps 28 pages + 4 pages d.annexes) — relire, mettre à jour le sommaire dans Word, déposer |
| Bloc 4 | Dossier écrit 20p max | **20–24/07/2026** | **J-6** — prod redéployée ✅ (19/07) ; reste UptimeRobot + relecture |
| Bloc 3 | Oral 45' (30'+15') + démo live | 17–21/08 ou 01–29/09 | 🟠 support prêt (pptx), reste kanban + prod + répétitions |
| Bloc 1 | Oral 30' (20'+10') | Rentrée oct. 2026 | 🟡 support prêt (pptx), reste relecture + répétitions |

---

# 🚨 BLOC 4 — Maintenir l'application en condition opérationnelle (dossier à déposer 20–24/07 : J-6)

## Compétences

### C4.1.1 — Mise à jour des dépendances
- [x] Outils en place : Dependabot actif (composer + npm + GitHub Actions), `composer audit` 0 advisory, mise à jour majeure réalisée (Symfony 7.4 LTS, 12/06)
- [x] Processus documenté : fréquence, périmètre, auto+manuel (dossier Bloc 4 §2)

### C4.1.2 — Système de supervision et d'alerte ⚠️ ÉLIM
- [x] Sonde applicative : endpoint `/api/health` public (statut DB + API Albion) — présent dans le code
- [x] Canal Monolog `incident` dédié (dev + prod)
- [x] Indicateurs définis avec cibles : dispo ≥99%, réponse <1s, détection ≤5 min, 5xx <1% (dossier §3.1)
- [x] Système décrit avec schéma : 2 sondes, /api/health détaillé, signalements, journaux (dossier §3)
- [x] ~~🚨 BLOQUANT : `/api/health` renvoie 404 en prod~~ **RÉSOLU le 19/07** : VPS réinstallé (18/07), `master` poussé (`f97c7ddc`), `deploy/deploy.sh` exécuté en SSH (migrations + build front + sonde cron) — `curl https://albion-back.perfweb.net/api/health` → **200 `"status":"OK"`** (DB + API Albion OK). Reste à brancher les secrets GitHub Actions pour la CD automatique (déploiement manuel SSH opérationnel en attendant). ~~⚠️ deux sondes cron coexistaient~~ → ancienne sonde `/usr/local/bin/albion-healthcheck-probe.sh` retirée de la crontab le 19/07, seule celle du repo reste
- [x] Sonde externe **créée le 19/07** : monitor UptimeRobot keyword sur https://albion-back.perfweb.net/api/health — incident si le mot-clé `ERROR` apparaît (plus fiable que « OK disparaît » : les services sains gardent leur `"status":"OK"` en panne partielle), check 5 min, alerte e-mail vers contact@perfweb.net (notification de test reçue), statut Up ✅
- [ ] **Capture UptimeRobot à insérer dans le dossier §3.4** — la prendre après quelques heures d'historique d'uptime (dashboard.uptimerobot.com/monitors)
- [x] Sonde interne **automatisée le 14/07** : `deploy.sh` (ré)installe la crontab (*/5) de `healthcheck-probe.sh` à chaque déploiement (commit `1af1a572`) — elle sera posée sur le VPS au prochain déploiement, plus rien à faire à la main
- [x] Alerte e-mail automatique **ajoutée et déployée le 19/07** : `/api/health` envoie le détail des services en erreur à `ALERT_EMAIL` (anti-spam : 1 mail max/30 min via cache) — Brevo configuré en prod (SMTP, expéditeur `no-reply@perfweb.net` vérifié DKIM/DMARC, 300 mails/jour gratuits), envoi réel testé depuis le VPS

### C4.2.1 — Consignation des anomalies ⚠️ ÉLIM
- [x] Processus documenté : 6 canaux, cycle consignation→qualification→correctif→re-test, grille gravité/priorité (dossier §4)
- [x] Fiche normalisée 11 champs (dossier §4.3)
- [x] Exemplaire réel rempli : BUG-011 + registre BUG-001→013

### C4.2.2 — Création et déploiement de correctifs
- [x] Correctifs réels disponibles (BUG-001→008, pipeline CI qui valide)
- [x] Traitement de BUG-011 en 9 étapes via la CI/CD (dossier §5)

### C4.3.1 — Axes d'amélioration
- [x] 7 recommandations chiffrées en effort, adossées aux constats d'audit (dossier §7)

### C4.3.2 — Journal des versions ⚠️ ÉLIM
- [x] CHANGELOG.md tenu et à jour : **entrée v3.0.0 ajoutée le 14/07** (multi-serveur, stats PvP, batailles, craft localisé, 20 langues, thème fantasy) — commit `770787d8`
- [ ] Vérifier que l'exemplaire du journal cité dans le dossier Bloc 4 est celui à jour (v3.0.0) à la relecture

### C4.3.3 — Collaboration avec le support client
- [x] Cas support rédigé (prix N/A Brecilien), infobulle réellement implémentée dans Craft.jsx (dossier §8)

## Livrable Bloc 4 — dossier 20 pages max (liste officielle re-pointée le 14/07 : 8 points, tous couverts)

- [x] 1. Description du processus de mise à jour des dépendances
- [x] 2. Description du système de supervision
- [x] 3. Description du processus de collecte et de consignation des anomalies
- [x] 4. Présentation d'une fiche de consignation d'une anomalie
- [x] 5. Présentation du traitement d'une anomalie détectée
- [x] 6. Présentation des recommandations argumentées d'amélioration
- [x] 7. Présentation d'un exemplaire du journal de version *(à rafraîchir après ajout v3.0.0)*
- [x] 8. Exemple de problème résolu en collaboration avec le support client
- [x] **15/07 : dossier v2 généré** → `dossier/Dossier_Bloc4_Albion_Helper_v2.docx` (v1 conservée) — skill docx, 13 pages/20, XML validé. Faits à jour : 131 tests, sonde auto-installée + log d'exécution réel, journal →v3.1.0, registre BUG-001→016, traitement BUG-011 & BUG-016, runbook d'alerte, §3.4 honnête (UptimeRobot spécifié, « à activer avec la remise en production »)
- [ ] **DERNIÈRES ÉTAPES** : ① ~~redéployer la prod~~ ✅ fait le 19/07 (SSH ; secrets GitHub pour la CD auto encore à créer) → ② activer le monitor UptimeRobot (spec dans le dossier §3.4) → ③ relire le docx v2 dans Word (sommaire) → ④ **déposer sur DigiformaCertif entre le 20 et le 24/07**

---

# 🟠 BLOC 3 — Coordonner et piloter le projet (oral 17–21/08 ou 01–29/09 — date à confirmer)

> Support : `dossier/Support_Bloc3_Albion_Helper.html` (v1 du 06/07) + export **`Support_Bloc3_Albion_Helper.pptx`** (07/07, non commité). Couvre les 14 points du règlement + script de démo en annexe A.

## Compétences

### C3.1 — Planification ⚠️ ÉLIM
- [x] Méthodologie justifiée avec bénéfices : Kanban adapté solo (slide 3)
- [x] Planning détaillé en phases/lots : rétroplanning 6 phases + Gantt calé sur les vraies dates git (slide 4)
- [x] Ressources nécessaires identifiées (humaines, financières, matérielles) (slide 5)
- [x] Tâches assignées selon les compétences : RACI adapté solo + handicap (slide 8)

### C3.2.1 — Pilotage et indicateurs ⚠️ ÉLIM
- [x] Indicateurs mesurables : avancement, coûts, délais, risques, RH (slide 6)
- [ ] **Outil de suivi à matérialiser** : créer le tableau GitHub Projects (Backlog/À faire/En cours/Recette/Fait) et y reporter les lots réels — le support le présente, il doit exister pour l'oral (~30 min)
- [ ] Tableau de bord présentable au jury (GitHub Projects + dernier run CI ouverts en direct — annexe B)

### C3.2.2 — Arbitrages
- [x] Cas d'arbitrage rédigé : JWT localStorage vs cookie httpOnly, options chiffrées, logigramme, décision (slide 7)

### C3.3.1 — Management d'équipe
- [x] Affectation des missions + délégation à l'outillage (slide 8)
- [x] 4 styles managériaux mappés sur le contexte solo (slide 9)
- [x] Outils de communication + objectifs, handicap pris en compte (slide 10)
- [x] Analyse critique d'une situation managériale (recette tardive de juin) (slide 9)

### C3.3.2 — Compétences de l'équipe
- [x] Grille d'évaluation des compétences (7 lignes, initial/requis/atteint) (slide 11)
- [x] Plan de développement des compétences + formations, modalités handicap (slide 12)

### C3.4.1 — Comptes rendus et validation client
- [x] Comptes rendus d'évolutions : CHANGELOG + commits conventionnels + dossiers de jalon (slide 13) *(cohérence : ajouter v3.0.0 au CHANGELOG, cf. Bloc 4)*
- [x] Planification des points de validation réalisés (tableau daté, slide 13)
- [x] Indicateurs de satisfaction définis (slide 14)

### C3.4.2 — Démonstration du logiciel ⚠️ ÉLIM
- [x] Logiciel utilisable — **re-vérifié le 14/07 : back PHPUnit OK (31 tests, 85 assertions), front Jest 95/95 verts**
- [x] Script de démo en 10 étapes, vocabulaire commanditaire (annexe A)
- [x] Conclusion orientée validation du commanditaire (slide 15 + étape 10)
- [ ] **Environnement de démo** : prod redéployée le 19/07 (front https://oportaler.perfweb.net + back /api/health → 200 OK, reset de mot de passe par e-mail fonctionnel) — reste : précharger les données, répéter la veille (check-list annexe B)

## Livrable Bloc 3 — oral 45' (les 14 points du règlement sont couverts par le support)

- [ ] Relire/personnaliser le support (vérifier les chiffres ; ajouter captures GitHub Projects et CI une fois créés)
- [ ] Créer le tableau GitHub Projects réel (cf. C3.2.1)
- [ ] Redéployer la prod + préparer les données de démo (cf. Bloc 4)
- [ ] Répétition chronométrée (30' + démo ~8', 15' de questions)
- [ ] Commiter les `.pptx` (actuellement non suivis par git)
- [ ] **Déposer le support sur DigiformaCertif avant l'échéance** (date exacte à confirmer avec le campus)

---

# 🟡 BLOC 1 — Cadrer le projet (oral rentrée octobre)

> Support : `dossier/Support_Bloc1_Albion_Helper.html` (v1 du 06/07) + export **`Support_Bloc1_Albion_Helper.pptx`** (07/07, non commité). Couvre les 17 points du règlement + timing d'oral en annexe.
> Point d'attention : le commanditaire est présenté comme « une communauté/guilde de joueurs » — vérifier que cette fiction cadre avec ce qui a été dit au campus.

## Compétences

### C1.1.1 — Cartographie des parties prenantes ⚠️ ÉLIM
- [x] Acteurs + rôles + implication + lecture pouvoir×intérêt (slide 3)

### C1.1.2 — Analyse de la demande
- [x] Besoins par partie prenante, objectifs, enjeux, problématique, 3 pistes dont celle retenue (slides 2 & 4)

### C1.2.1 — Opportunités et menaces
- [x] SWOT complet + vigilance (impact environnemental, sécurité, API du jeu) (slide 5)

### C1.2.2 — Faisabilité technique ⚠️ ÉLIM
- [x] Démarche d'audit en 3 volets (slide 6)
- [x] Diagnostic infra existante + contraintes techniques et financières (slide 7)
- [x] Avis critique sur la faisabilité (slide 7)

### C1.2.3 — Cartographie des risques
- [x] 6 risques priorisés (probabilité × impact) avec mesures (slide 8)
- [x] Référentiel d'évaluation + suivi des incidents (registre réel BUG-001→013) (slide 9)
- [x] Indicateurs de contrôle (6 indicateurs chiffrés) (slide 9)

### C1.3.1 — Veille technologique
- [x] Méthodologie 3 niveaux + sources + outils + preuve d'efficacité (migration 7.4 LTS) (slide 10)

### C1.3.2 — Étude comparative des solutions ⚠️ ÉLIM
- [x] Comparatif 4 briques sur les 5 critères exigés + ressources identifiées (slide 11)

### C1.4.1 — Charge de travail ⚠️ ÉLIM
- [x] Diagramme de fonctionnalités MoSCoW (F1→F6) + méthode + UX (slide 12)
- [x] Charge en j-h par lot (85 + 10 % ≈ 94 j-h), méthode par analogie (slide 13)

### C1.4.2 — Estimation des coûts
- [x] Budget prévisionnel par postes (dev 37,6 k€ TJM 400 €, infra 270 €/2 ans) (slide 13)

### C1.5 — Architecture logicielle
- [x] Schéma C4 conteneurs, méthode justifiée, propriétés (slide 14) — *option : ajouter un schéma C4 contexte*

### C1.6 — Préconisations au client ⚠️ ÉLIM
- [x] Préconisation en 3 temps, discours vulgarisé, 4 objections traitées (slide 15)

## Livrable Bloc 1 — oral 30' (les 17 points du règlement sont couverts par le support)

- [ ] Relire/personnaliser (chiffres de charge et TJM à assumer ; valider la présentation du commanditaire)
- [ ] Répétition chronométrée 20' (timing en annexe du support)
- [ ] **Déposer le support sur DigiformaCertif avant l'échéance** (date exacte : rentrée octobre, à confirmer)

---

# 🟢 BLOC 2 — Concevoir et développer des applications logicielles (**date décalée — à confirmer avec le campus**)

**15/07 : dossier v3 généré avec le skill docx officiel** → `dossier/Dossier_Bloc2_Albion_Helper_v3.docx` — **c'est la version à déposer** (v1 et v2 conservées pour trace). Validation OOXML PASSED, **18 pages** vérifiées par conversion PDF (max 30), A4, sommaire Word natif, pied de page numéroté. Contenu : 13 figures neuves (app v3.0.0 : multi-serveur, batailles, rapport de session PvP, 20 langues, thème clair), 126 tests (31 back/95 front), CHANGELOG v3.0.0, 9 séquences de déploiement (sonde auto), recette 28 scénarios (SRV-01 et BAT-01 ajoutés), registre BUG-001→015. Les 16 points du règlement sont couverts. **15/07 (suite)** : corps porté à 28 pages (parcours utilisateur, captures mobile, organisation du code, secrets, scénarios d'échec de déploiement, pyramide de tests, RGPD, git log, sauvegarde BDD) + 4 pages d'annexes (code, CI/CD avec captures GitHub, sorties d'outillage) ; registre étendu à BUG-016 (cascade de suppression de compte, corrigée par migration). ⚠️ Vérifier avec le campus si les annexes comptent dans les 30 pages (total : 32).

- C2.1.1 environnements ☑ · C2.1.2 CI ☑ · C2.2.1 prototype ⚠️ÉLIM ☑ · C2.2.2 tests ⚠️ÉLIM ☑ (15/07 : back 35 tests/98 assertions, front 96/96 — 131 au total) · C2.2.3 sécurité/accessibilité ⚠️ÉLIM ☑ (OWASP faille par faille + **JWT en cookies httpOnly réalisés en v3.1.0 le 15/07** + RGAA 4.1 + audits + correctif contrastes mode clair) · C2.2.4 versions ☑ · C2.3.1 cahier de recettes ⚠️ÉLIM ☑ (28 scénarios PASS) · C2.3.2 plan de correction ☑ (BUG-001→015) · C2.4.1 documentation ☑
- [ ] **Relire le dossier v3 dans Word** : mettre à jour le sommaire (clic droit → Mettre à jour les champs) et parcourir le rendu
- [ ] **Confirmer la nouvelle date de dépôt avec le campus** puis déposer code + dossier v3 sur DigiformaCertif

---

# 🔧 Corrections techniques restantes (état au 14/07 soir)

**Point CI/CD clarifié le 14/07** : la **CI (tests) fonctionne** — workflow `main.yml` actif sur GitHub, derniers runs verts le 12/06 (rien poussé depuis). La **CD n'a jamais fonctionné** : le job deploy a échoué le 12/06 avec `Error: missing server host` car **aucun secret GitHub n'est créé** (`gh secret list` vide). D'où la prod obsolète.

- [ ] **Pousser `develop`** — ~28 commits locaux non poussés (dont la repasse UI et le dossier v2 du 14/07) ; l'historique git est une preuve C2.2.4
- [ ] **Commiter** `dossier/Support_Bloc1_Albion_Helper.pptx` + `Support_Bloc3_Albion_Helper.pptx` (non suivis)
- [ ] **Brancher la CD** : ① créer les secrets GitHub Actions (`SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH`, `SSH_PORT` optionnel), ② pousser develop→master (`git push origin develop:master`), ③ le job deploy fera tout (code + migrations + build + sonde cron). Alternative sans secrets : SSH manuel + `sh deploy/deploy.sh`
- [ ] **Branche par défaut GitHub toujours `main`** — aligner (défaut → master, supprimer main) ou adapter deploy.sh/CI à main
- [x] ~~CHANGELOG v3.0.0 manquant~~ — ajouté le 14/07 (commit `770787d8`)
- [x] **Repasse UI du 14/07** (demande Pierre) : mode clair réparé (variables CSS thémées — BUG-015), visite guidée corrigée (textes coupés, z-index, i18n), CTA espacés, header regroupé en sous-menus Exploration/Outils, clé i18n craft réparée (BUG-014) — 4 commits, 95/95 tests verts
- [x] npm audit front : 57 vulnérabilités restantes = chaîne de build react-scripts (dev only) — risque accepté documenté ; migration Vite en axe d'amélioration (C4.3.1)
- [x] Justification localStorage rédigée dans le dossier Bloc 2 (§7.1)

# 📋 Administratif (hors repo — à confirmer)

- [ ] Confirmation du dépôt Bloc 2 sur DigiformaCertif (19/06)
- [ ] Transmission du diplôme prérequis au campus
- [ ] Date exacte de l'oral Bloc 3 (17–21/08 ou 01–29/09) — conditionne l'urgence de la préparation
- Note : le connecteur Gmail de Claude est expiré — le ré-autoriser sur claude.ai permettrait de vérifier les mails de confirmation

# 🔎 Vérifications du 14/07/2026 (base de cette version du suivi)

1. **Règlement re-pointé** : les listes officielles (16 points Bloc 2, 8 points Bloc 4, 14 points Bloc 3, 17 points Bloc 1) et les éliminatoires (C1.1.1, C1.2.2, C1.3.2, C1.4.1, C1.6 / C2.2.1, C2.2.2, C2.2.3, C2.3.1 / C3.1, C3.2.1, C3.4.2 / C4.1.2, C4.2.1, C4.3.2) correspondent bien à ce fichier.
2. **Tests verts** : back PHPUnit `OK (31 tests, 85 assertions)`, front Jest 12 suites / 95 tests (re-vérifiés après la repasse UI).
3. ~~**Prod toujours obsolète** : `/api/health` → 404 en prod~~ → **résolu le 19/07** : VPS réinstallé, déploiement SSH réussi, `/api/health` → 200 OK (tests re-vérifiés au passage : back 49, front 115).
4. ~~CHANGELOG figé à v2.1.0~~ → **corrigé** : entrée v3.0.0 ajoutée.

# 🔎 Session du 14/07 (soir) — travaux réalisés

- **Dossier Bloc 2 v2** généré (`dossier/Dossier_Bloc2_Albion_Helper_v2.docx`, ancien conservé) avec 13 figures neuves prises sur l'app v3.0.0 lancée en local (sources dans `dossier/v2/`).
- **Repasse UI complète** à la demande de Pierre : mode clair (BUG-015), visite guidée, CTA, header en sous-menus, clé i18n craft (BUG-014). 4 commits conventionnels, tests verts.
- **CHANGELOG v3.0.0** + **sonde de supervision auto-installée par deploy.sh** (2 commits).
- Env local : Postgres via Docker (`back/compose.yaml`), back `symfony serve` (8000), front `npm start` (3000) — mot de passe local du compte `admin` réinitialisé pour la session de captures.

# 🔎 Session du 15/07 (après-midi) — migration sécurité + retours correcteur

- **JWT passés en cookies httpOnly (v3.1.0)** : back (lexik `set_cookies` + gesdinet `cookie`, routes `/api/me` et `/api/logout`, CORS credentials) + front (plus AUCUN jeton dans localStorage, session via `/api/me`, refresh automatique sur 401). Cycle complet vérifié en réel : login → cookies posés → recherche → admin → logout → 401. **131 tests verts** (35 back / 96 front). La réserve potentielle du jury sur le localStorage est devenue un point fort du dossier (§7.1).
- **Retours correcteur intégrés au dossier** : limite 30 pages STRICTE annexes comprises → **29 pages** ; tableau explicite des composants d'environnement (§4.1) ; mention brouillon du sommaire retirée ; AUTH-08 ajouté à la recette.
- CHANGELOG v3.1.0 publié. Avant dépôt : ouvrir dans Word, mettre à jour le sommaire, exporter en PDF et **re-vérifier le nombre de pages dans Word** (rendu LibreOffice ±1 page).
