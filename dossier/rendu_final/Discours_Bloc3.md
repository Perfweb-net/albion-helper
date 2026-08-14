# Discours — Bloc 3 : Coordonner et piloter un projet de développement

**Support associé :** `Support_Bloc3_Albion_Helper_FINAL.pptx` (17 slides)
**Durée totale de l'épreuve :** 45 minutes — 30 min de présentation (≈22 min de discours + ≈8 min de démonstration live) + 15 min d'échanges avec le jury
**Candidat :** Pierre Saugues — M2 Expert en développement full-stack, YNOV — RNCP39583
**Projet :** Albion Helper, v3.3.1, en production sur https://oportaler.perfweb.net

Ce document est le script complet de l'oral, minuté slide par slide, à dire à la première personne. Les passages entre crochets `[...]` sont des indications de jeu (regarder le jury, cliquer, changer d'onglet) — ne pas les prononcer.

---

## Sommaire minuté

| Temps | Séquence |
|---|---|
| 0:00 – 0:30 | Slide 1 — Titre / accroche |
| 0:30 – 2:00 | Slide 2 — Le projet en une slide |
| 2:00 – 3:30 | Slide 3 — Méthodologie (Kanban) |
| 3:30 – 5:15 | Slide 4 — Planning détaillé |
| 5:15 – 6:30 | Slide 5 — Ressources |
| 6:30 – 8:30 | Slide 6 — Outil de suivi & indicateurs **(C3.2.1)** |
| 8:30 – 11:00 | Slide 7 — Cas d'arbitrage JWT **(C3.1)** |
| 11:00 – 12:30 | Slide 8 — Affectation des missions (RACI) |
| 12:30 – 14:15 | Slide 9 — Style(s) managérial(aux) |
| 14:15 – 15:30 | Slide 10 — Outils de communication |
| 15:30 – 16:45 | Slide 11 — Grille de compétences |
| 16:45 – 18:00 | Slide 12 — Plan de développement des compétences |
| 18:00 – 19:30 | Slide 13 — Comptes rendus des évolutions |
| 19:30 – 20:45 | Slide 14 — Indicateurs de satisfaction |
| 20:45 – 21:45 | Slide 15 — Démonstration (annonce) **(C3.4.2)** |
| 21:45 – 22:45 | Slide 16 — Conclusion |
| 22:45 – 31:00 | **Démonstration live** (≈8 min, 10 étapes) **(C3.4.2)** |
| 31:00 – 46:00 | Questions du jury (15 min) |

---

## Slide 1 — Titre (0:00 → 0:30)

Bonjour, je m'appelle Pierre Saugues, candidat au titre RNCP39583 « Expert en développement logiciel ». Je vous présente le bloc 3 : coordonner et piloter un projet de développement, à travers Albion Helper, une application compagnon pour le jeu Albion Online, aujourd'hui en version 3.3.1 et en production. J'ai 30 minutes, dont environ 8 de démonstration en direct, puis 15 minutes d'échanges. Je vais dérouler les points attendus par le règlement, en m'arrêtant plus longuement sur les trois compétences éliminatoires du bloc : planification, pilotage par les indicateurs, et démonstration.

---

## Slide 2 — Le projet en une slide (0:30 → 2:00)

Une slide de contexte avant d'entrer dans le pilotage. Albion Helper centralise pour les joueurs et les guildes des informations dispersées sur plusieurs sites communautaires : recherche de joueurs et de guildes avec statistiques PvP, historique des batailles, carte interactive multi-serveur avec routes de farming partageables, éditeur de compositions d'équipe, calculateur de craft avec prix du marché en temps réel, et un back-office d'administration complet — jusqu'à la gestion de 20 langues par le commanditaire lui-même.

Quatre repères chiffrés que je vais réutiliser : version actuelle 3.3.1 ; 177 tests automatisés — 53 back PHPUnit, 124 front Jest — tous verts et bloquants en intégration continue ; 12 066 objets référencés ; 20 langues administrables.

Un point qui structure toute la suite : l'authentification est désormais protégée par cookie httpOnly, depuis la version 3.1.0 — je vous raconterai dans quelques minutes l'arbitrage qui y a mené. La production est en ligne, déployée en continu, supervisée, avec 99,95 % de disponibilité sur les sept derniers jours. Durée du projet : février 2025 à septembre 2026. Recette : 29 scénarios, tous passés. Passons à la méthodologie.

---

## Slide 3 — Méthodologie choisie (2:00 → 3:30)

Premier point attendu : la méthodologie. J'ai retenu Kanban plutôt que Scrum ou le cycle en V. Ma disponibilité était variable, entre formation et alternance : des sprints à capacité fixe auraient été artificiels. En solo, les cérémonies d'équipe — daily, rétrospective — n'ont pas d'objet ; Kanban n'en impose aucune. Le cycle en V a été écarté pour une autre raison : le périmètre dépend d'une API tierce, celle d'Albion Online, qui évolue sans préavis — il fallait pouvoir re-prioriser en continu, ce qu'un périmètre figé après conception ne permet pas.

J'ai construit un flux à cinq colonnes : Backlog, À faire, En cours avec une limite stricte de deux cartes simultanées, Recette, Fait. Cette limite garantit qu'aucune fonctionnalité commencée n'a été abandonnée sur les dix-huit mois du projet. Et quand la re-priorisation sécurité de juin 2026 est arrivée — j'y reviens en détail juste après —, c'est ce même cadre qui l'a absorbée sans casser le planning global.

---

## Slide 4 — Planning détaillé (3:30 → 5:15)

Deuxième point : le planning détaillé. Ma méthode est un rétroplanning classique : je pars des jalons non négociables — les dates de dépôt de certification — et je remonte pour dimensionner chaque phase. Six phases. Phase 1, cadrage et socle technique, février 2025. Phase 2, fonctionnalités cœur : authentification, joueurs, guildes, carte — la phase la plus longue, celle des fondations. Phase 3, fonctionnalités avancées : routes partagées, compositions, craft, administration.

Phase 4, qualité, sécurité et recette, avec deux jalons dans la même fenêtre : le dépôt du bloc 2 tenu le 19 juin 2026, et la migration de Symfony 7.2, en fin de vie, vers la 7.4 LTS — trente-six advisories de sécurité corrigées d'un coup, dont une vulnérabilité élevée. Phase 5, internationalisation et multi-serveur, avec le passage à 20 langues. Phase 6, supervision et mise en production, qui couvre les jalons des blocs 4 et 3, avec la version courante, la 3.3.1.

Chaque phase est découpée en lots livrables, estimés en jours-homme, qui deviennent des cartes Kanban. L'outil qui porte ce planning, c'est GitHub Projects : gratuit, hébergé avec le code, lié aux commits et aux tickets — une carte se ferme avec le code qui la réalise. Je vous le montrerai en direct tout à l'heure.

---

## Slide 5 — Ressources nécessaires (5:15 → 6:30)

Troisième point : les ressources. Côté humain, je porte seul six casquettes : back, front, ops/CI, qualité, sécurité, documentation. Deux parties prenantes externes : des joueurs testeurs pour la recette d'usage, et mes encadrants YNOV pour les jalons.

Côté matériel : un poste de développement, un VPS de production chez perfweb.net avec Nginx, PHP-FPM, PostgreSQL 16, et GitHub qui centralise sources, intégration continue, veille de sécurité via Dependabot, et suivi de projet.

Côté financier, le budget infrastructure tourne autour de 135 euros par an. Mais le vrai coût du projet, c'est la charge de développement : environ 85 jours-homme, majorés de 10 % de marge, soit 94 jours-homme, valorisés à environ 37 600 euros au tarif journalier de 400 euros. C'est cette charge que tout mon pilotage protège en priorité, parce qu'elle est irrécupérable si elle est mal engagée.

---

## Slide 6 — Outil de suivi & indicateurs (6:30 → 8:30) — Compétence éliminatoire C3.2.1

Quatrième point, et première compétence éliminatoire : C3.2.1, piloter l'avancement en définissant des outils de suivi adaptés et en communiquant sur des indicateurs clés.

Le suivi opérationnel repose sur GitHub Projects : chaque fonctionnalité ou bug devient une carte, liée à ses commits. L'historique Git en Conventional Commits — `feat:`, `fix:`, `test:` — est à lui seul un journal de bord exploitable. Et l'intégration continue rejoue les 177 tests à chaque poussée de code, avant tout déploiement.

[Je montrerai ce tableau et le dernier run d'intégration continue en direct dans quelques instants.]

J'ai retenu sept indicateurs sur les cinq axes attendus, plus la disponibilité. Avancement : 29 scénarios de recette sur 29 passés. Qualité : 177 tests à 100 %, bloquants en CI. Délais : jalons tenus, blocs 1, 2 et 4 déjà déposés. Déploiement : chaîne continue vérifiée verte, migrations et sonde de supervision incluses. Coûts : environ 135 euros consommés sur 150 prévus. Risques : zéro vulnérabilité critique ouverte. Disponibilité : 99,95 % sur sept jours, mesurée par une double supervision que je détaillerai en démonstration.

Ces indicateurs ne sont pas produits pour cet oral : ce sont des mesures continues qui ont guidé des décisions réelles — celle que je vais vous présenter maintenant en est l'illustration directe.

---

## Slide 7 — Cas d'arbitrage rencontré (8:30 → 11:00) — Compétence éliminatoire C3.1

Cinquième point, et c'est ici que je traite en profondeur C3.1 : planifier l'exécution du projet en clarifiant les responsabilités et en assurant une bonne coordination — cet arbitrage est directement une question de planification sous contrainte.

En juin 2026, pendant la revue de sécurité du bloc 2, j'ai identifié que le jeton d'authentification était stocké dans le `localStorage` du navigateur — vulnérable en cas de faille XSS. L'alternative, un cookie httpOnly, est plus sûre sur ce point précis, mais imposait de refondre l'authentification à dix jours du dépôt du jalon.

J'ai comparé les deux options sur quatre critères : risque XSS, risque CSRF — qui s'inverse entre les deux —, coût immédiat, risque planning. Garder le `localStorage` avec mitigations coûtait un jour-homme, sans risque sur le jalon. Basculer vers le cookie httpOnly coûtait quatre à cinq jours-homme, plus une recette complète, et menaçait directement la date du 19 juin.

J'ai tranché pour la première option, avec contrepartie : mitigations immédiates — durée de vie du jeton ramenée à une heure, rotation des jetons de rafraîchissement, en-têtes de sécurité renforcés — et inscription formelle de la migration au backlog, comme axe d'amélioration documenté. Le jalon a été tenu ; le risque résiduel tracé et accepté, pas ignoré.

Voici la partie que je veux mettre en avant : cet axe d'amélioration n'est pas resté un vœu pieux. Il a été replanifié dans la phase 5, budgété, et livré en version 3.1.0. Aujourd'hui, le jeton est en cookie httpOnly, une protection anti-CSRF a été ajoutée, et l'authentification refondue sans régression — recette repassée à 29 sur 29.

Ce que je veux que vous reteniez : décider vite sous contrainte, tracer la dette plutôt que la cacher, la refermer dans les règles au cycle suivant. C'est ma définition opérationnelle de la planification — pas un plan figé qu'on subit, mais un cadre qui absorbe l'imprévu sans perdre la mémoire de ce qu'il a fallu reporter.

---

## Slide 8 — Affectation des missions (11:00 → 12:30)

Sixième point : l'affectation des missions. En solo, cela consiste à affecter mes six casquettes à des créneaux horaires distincts, et à déléguer à l'outillage ce qui peut l'être.

J'ai construit une matrice RACI complète. Je réalise et j'approuve le développement, en m'appuyant sur la documentation officielle et la communauté. L'intégration et le déploiement continus sont délégués à GitHub Actions — je suis seulement informé par notification. La veille de sécurité des dépendances est déléguée à Dependabot, avec mon approbation après lecture de l'avis CVE. La recette fonctionnelle m'est réservée sur un créneau dédié, distinct du créneau développement, avec les joueurs testeurs consultés en amont. La validation des jalons de certification appartient au jury et au campus YNOV.

La règle d'hygiène la plus importante : ne jamais porter deux casquettes en même temps sur le même créneau. Les créneaux qualité sont séparés des créneaux développement, pour garder un regard critique sur mon propre code. Sur le handicap, point explicite du référentiel : cette organisation écrite et asynchrone est nativement compatible avec des aménagements de rythme ou d'accessibilité des outils.

---

## Slide 9 — Style(s) managérial(aux) (12:30 → 14:15)

Septième point : les styles managériaux — directif, persuasif, participatif et délégatif. J'ai mobilisé les quatre. Directif envers moi-même sur les normes non négociables : Conventional Commits, hook de pré-commit, tests obligatoires avant fusion. Délégatif envers l'outillage : intégration continue, veille de dépendances, sondes de supervision — objectif fixé, exécution autonome, contrôle par les alertes. Participatif avec les utilisateurs : les retours des joueurs testeurs, via Discord, ont priorisé le multi-serveur et l'internationalisation. Persuasif vers le commanditaire, pour justifier mes choix — l'arbitrage JWT en est l'exemple.

Une analyse critique honnête : en juin 2026, j'ai exécuté toute la recette du bloc 2 en une seule session, en fin de phase. Trois anomalies sont sorties tardivement — BUG-011 à 013 — corrigées dans l'urgence le jour même. Mon analyse : un défaut de management de mon propre planning, ma casquette qualité sous-dotée en créneaux ; en équipe, cela équivaudrait à négliger un collaborateur. J'ai corrigé dès les phases suivantes : recette au fil de l'eau à chaque lot, créneau qualité hebdomadaire sanctuarisé. En équipe : un rôle qualité identifié dès le lancement, associé aux revues.

---

## Slide 10 — Outils de communication (14:15 → 15:30)

Huitième point : les outils de communication. Git et les commits conventionnels, pour les développeurs, tracent chaque évolution avec son intention. Le CHANGELOG, en versionnage sémantique, communique les évolutions en langage fonctionnel pour utilisateurs et commanditaire. GitHub — tickets, pull requests, tableau de projet — porte la discussion asynchrone de l'équipe et archive les décisions. L'e-mail porte la communication formelle avec le campus et le jury, et surtout les alertes de supervision. Discord, enfin, est le canal de la communauté de joueurs testeurs, pour recueillir des besoins réels.

L'objectif transverse : tout passe à l'écrit et à l'asynchrone. Bénéfices : charge de communication répartie, sans réunionite, et un bénéfice d'accessibilité que je souligne explicitement — un membre d'équipe en situation de handicap auditif aurait accès à cent pour cent de l'information, sans aménagement supplémentaire.

---

## Slide 11 — Grille d'évaluation des compétences (15:30 → 16:45)

Neuvième point : l'évaluation des besoins en compétences, via une grille formelle. Je me suis auto-évalué en février 2025, sur une échelle de 1 à 4, en face des besoins du projet. L'écart le plus fort concernait la sécurité applicative : niveau 1 pour un niveau 3 requis. C'est aujourd'hui l'écart le mieux comblé, niveau atteint 3 à 4, avec la livraison de l'authentification httpOnly comme preuve tangible.

Sur l'intégration continue, de 1 à 3, avec un pipeline complet vérifié vert. Sur la supervision, de 1 à 3, avec UptimeRobot et une sonde interne opérationnelles. Sur la gestion de projet, 2-3, avec Kanban et rétroplanning tenus dix-huit mois. Sur l'accessibilité RGAA, 2-3, avec un score Lighthouse de 98 sur 100 — un point encore perfectible, et je l'assume.

---

## Slide 12 — Plan de développement des compétences (16:45 → 18:00)

Dixième point, découlant de la grille précédente. Pour la sécurité OWASP, une auto-formation guidée par la documentation officielle, appliquée en auditant mon propre projet faille par faille — réalisée entre juin et août 2026. Pour Symfony avancé, des cours SymfonyCasts au fil du projet. Pour l'accessibilité RGAA, une formation courte certifiante prévue sur 2026-2027. Pour l'outillage front moderne et l'exploitation avancée, deux chantiers d'apprentissage par la pratique en 2027 : migration vers Vite, conteneurisation de la production.

Principe directeur : chaque formation est adossée à un chantier réel, avec un livrable vérifiable — l'exemple le plus abouti étant la migration JWT httpOnly, passée de préconisation à réalisation. Les modalités e-learning et asynchrones privilégiées sont par nature adaptables à une situation de handicap.

---

## Slide 13 — Comptes rendus des évolutions (18:00 → 19:30)

Onzième et douzième points ensemble : les comptes rendus, et les points de validation. Je tiens mes comptes rendus à trois niveaux. Commanditaire : le CHANGELOG versionné, de la v1.0.0, le socle, jusqu'à la 3.3.1 actuelle, en passant par la 3.1.0, qui porte la migration httpOnly, et la 3.2.0, activation de compte et reset de mot de passe par e-mail. Équipe : l'historique Git conventionnel, compte rendu détaillé, ordonné et daté sans effort supplémentaire. Certification : les dossiers de jalon, blocs 2 et 4.

Sur les points de validation : recette complète, 29 sur 29 ; audit sécurité, zéro alerte ouverte ; audit accessibilité, Lighthouse 98 sur 100, zéro violation bloquante ; dépôt du bloc 2 le 19 juin 2026, jalon tenu ; dépôt du bloc 4 le 24 juillet 2026, jalon tenu ; migration httpOnly, réalisée. Le seul point encore ouvert, c'est celui d'aujourd'hui : cette démonstration devant vous.

---

## Slide 14 — Indicateurs de satisfaction (19:30 → 20:45)

Treizième point, dernier avant la démonstration. Six indicateurs, chacun mesurant directement une dimension de la satisfaction. Taux de réussite de la recette, qui encode les attentes du commanditaire : 29 sur 29. Disponibilité du service, première cause d'insatisfaction pour un outil communautaire : 99,95 % sur sept jours, double supervision. Temps de réponse de l'API, pour le confort en session de jeu : environ 0,8 seconde. Qualité perçue de l'interface : Lighthouse 98 en accessibilité, 96 en bonnes pratiques. Anomalies signalées : 16 bugs et une observation, tous traités à 100 %, tous tracés. Adoption des nouveautés, mesurée par le journal des recherches par serveur et par langue.

---

## Slide 15 — Démonstration, annonce (20:45 → 21:45) — Compétence éliminatoire C3.4.2

J'arrive à la dernière compétence éliminatoire, C3.4.2 : réaliser une démonstration à partir de la dernière version développée, pour obtenir la validation du commanditaire avant livraison.

Je vais vous faire vivre un parcours complet, sur la production réelle, à l'adresse oportaler.perfweb.net, avec des données réelles préchargées — pas un environnement artificiel. Neuf étapes : découverte et inscription, connexion et tableau de bord, recherche de joueur, guildes et batailles, carte interactive, itinéraire partagé, composition d'équipe, calculateur de craft, multi-langue et administration.

J'ai un plan de secours en cas de problème réseau : un environnement local identique, prêt à basculer. J'ai répété cette démonstration la veille, chronométrée. L'objectif n'est pas de montrer que le code fonctionne, c'est de montrer que la dernière version est fonctionnelle, fiable, utilisable par un joueur non technicien, et d'obtenir votre validation avant livraison.

[Transition : ouvrir l'onglet de production, basculer en mode démonstration.]

---

## Slide 16 — Conclusion (21:45 → 22:45)

Avant la démonstration, quatre points de conclusion. Tous les jalons de certification tenus, malgré une re-priorisation sécurité majeure, absorbée par le rétroplanning et Kanban. Un projet traçable de bout en bout : chaque évolution a sa carte, son commit typé, sa ligne de CHANGELOG, son scénario de recette. Un arbitrage tenu dans la durée : la migration httpOnly, différée en juin 2026, livrée en v3.1.0. Des indicateurs chiffrés à chaque niveau — avancement, qualité, délais, coûts, risques, satisfaction.

Le logiciel présenté aujourd'hui est en production, déployé en continu, supervisé et maintenu. La démonstration qui suit vise votre validation, en tant que commanditaire, avant livraison.

---

# Démonstration live (22:45 → 31:00, ≈8 minutes)

*Consigne de jeu : vocabulaire orienté commanditaire pendant toute la démonstration — ne jamais dire « JWT », « API », « localhost », « back-end », « repository ». Dire « le compte », « le serveur », « l'application », « la base de données du jeu ».*

### Étape 1 — Accueil public (≈0:45)

[Ouvrir https://oportaler.perfweb.net en plein écran.]

« Voici ce que découvre un joueur en arrivant sur Albion Helper. L'outil est utilisable immédiatement, dans sa langue. » [Montrer le sélecteur de langue, passer de français à anglais.] « L'interface est administrable dans vingt langues. » [Montrer le sélecteur de serveur de jeu, Europe vers Amériques.] « Et comme Albion Online tourne sur plusieurs serveurs de jeu indépendants, tout ce que je vais montrer s'adapte au serveur sélectionné. »

### Étape 2 — Inscription (≈0:45)

[Créer un compte de démonstration neuf, avec des identifiants préparés à l'avance.]

« Je crée un compte de test en direct. » [Saisir volontairement un mot de passe trop court pour déclencher le message d'erreur.] « Vous voyez que l'application guide l'utilisateur plutôt que de le laisser deviner ce qui ne va pas. » [Corriger et valider.]

### Étape 3 — Connexion et tableau de bord (≈0:45)

[Se connecter avec le compte créé.]

« Le tableau de bord centralise les raccourcis vers les fonctions principales. Un tutoriel de prise en main est proposé automatiquement au tout premier accès, pour accompagner un joueur qui découvre l'outil. »

### Étape 4 — Recherche de joueur (≈1:00)

[Rechercher un joueur connu, préparé à l'avance, ouvrir sa fiche.]

« Voici sa fiche complète : équipement, statistiques de combat, victoires, défaites, rapport de session. » [Montrer le détail d'un rapport de session.] « Ces informations étaient auparavant dispersées sur plusieurs sites communautaires différents ; ici, elles sont réunies au même endroit. »

### Étape 5 — Guildes et batailles (≈0:45)

[Ouvrir une guilde préparée, puis l'historique de ses batailles, détailler une bataille.]

« Un chef de guilde prépare ainsi ses stratégies, en analysant les batailles passées de sa guilde comme de ses adversaires. »

### Étape 6 — Carte et itinéraire partagé (≈1:15)

[Ouvrir la carte, naviguer entre deux ou trois zones.]

« Voici la carte interactive du monde du jeu. » [Créer un itinéraire de farming, générer le lien de partage.] « Je génère maintenant un lien de partage. » [Ouvrir ce lien dans une fenêtre de navigation privée, pour montrer qu'aucune connexion n'est requise.] « Le destinataire de ce lien n'a pas besoin de compte pour le consulter — ce partage sans friction est au cœur de l'usage en guilde, où l'on prépare une sortie collective en quelques minutes. »

### Étape 7 — Composition d'équipe (≈0:45)

[Ouvrir une composition d'équipe préparée à l'avance.]

« Voici l'éditeur de compositions : les rôles de chaque joueur, les équipements recommandés. C'est l'outil de préparation d'une équipe avant une bataille organisée. »

### Étape 8 — Calculateur de craft (≈1:00)

[Choisir un objet du jeu, montrer le calcul de rentabilité.]

« L'application calcule la rentabilité de fabrication de cet objet, avec les prix du marché du serveur actuellement sélectionné, mis à jour en temps réel. » [Montrer l'infobulle qui explique un prix indisponible.] « Et quand une donnée de marché manque, l'application explique pourquoi, plutôt que d'afficher un simple vide — c'est un point sur lequel nous étions déjà revenus lors du bloc 4, dans le traitement du support utilisateur. »

### Étape 9 — Administration (≈1:00)

[Se déconnecter, se reconnecter avec un compte administrateur.]

« Je bascule maintenant sur un compte administrateur. » [Montrer le tableau de bord des statistiques d'usage, la gestion des utilisateurs, la gestion des langues de l'interface.] « Le commanditaire administre entièrement son outil — utilisateurs, contenus, langues — sans avoir besoin d'une intervention technique de ma part. »

### Étape 10 — Conclusion de la démonstration (≈0:30)

[Revenir sur la page d'accueil ou sur le tableau de bord de supervision, selon ce qui a été préparé.]

« Cette version que vous venez de voir manipuler est celle qui tourne en production, déployée en continu, supervisée vingt-quatre heures sur vingt-quatre avec alerte automatique en cas d'indisponibilité, maintenue et documentée. Je vous propose, en tant que commanditaire de ce projet, de valider cette version pour sa livraison. »

[Revenir au support pour la conclusion, ou enchaîner directement sur les questions selon le déroulé du jury.]

---

# Check-list veille d'oral

**Données de démonstration à préparer et vérifier la veille :**
- [ ] Un compte joueur standard déjà existant, avec un historique riche (recherches, favoris) pour l'étape 3.
- [ ] Un identifiant de joueur connu et « intéressant » (bon historique PvP) prêt à saisir pour l'étape 4.
- [ ] Une guilde active avec un historique de batailles récent pour l'étape 5.
- [ ] Un itinéraire de démonstration déjà créé (ou à créer en direct) + vérifier que la génération de lien public fonctionne, et tester ce lien en navigation privée avant l'oral.
- [ ] Une composition d'équipe déjà enregistrée, prête à ouvrir pour l'étape 7.
- [ ] Un objet du jeu dont le calcul de craft est intéressant à montrer (rentable, avec au moins un prix manquant pour illustrer l'infobulle) pour l'étape 8.
- [ ] Identifiants d'inscription neufs (adresse e-mail jetable ou dédiée) prêts pour la création de compte en direct à l'étape 2 — vérifier qu'ils n'ont pas déjà été utilisés lors de la répétition.
- [ ] Compte administrateur opérationnel, mot de passe vérifié.
- [ ] Serveur de jeu sélectionné cohérent avec les données ci-dessus (Europe ou Amériques, à fixer et ne pas changer entre la préparation et l'oral).

**Onglets de navigateur à ouvrir avant de commencer (dans cet ordre, prêts en arrière-plan) :**
1. Ce support de présentation (PDF ou PowerPoint en mode présentateur).
2. La production : https://oportaler.perfweb.net, sur la page d'accueil, déconnecté.
3. GitHub Actions — l'historique des runs d'intégration continue, filtré sur les runs récents, pour montrer un run vert.
4. GitHub Projects — le tableau Kanban du projet, sur la vue par colonnes.
5. UptimeRobot — le tableau de bord public ou le moniteur du projet, avec le pourcentage de disponibilité visible.
6. Le CHANGELOG.md du dépôt, à la version courante.
7. Un environnement local identique (plan B), lancé et fonctionnel en arrière-plan, avec une base pré-remplie.

**Autres vérifications la veille :**
- [ ] Répétition générale chronométrée : 22 minutes de discours + 8 minutes de démonstration, dans les conditions réelles (même machine, même connexion si possible).
- [ ] Vérifier que la production répond correctement : ouvrir `/api/health` ou équivalent, confirmer un statut opérationnel.
- [ ] Recharger ou vérifier fraîcheur des données de démo (un itinéraire vieux de plusieurs mois est moins convaincant qu'un itinéraire récent).
- [ ] Vérifier la batterie et la connexion réseau du poste de présentation ; prévoir un partage de connexion mobile en secours.
- [ ] Relire une dernière fois le dossier écrit du bloc 3 déposé (s'il y en a un), pour rester cohérent entre écrit et oral.
- [ ] Dépôt du support sur la plateforme de certification effectué **avant l'échéance**, pas le jour même.

---

# Conseils de livraison

**Sur le rythme et le ton**
- Parler plus lentement que ce qui semble naturel : sous le stress, le débit accélère de façon quasi systématique. Viser environ 130 mots par minute, pas plus.
- Marquer une vraie pause après chaque chiffre clé (177 tests, 99,95 %, 29/29) — le silence d'une seconde donne au jury le temps de l'noter mentalement.
- Ne jamais lire le support mot à mot : le regard doit aller au jury, pas à l'écran. Le support est un support visuel pour le jury, pas un prompteur.

**Sur les trois compétences éliminatoires**
- Nommer explicitement les compétences au moment où elles sont traitées (« j'aborde ici la compétence C3.1... ») : cela aide le jury à cocher ses grilles d'évaluation en temps réel, et montre une maîtrise du référentiel plutôt qu'une récitation.
- Sur C3.1 (planification) et C3.2.1 (pilotage), toujours revenir à des faits datés et vérifiables plutôt qu'à des généralités — le cas d'arbitrage JWT est l'exemple central à ne jamais raccourcir, même si le temps presse.
- Sur C3.4.2 (démonstration), ne pas se précipiter : mieux vaut montrer sept étapes bien maîtrisées que neuf étapes bâclées. Si le temps manque en direct, sacrifier en priorité l'étape 7 (composition d'équipe), la plus redondante avec l'étape 6.

**Sur la gestion des imprévus pendant la démonstration**
- Si une page charge lentement : combler par du discours plutôt que par du silence (« pendant que ça charge, je précise que... »).
- Si une fonctionnalité affiche un comportement inattendu : ne jamais paniquer à l'écran ; nommer calmement ce qui se passe et rebondir sur le plan B local si nécessaire — un incident géré avec sang-froid est un point positif pour le pilotage, pas un point négatif.
- Garder en tête l'anecdote de l'incident réel de supervision (la crontab effacée par le script de déploiement, corrigée et documentée au CHANGELOG v3.3.1) : c'est une excellente réponse de secours si le jury demande « et si ça tombait en panne pendant l'oral ? ».

**Sur les 15 minutes de questions**
- Répondre d'abord en une phrase directe, puis développer si le jury relance — éviter les réponses qui repartent dans un monologue de deux minutes sur une question fermée.
- Si une question sort du périmètre préparé, ne pas improviser une réponse approximative : il est plus solide de dire « je n'ai pas creusé ce point spécifique, mais voici comment je l'aborderais » que d'inventer un chiffre.
- Garder sous la main (mentalement) les trois chiffres qui reviennent le plus souvent en question : 177 tests, 99,95 % de disponibilité, 94 jours-homme de charge — ils couvrent qualité, exploitation et coût, les trois angles que les jurys interrogent le plus.
