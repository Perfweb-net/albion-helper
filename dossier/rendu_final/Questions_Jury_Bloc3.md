# Banque de questions probables du jury — Bloc 3 (Coordonner et piloter un projet)

> **Document privé de préparation candidat.** Ne pas diffuser, ne pas déposer comme livrable de certification.
> RNCP39583 — Expert en développement logiciel — Albion Helper — Oral 45 min (30 min de présentation dont ~8 min de démo live + 15 min de questions).
> Basé sur `Support_Bloc3_Albion_Helper.html`, le règlement spécial de certification (compétences C3.1 à C3.4.2) et les faits à jour du projet au 14/08/2026.

## Règles d'or pour répondre

1. Répondre d'abord en une phrase directe (le fait, le chiffre, le oui/non), puis développer — ne jamais noyer le jury dans le contexte avant la réponse.
2. Toujours ancrer la réponse dans un fait vérifiable et chiffré du projet (date, version, nombre) plutôt que dans une généralité de cours.
3. Sur les questions pièges : admettre le point faible en une phrase, puis enchaîner immédiatement sur la mesure corrective prise — jamais se justifier avant d'admettre.
4. Sur le sujet « solo » : ne jamais éviter la question, toujours transposer explicitement (« en équipe, cela aurait donné... ») — c'est précisément ce que le jury évalue.
5. Rester dans le rôle pendant la démo : le jury est mon commanditaire — vocabulaire fonctionnel, jamais de jargon technique (JWT, API, localhost) sauf question technique explicite du jury.

---

## 1. C3.1 — Planifier l'exécution du projet ⚠️ ÉLIMINATOIRE

**Q1. Pourquoi avoir choisi Kanban plutôt que Scrum pour ce projet, alors que Scrum est la méthode la plus enseignée ?**

**Réponse :** Le facteur déterminant est ma disponibilité variable, en alternance formation/développement — des sprints à capacité fixe auraient été artificiels sans équipe pour absorber les creux. Kanban en flux continu, avec les colonnes Backlog → À faire → En cours (WIP = 2) → Recette → Fait, me permet de caler la cadence sur des jalons imposés (dépôts de certification) plutôt que sur des itérations théoriques. Le périmètre fonctionnel dépend aussi d'une API tierce, celle d'Albion Online, qui évolue hors de mon contrôle, ce qui rend la re-priorisation permanente plus utile qu'un backlog de sprint figé. La preuve que ce choix tient : la re-priorisation sécurité de juin 2026 (migration Symfony 7.4 LTS, correctifs OWASP) a été absorbée sans casser le planning, et les jalons Bloc 2 et Bloc 4 ont tous deux été tenus à date.

**Q2. Un cycle en V n'aurait-il pas mieux convenu à un projet aussi cadré par des jalons de certification ?**

**Réponse :** Non, parce que le cycle en V suppose un périmètre figé validé en amont, alors que mon périmètre dépend directement de l'API Albion Online, que je ne contrôle pas et qui évolue. J'aurais dû geler des spécifications que je n'étais pas en mesure de garantir stables dans le temps. Les jalons de certification fixent des dates, pas un contenu figé — c'est une logique de rétroplanning où les dates sont fixes et le contenu s'ajuste, l'inverse du cycle en V où le contenu est fixe et la date en découle. Kanban me donne la flexibilité de contenu nécessaire tout en gardant, via le rétroplanning en 6 phases, la rigueur de dates qu'un cycle en V aurait aussi apportée.

**Q3. Comment avez-vous construit le rétroplanning en 6 phases ? Sur quoi vous êtes-vous appuyé pour l'estimation ?**

**Réponse :** Je suis parti des jalons non négociables — dépôts DigiformaCertif (19/06 pour le Bloc 2, 24/07 pour le Bloc 4, oral de septembre) — et j'ai remonté le calendrier en amont, en découpant le travail en 6 phases : cadrage/socle, fonctionnalités cœur, fonctionnalités avancées, qualité/sécurité/recette, i18n/multi-serveur, supervision/maintenance. Chaque phase est ensuite découpée en lots livrables — les cartes Kanban — estimés en jours-homme par analogie avec les lots déjà réalisés, faute de pouvoir calibrer seul une méthode paramétrique. L'estimation initiale du Bloc 1 était d'environ 85 jours-homme, et la consommation réelle avoisine 80 j-h, ce qui valide a posteriori la méthode par analogie.

**Q4. Quels sont les livrables concrets de chaque phase de votre rétroplanning ?**

**Réponse :** Phase 1 pose le socle technique ; la phase 2 livre l'authentification, la recherche joueurs/guildes et la carte ; la phase 3 ajoute les routes de farming, les compositions d'équipe, le craft et l'administration ; la phase 4, en juin 2026, concentre la recette complète (29 scénarios), l'audit de sécurité OWASP et la migration Symfony 7.4 LTS — c'est le jalon Bloc 2 du 19/06 ; la phase 5 livre le multi-serveur et l'i18n complète (v3.0.0, début juillet) ; la phase 6 couvre la supervision, l'authentification par cookies httpOnly (v3.1.0) et va jusqu'au jalon Bloc 4 du 24/07 et à l'incident de supervision corrigé le 14/08. Chaque phase se clôt sur une entrée CHANGELOG datée et versionnée, qui me sert de preuve de livraison.

**Q5. Comment répartissez-vous et ordonnancez-vous les activités sans équipe à qui déléguer ?**

**Réponse :** J'ordonnance par la limite de travail en cours du Kanban — WIP = 2 en colonne « En cours » — ce qui m'oblige à terminer avant de commencer, exactement le rôle qu'aurait un lead d'équipe limitant le travail parallèle de ses développeurs. L'ordonnancement suit aussi une règle de dépendance technique : le socle avant les fonctionnalités, la sécurité avant l'exposition publique d'un composant sensible comme l'authentification. Ce que je ne peux pas faire moi-même dans le flux, je le délègue à l'outillage : la CI joue le rôle du testeur qui valide chaque livraison, Dependabot joue le rôle du veilleur sécurité. Concrètement, aucune fonctionnalité commencée n'a été abandonnée en cours de route depuis la mise en place du WIP = 2.

**Q6. Votre planning a-t-il connu du retard ? Comment l'avez-vous géré ?**

**Réponse :** Oui, la re-priorisation sécurité de juin 2026 — audit OWASP et migration Symfony 7.2 (EOL) vers 7.4 LTS, 36 advisories corrigées dont une CVE élevée — n'était pas prévue au planning initial et a consommé du temps sur la phase 4. Je l'ai absorbée sans décaler le jalon du 19/06 en resserrant le périmètre de la phase 5, un arbitrage rendu possible par le flux Kanban plutôt qu'un sprint figé. Le seul décalage réellement visible dans mon historique est la recette groupée en fin de phase 4 plutôt qu'étalée, qui a produit 3 anomalies découvertes tardivement (BUG-011 à 013) — j'y reviens en détail sur le management. Le fait que les jalons Bloc 2 (19/06) et Bloc 4 (24/07) aient tous deux été tenus à date malgré cet aléa est mon indicateur de tenue des délais.

**Q7. Quelles ressources aviez-vous identifiées comme nécessaires et comment les avez-vous mobilisées ?**

**Réponse :** Côté humain, une seule personne portant six casquettes — back, front, ops/CI, QA, sécurité, documentation — plus deux parties prenantes mobilisées ponctuellement : les joueurs testeurs pour la recette d'usage via Discord, et les encadrants YNOV pour la validation des jalons. Côté matériel, un poste de développement et un VPS de production Nginx/PHP-FPM/PostgreSQL 16 chez perfweb.net, plus l'écosystème GitHub gratuit (sources, CI/CD, Dependabot, Projects). Côté financier, le budget infrastructure réel tourne autour de 135 € par an, le reste de l'outillage étant sur des offres gratuites. La vraie ressource critique reste le temps : environ 80 jours-homme consommés sur les 85 estimés, soit environ 32 k€ valorisés à un TJM junior de 400 €.

**Q8. Si vous deviez refaire ce planning aujourd'hui, avec le recul, que changeriez-vous ?**

**Réponse :** Je sanctuariserais un créneau QA hebdomadaire dès la phase 1 plutôt qu'à partir de la phase 5 — la recette groupée de juin 2026 a montré que la casquette QA était sous-dotée en créneaux dédiés, ce qui a produit trois anomalies découvertes tardivement. Je programmerais aussi une revue de sécurité intermédiaire dès la phase 2, plutôt qu'une seule grande revue en phase 4, pour lisser la charge plutôt que la concentrer sur un jalon. Ce sont des ajustements de discipline personnelle, pas de méthode : Kanban et le rétroplanning en 6 phases ont bien rempli leur rôle, la marge de progrès est dans la répartition interne de mon propre temps entre casquettes.

---

## 2. C3.2.1 — Piloter l'avancement et les indicateurs ⚠️ ÉLIMINATOIRE

**Q9. Quel est votre outil de suivi de projet et pourquoi celui-là plutôt qu'un outil dédié type Jira ou Trello ?**

**Réponse :** J'utilise GitHub Projects, un tableau Kanban natif où chaque carte — fonctionnalité ou bug — est liée directement aux commits et issues qui la réalisent, hébergé au même endroit que le code. Je l'ai préféré à Jira ou Trello parce que ce sont des outils tiers déconnectés du code : dupliquer l'information entre un outil de gestion et le dépôt aurait été une charge de saisie sans valeur sur un projet solo. La carte se ferme automatiquement quand le commit ou la pull request qui la réalise est fusionné, donc le tableau ne peut pas dériver de la réalité du code. Et c'est gratuit, ce qui compte dans un budget infra de 135 €/an.

**Q10. Quels indicateurs suivez-vous pour piloter avancement, délais, coûts, qualité et risques ?**

**Réponse :** Pour l'avancement, le taux de scénarios de recette PASS — 29/29 actuellement — et le taux de tests CI verts, 100 % sur 177 tests (53 back, 124 front), bloquants avant toute fusion. Pour les délais, la tenue des jalons : Bloc 2 déposé le 19/06/2026, Bloc 4 le 24/07/2026, tous deux à date. Pour les coûts, le budget infrastructure consommé (environ 135 € sur 150 € prévus par an) et la charge de développement consommée face à l'estimée (environ 80 j-h sur 85). Pour les risques, le nombre d'advisories de sécurité ouvertes via `composer audit` — 0 actuellement — et pour la qualité, les scores Lighthouse en production : 98/100 accessibilité, 96/100 bonnes pratiques.

**Q11. Comment mesurez-vous la vélocité sur un projet solo, sans équipe pour comparer les sprints ?**

**Réponse :** Je n'ai pas de vélocité au sens Scrum puisque je ne travaille pas en sprints, mais j'ai un proxy équivalent : le rythme de livraison de versions au CHANGELOG, avec leur contenu et leur date — dix versions livrées entre mai et août 2026, de v1.0.0 à v3.3.1. Ce débit observable me permet de repérer les ralentissements : la phase de sécurisation de juin 2026 a concentré plusieurs versions en quelques jours après une période plus dense en fonctionnalités. Je lis aussi mon historique Git en Conventional Commits par type — feat/fix/test/docs — pour objectiver dans quelle activité mon temps a été investi. En équipe, ce même indicateur se transposerait directement en vélocité par sprint mesurée en cartes fermées, la mécanique carte-commit restant identique.

**Q12. Avez-vous eu une dérive de délai constatée sur ce projet ? Comment l'avez-vous détectée ?**

**Réponse :** Oui, une dérive locale sur la phase 4 : la recette a été exécutée en une seule fois en fin de phase au lieu d'être étalée, produisant trois anomalies découvertes tardivement le 12 juin 2026 — BUG-011, 012, 013 — corrigées dans la journée. Je l'ai détectée en regardant mon tableau Kanban : la colonne Recette est restée vide toute la phase puis s'est remplie d'un coup juste avant le jalon, un goulot que le principe même de Kanban révèle. La dérive n'a pas touché le jalon final du 19/06, tenu, parce que la correction a été absorbée le jour même grâce au WIP limité qui évitait d'avoir d'autres chantiers ouverts en parallèle. À partir de la phase 5, la recette se fait au fil de l'eau à chaque lot, et le registre d'anomalies ne montre plus de pic de découverte tardive depuis.

**Q13. Comment communiquez-vous les indicateurs clés — à qui, à quelle fréquence ?**

**Réponse :** Au commanditaire, via le CHANGELOG versionné à chaque livraison, qui traduit les indicateurs techniques en langage fonctionnel. Aux parties prenantes techniques, l'historique Git en Conventional Commits sert de compte rendu continu, consultable sans réunion. Aux jalons de certification, des dossiers complets sont produits — Bloc 2 au 19/06, Bloc 4 au 24/07 — qui reprennent tous les indicateurs à date. Et en continu, deux systèmes de supervision — UptimeRobot avec alertes e-mail et une sonde cron interne — remontent la disponibilité en temps réel, avec un canal Monolog « incident » dédié.

**Q14. Le règlement demande de « garantir la performance du projet dans le respect des délais, de la qualité et des coûts » — comment le prouvez-vous concrètement au jury aujourd'hui ?**

**Réponse :** Sur les délais, les deux jalons de certification passés ont été tenus à date malgré un aléa de re-priorisation sécurité non planifié. Sur la qualité, 177 tests automatisés à 100 % verts, bloquants en CI, et 29 scénarios de recette à 100 % PASS avec un registre d'anomalies entièrement tracé. Sur les coûts, le budget infrastructure est resté dans l'enveloppe annuelle prévue et la charge de développement, environ 80 j-h, est proche de l'estimation initiale de 85 j-h. Je peux vous les montrer en direct : le tableau GitHub Projects, le dernier run CI vert, et le CHANGELOG sont ouverts dans mes onglets pour cet oral.

**Q15. Qu'est-ce qui vous a permis de garantir la qualité dans le respect des délais plutôt que l'un au détriment de l'autre ?**

**Réponse :** Le garde-fou technique, c'est la CI bloquante : aucune fusion de code n'est possible si un des 177 tests échoue, donc je ne peux pas sacrifier la qualité pour tenir une date sans m'en rendre compte immédiatement. Le garde-fou méthodologique, c'est le WIP limité à 2 : je ne peux pas ouvrir de nouveaux chantiers avant que les précédents soient fermés, donc la pression de délai se traduit par une re-priorisation explicite du contenu — comme l'arbitrage JWT de juin 2026 — plutôt que par du travail bâclé accumulé. La contrepartie honnête, c'est que la casquette QA a par moments été la variable d'ajustement, comme le montre la recette groupée de juin, et c'est précisément ce que j'ai corrigé en sanctuarisant un créneau QA hebdomadaire ensuite.

**Q16. Le tableau GitHub Projects que vous allez nous montrer ne semble couvrir qu'une petite partie de l'historique — pourquoi ?**

**Réponse :** Le tableau reflète l'état courant du flux Kanban — un outil de suivi de l'avancement en cours, pas une archive figée : une fois une carte validée par son commit, sa valeur de suivi diminue face à celle du CHANGELOG et de l'historique Git, conçus pour l'archivage complet et daté. Je m'appuie donc sur trois niveaux complémentaires : GitHub Projects pour le flux en cours, l'historique Git en Conventional Commits pour le détail complet et daté, et le CHANGELOG pour la synthèse fonctionnelle par version. Dupliquer l'intégralité de l'historique dans le tableau Kanban n'aurait apporté aucune valeur de pilotage supplémentaire par rapport au Git.

---

## 3. C3.2.2 — Présenter un cas d'arbitrage rencontré

**Q17. Présentez-nous le cas d'arbitrage JWT : quel était le problème exactement ?**

**Réponse :** En juin 2026, lors de la revue de sécurité du Bloc 2, j'ai identifié que le jeton JWT était stocké dans le localStorage du navigateur, exposé à un vol en cas de faille XSS. L'alternative techniquement supérieure, un cookie httpOnly, neutralise ce risque puisque le jeton devient invisible au JavaScript, mais imposait de refondre l'authentification côté API et côté front à environ dix jours du dépôt du jalon Bloc 2. Le dilemme était classique en pilotage : un risque de sécurité réel mais non exploité à ce jour, contre un risque de délai certain sur un jalon non négociable. J'ai dû trancher entre ces deux risques avec un outil d'aide à la décision plutôt qu'à l'instinct.

**Q18. Comment avez-vous structuré votre décision — quel outil d'aide à la décision avez-vous utilisé ?**

**Réponse :** J'ai construit un logigramme à trois questions : le risque est-il exploitable aujourd'hui — non, aucune XSS connue et une CSP déjà en place ; le coût de mitigation immédiate représente-t-il moins de 20 % du coût de la refonte complète — oui, environ 1 jour-homme contre 4 à 5 ; la refonte menace-t-elle le jalon — oui, elle mettait en péril le dépôt du 19/06. J'ai aussi chiffré les deux options sur une matrice risque XSS / risque CSRF / coût / risque planning pour objectiver la comparaison plutôt que trancher au ressenti. Ce cadre m'a permis une décision traçable et justifiable a posteriori — exactement ce qu'un manager doit pouvoir présenter à son commanditaire.

**Q19. Quelle décision avez-vous prise, et l'assumez-vous encore aujourd'hui ?**

**Réponse :** J'ai conservé le localStorage à court terme avec des mitigations immédiates — durée de vie du jeton ramenée à 1 heure, rotation des refresh tokens à usage unique, en-têtes CSP renforcés — et j'ai inscrit la migration vers les cookies httpOnly au backlog comme axe d'amélioration documenté au dossier Bloc 2. Le jalon du 19/06 a été tenu et le risque résiduel a été tracé et accepté en connaissance de cause : la définition même d'un arbitrage assumé plutôt que subi. Je l'assume d'autant plus que ce n'était pas un renoncement, mais un report priorisé avec un engagement écrit de réalisation.

**Q20. Cet arbitrage a-t-il eu des conséquences négatives ensuite ?**

**Réponse :** Aucune conséquence négative constatée : aucune exploitation XSS n'a été détectée pendant la fenêtre de juin à juillet 2026 où le risque résiduel était actif, ce que confirment mes journaux Monolog du canal incident. La seule conséquence a été la charge de travail supplémentaire, prévue et acceptée, pour réaliser la migration ensuite. Ce que je retiens, c'est que l'arbitrage a évité un risque plus grave : une refonte précipitée à J-10 d'un jalon aurait pu introduire des régressions non testées sur l'authentification, un composant critique.

**Q21. Ce cas d'arbitrage a-t-il eu une suite ? Qu'est-il devenu ?**

**Réponse :** Oui, et c'est l'élément dont je suis le plus fier dans ce dossier : la migration vers les cookies httpOnly a été réalisée en v3.1.0, le 15 juillet 2026, un mois après l'arbitrage. Le jeton d'accès et le refresh token ne transitent plus par le localStorage, ils sont posés et lus exclusivement par l'API en cookies httpOnly et Secure, ce qui neutralise la classe d'attaque XSS-vol de jeton. J'ai traité en contrepartie le risque CSRF que le cookie introduit, via `allow_credentials` et une liste d'origines fermée en CORS, et réécrit la gestion de session front autour d'une route `/api/me`. La préconisation du Bloc 2 est donc devenue une réalisation vérifiable en production — l'arbitrage se transforme en preuve de suivi réel plutôt qu'en promesse de dossier.

**Q22. Avez-vous rencontré d'autres arbitrages significatifs sur le projet ?**

**Réponse :** Oui, la migration de Symfony 7.2, en fin de vie, vers 7.4 LTS en juin 2026, qui corrigeait 36 advisories dont une CVE élevée. L'arbitrage suivait le même schéma — risque de sécurité réel contre risque de régression sur une base de code déjà volumineuse — mais j'ai pu m'appuyer sur mes 177 tests automatisés comme filet de sécurité pour valider la migration sans re-tester manuellement chaque fonctionnalité, ce qui a réduit le coût de l'arbitrage par rapport au cas JWT. C'est cet arbitrage-là qui illustre le mieux pourquoi j'investis dans la CI : elle transforme des arbitrages risqués en arbitrages rapides.

---

## 4. C3.3.1 — Management d'équipe et styles managériaux

**Q23. Vous êtes seul sur ce projet. Comment le jury peut-il évaluer votre « management d'équipe » ?**

**Réponse :** Je le rends évaluable en formalisant ce qui, en équipe, resterait implicite : un RACI qui distingue mes casquettes des tâches déléguées à l'outillage, les quatre styles managériaux appliqués à des interlocuteurs réels — moi-même, l'outillage, les joueurs testeurs, le commanditaire — et une analyse critique d'une vraie situation de gestion défaillante, la recette groupée de juin 2026, avec les mesures correctives que j'aurais prises envers un collaborateur. Le jury évalue ma capacité à structurer, arbitrer et faire progresser une organisation projet, pas seulement à motiver des personnes physiques ; je démontre cette capacité sur mes deux seuls leviers réels. Enfin, chaque outil présenté est explicitement transposable : je dis à chaque étape comment il se comporterait avec une équipe de plusieurs personnes.

**Q24. Concrètement, à quoi ressemble le style « directif » quand on se l'applique à soi-même ?**

**Réponse :** Ce sont des règles non négociables que je m'impose sans discussion possible : les Conventional Commits sur chaque commit, un hook pre-commit qui bloque le lint et les contrôles de sécurité avant même de proposer un commit, et des tests obligatoires avant toute fusion. La différence avec une simple bonne pratique, c'est le caractère bloquant et automatisé — le hook et la CI m'empêchent physiquement de contourner la règle sous le coup d'une échéance, comme un manager directif fixerait un cadre non négociable à un développeur junior. En équipe, ce style se transposerait à l'identique sur les standards de code, avec les mêmes outils automatisés, ce qui prouve que ce n'est pas de la discipline personnelle occasionnelle mais un vrai système managérial.

**Q25. Et le style « délégatif » envers des outils — est-ce vraiment du management ?**

**Réponse :** Oui, parce que le style délégatif consiste à fixer un objectif et un cadre puis laisser l'exécution autonome avec un contrôle a posteriori — exactement le contrat que j'ai avec GitHub Actions (objectif : aucune régression ne doit passer, exécution autonome à chaque push, contrôle par le résultat rouge/vert) et avec Dependabot (objectif : aucune dépendance vulnérable ne doit rester en place, contrôle par les pull requests proposées). L'outil ne négocie pas le cadre, mais le principe managérial de délégation avec contrôle par les résultats est identique à celui appliqué à un collaborateur humain. La preuve que ce n'est pas un abus de langage : `composer audit` est aujourd'hui à 0 advisory et la CI est verte à 100 % sur 177 tests — des résultats de délégation mesurables, pas des vœux pieux.

**Q26. Comment gérez-vous un conflit sur un projet où vous êtes seul développeur ?**

**Réponse :** Le conflit le plus réel que j'ai eu à gérer n'était pas interne mais avec ma communauté de beta-testeurs sur Discord : en juin 2026, la re-priorisation sécurité imposée par l'audit OWASP a repoussé des fonctionnalités qu'ils attendaient, créant de la frustration exprimée directement dans le salon dédié. Je l'ai géré en combinant deux styles — persuasif pour expliquer pourquoi la sécurité passait devant, avec des arguments concrets (36 advisories, une CVE élevée) plutôt qu'un simple « faites-moi confiance » — et participatif, en les associant à la nouvelle priorisation pour savoir quelles fonctionnalités reportées ils voulaient voir revenir en premier. Le résultat concret : le multi-serveur et l'i18n complète, qu'ils réclamaient, sont arrivés dès la version suivante, v3.0.0 début juillet, ce qui a désamorcé la tension parce que le report avait une échéance visible. En équipe, ce mécanisme se transposerait à un conflit de priorisation entre développeurs, avec la même logique : expliquer le pourquoi, associer à la solution, donner une échéance vérifiable.

**Q27. Racontez-nous une situation de management qui s'est mal passée, et ce que vous en avez tiré.**

**Réponse :** En juin 2026, j'ai exécuté la recette complète en une seule fois en fin de phase 4 au lieu de l'étaler, ce qui a produit trois anomalies découvertes tardivement — BUG-011, 012 et 013 — corrigées dans l'urgence le jour même. Mon analyse critique est sans complaisance : c'est un défaut de management de mon propre planning, la casquette QA étant sous-dotée en créneaux dédiés par rapport aux casquettes de développement ; en équipe, cela équivaudrait à négliger systématiquement un collaborateur. J'ai appliqué deux corrections durables : la recette au fil de l'eau à chaque lot livrable dès la phase 5, et un créneau QA hebdomadaire sanctuarisé. En équipe, la même erreur se corrigerait en identifiant un rôle QA dès le début du projet et en l'associant aux revues de code.

**Q28. Le règlement demande de « prendre en compte les personnes en situation de handicap dans le management » — comment le traitez-vous alors que vous êtes seul ?**

**Réponse :** Mon organisation de communication est construite en mode 100 % asynchrone et écrit — Git, CHANGELOG, issues, e-mail — ce qui la rend nativement compatible avec des aménagements de handicap sans redesign a posteriori : rythme adaptable, accessibilité totale de l'information pour une personne malentendante puisque rien ne repose sur une réunion orale. Sur le produit, l'accessibilité RGAA 4.1 est traitée en continu — audit du 12 juin 2026 corrigeant 47 curseurs sans étiquette, contraste relevé de 1,8:1 à 4,5:1 — avec des scores Lighthouse actuels de 98/100 en accessibilité et 0 violation bloquante axe-core. Si demain je recrute, cette organisation asynchrone n'a pas besoin d'être adaptée pour intégrer un collaborateur en situation de handicap, elle l'est déjà par construction — un choix managérial préventif plutôt que réactif.

**Q29. Votre RACI solo a-t-il vraiment un sens si vous êtes « R », « A » et parfois « C » en même temps ?**

**Réponse :** Le RACI garde un sens parce qu'il ne décrit pas des personnes différentes mais des rôles différents, et je m'impose une règle d'hygiène précise pour ne jamais fusionner ces rôles dans le temps : je ne porte jamais deux casquettes simultanément, mes créneaux QA sont physiquement séparés de mes créneaux de développement, pour garder un regard critique sur mon propre code. Là où le RACI solo prend tout son sens, c'est sur les lignes où le « R » n'est pas moi mais l'outillage — CI pour l'intégration continue, Dependabot pour la veille sécurité — ce qui matérialise une vraie délégation. Et sur la validation des jalons de certification, le « A » n'est pas moi mais le jury et le campus YNOV — donc le RACI reflète une vraie séparation de responsabilités même en configuration solo.

**Q30. Comment évaluez-vous que votre « management de vous-même » a été efficace, avec quels indicateurs ?**

**Réponse :** Le premier indicateur est la tenue des jalons malgré les aléas : deux jalons de certification tenus à date malgré une re-priorisation sécurité non planifiée. Le deuxième est la stabilité de la qualité sous pression — 100 % des tests restent verts même dans les phases de rush, parce que la CI bloquante empêche toute dérogation à moi-même. Le troisième est plus qualitatif : pouvoir citer précisément un échec de mon propre management — la recette groupée de juin 2026 — avec sa cause racine et sa correction durable, ce qui est en soi un indicateur d'auto-évaluation sans complaisance. Un indicateur d'alerte que je surveille est le taux d'anomalies découvertes tardivement en recette — retombé à zéro depuis le passage à la recette au fil de l'eau.

**Q31. Quel style managérial avez-vous le plus de mal à mobiliser, en tant que développeur solo ?**

**Réponse :** Le style participatif est structurellement le plus difficile, parce qu'il suppose une équipe interne à consulter, et je n'en ai pas — je le mobilise donc uniquement à l'externe, avec mes joueurs testeurs sur Discord dont les retours ont orienté la priorisation du multi-serveur et de l'i18n. Ce n'est pas un participatif de plein exercice au sens du référentiel, qui vise en priorité l'équipe projet, et je l'assume : c'est la limite honnête de ma configuration solo. En équipe, ce style redeviendrait pleinement mobilisable sur les décisions d'architecture ou de priorisation internes, avec des rétrospectives que le Kanban solo ne prévoit pas puisqu'il n'y a personne avec qui les tenir.

**Q32. Si vous deviez recruter demain un premier développeur sur ce projet, quel style managérial adopteriez-vous avec lui et pourquoi ?**

**Réponse :** Je partirais d'un style directif limité au socle non négociable que j'applique déjà à moi-même — Conventional Commits, hook pre-commit, tests obligatoires — parce que ce sont des standards déjà éprouvés sur 177 tests, sans valeur à les renégocier avec chaque recrue. Au-delà, j'évoluerais vers un style persuasif puis participatif à mesure que la personne monterait en compétence, en m'appuyant sur la grille d'évaluation que j'ai déjà construite pour moi-même — directement réutilisable pour cadrer un plan de montée en compétence individualisé. Je délèguerais en priorité la casquette QA, identifiée dans mon propre dossier comme la plus fragile de ma gestion solo, ce qui répond directement à la faiblesse que j'ai moi-même diagnostiquée.

---

## 5. C3.3.2 — Évaluer les compétences de l'équipe

**Q33. Comment avez-vous évalué vos besoins en compétences sur ce projet ?**

**Réponse :** J'ai construit une grille d'auto-évaluation en sept lignes dès février 2025, au démarrage, comparant niveau initial, niveau requis par le projet et niveau atteint, sur une échelle de 1 (novice) à 4 (autonome expert) — PHP/Symfony, React, sécurité applicative OWASP, CI/CD, supervision, gestion de projet, accessibilité RGAA. L'écart le plus important identifié était la sécurité applicative, passée d'un niveau initial de 1 à un requis de 3, ce qui a justifié un plan de formation dédié. Cette grille n'est pas restée figée : je l'ai utilisée pour prioriser mes efforts de montée en compétence tout au long du projet, avec un niveau atteint aujourd'hui de 3 sur la sécurité, validé concrètement par l'audit OWASP et la migration Symfony 7.4 LTS que j'ai menés moi-même.

**Q34. Quel est l'écart de compétence le plus important que vous avez dû combler, et comment ?**

**Réponse :** La sécurité applicative OWASP, avec un niveau initial de 1 sur 4 contre un requis de 3. J'ai comblé cet écart par de l'auto-formation guidée sur la documentation officielle OWASP Top 10, appliquée immédiatement à un audit faille par faille de mon propre projet plutôt qu'en formation abstraite. Le résultat vérifiable, c'est l'ensemble des correctifs de sécurité de juin 2026 — CORS en liste fermée, rate limiting, headers de sécurité, rotation des refresh tokens, migration Symfony 7.4 LTS corrigeant 36 advisories dont une CVE élevée — et la réalisation ultérieure de la migration JWT vers les cookies httpOnly en juillet. Le niveau atteint aujourd'hui, 3 sur 4, n'est donc pas auto-déclaré, il est objectivé par ces livrables.

**Q35. Quel est votre plan de développement des compétences pour la suite du projet ?**

**Réponse :** J'ai identifié deux écarts encore ouverts et planifié leur traitement : l'accessibilité RGAA, au niveau 2 aujourd'hui contre un niveau visé de 3, avec une formation courte certifiante prévue en 2026-2027 ; et l'outillage front moderne, avec la migration de Create React App vers Vite prévue en 2027 comme apprentissage par la pratique sur un chantier réel du backlog. Le principe que j'applique systématiquement est d'adosser chaque formation à un chantier concret avec un livrable vérifiable, plutôt qu'une formation isolée. Les modalités choisies, e-learning et formations courtes asynchrones, sont aussi pensées pour rester adaptables à une situation de handicap.

**Q36. Cette grille de compétences, comment la présenteriez-vous si vous deviez l'appliquer à une équipe de plusieurs développeurs ?**

**Réponse :** La structure resterait identique — niveau initial, niveau requis, niveau atteint, commentaire — mais appliquée par ligne et par personne, ce qui permettrait de croiser les profils pour répartir les missions selon les points forts de chacun, par exemple confier la sécurité à la personne au niveau le plus élevé sur cet axe plutôt que d'y consacrer mon temps de formation personnel. Elle servirait aussi de base à des binômes de montée en compétence, une personne senior sur un axe accompagnant une personne plus junior, ce qu'un projet solo ne permet évidemment pas. Le plan de développement des compétences qui en découle deviendrait un plan collectif avec des échéances individualisées, construit sur le même principe d'adossement à des chantiers réels que j'applique déjà seul.

**Q37. Comment mesurez-vous que la montée en compétence a réellement eu lieu, et pas seulement que du temps a été passé en formation ?**

**Réponse :** Je ne valide jamais une montée en compétence par le temps investi mais par un livrable de production réel qui en dépend : la migration Symfony 7.4 LTS valide la montée en compétence sécurité, le pipeline CI/CD complet valide le passage de 1 à 3 sur cet axe, les audits d'accessibilité outillés valident la montée en compétence RGAA. Si la formation n'a pas produit de livrable vérifiable, je considère l'écart comme non comblé, même suivie — c'est ce qui explique que l'accessibilité RGAA reste à mon niveau 2 malgré des audits déjà menés : je ne me surestime pas tant qu'une formation certifiante n'a pas eu lieu. Cette exigence de preuve est la même que j'appliquerais à une équipe : un accès à une formation ne vaut rien sans un résultat mesurable qui en découle.

---

## 6. C3.4.1 — Comptes rendus, points de validation et satisfaction

**Q38. À qui rendez-vous compte, et avec quels supports différents selon le public ?**

**Réponse :** Trois niveaux de lecture pour trois publics : le CHANGELOG versionné en langage fonctionnel pour le commanditaire, qui veut savoir ce que l'application fait de nouveau, pas quel fichier a changé ; l'historique Git en Conventional Commits pour un public technique, qui donne le détail daté et typé de chaque évolution sans réunion de suivi ; et les dossiers de jalon complets — Bloc 2, Bloc 4 — pour la certification, qui reprennent un état des lieux exhaustif à une date donnée. Cette séparation évite l'écueil classique du rapport unique trop technique pour le commanditaire ou trop pauvre pour l'équipe technique.

**Q39. Quels points de validation avez-vous planifiés et quels résultats ont-ils donnés ?**

**Réponse :** Six points de validation planifiés et tous réalisés : la recette complète des 29 scénarios le 12/06/2026 (100 % PASS) ; l'audit de sécurité OWASP le même jour (0 advisory composer) ; l'audit d'accessibilité Lighthouse et axe-core, également le 12/06 ; le dépôt du dossier Bloc 2 le 19/06/2026 ; le dépôt du dossier Bloc 4 le 24/07/2026 ; et la démonstration devant vous aujourd'hui, dont l'objectif est votre validation en tant que commanditaire. Chaque point antérieur a un résultat objectif et daté, tracé dans le CHANGELOG et les dossiers correspondants, ce qui évite toute contestation a posteriori sur ce qui a réellement été validé et quand.

**Q40. Quels indicateurs de satisfaction avez-vous mis en place, côté commanditaire et côté utilisateurs ?**

**Réponse :** Le taux de réussite de la recette encode directement les attentes fonctionnelles du commanditaire — 29/29 aujourd'hui. La disponibilité du service, mesurée doublement par UptimeRobot (100 % sur 24 h, 99,95 % sur 7 jours, latence moyenne 635 ms) et par une sonde interne, répond à la première cause d'insatisfaction d'un outil communautaire : être hors ligne en pleine session de jeu. Le temps de réponse de l'API, sous la seconde, mesuré en continu par `/api/health`, répond au confort d'usage. Et côté utilisateurs, le nombre d'anomalies signalées et leur taux de traitement — 17 anomalies consignées (BUG-001 à 016 + OBS-01), toutes traitées — mesure directement l'insatisfaction résiduelle.

**Q41. Comment savez-vous que les utilisateurs sont réellement satisfaits, au-delà de la disponibilité technique ?**

**Réponse :** C'est honnêtement l'indicateur le moins mature de mon dispositif : je n'ai pas de système d'enquête formalisé type NPS, je m'appuie sur des signaux indirects — le volume et la tonalité des retours sur le Discord des beta-testeurs, et un journal des recherches par serveur et par langue qui me permet d'observer si les nouveautés livrées, comme le multi-serveur, sont réellement utilisées en production. C'est un axe d'amélioration que j'assume : en équipe avec des ressources dédiées, je mettrais en place un indicateur de satisfaction déclaratif structuré, ce qui manque à mon dispositif construit surtout sur des indicateurs d'usage et de disponibilité plutôt que de perception.

**Q42. Le CHANGELOG, n'est-ce pas surtout un outil technique plutôt qu'un vrai compte rendu au commanditaire ?**

**Réponse :** Il l'est devenu technique par défaut dans beaucoup de projets, mais je l'ai délibérément écrit en langage fonctionnel — par exemple la ligne v3.1.0 dit que les jetons ne transitent plus par le stockage du navigateur et que la classe d'attaque XSS disparaît, plutôt qu'un jargon de commit brut. Chaque entrée répond à la question « qu'est-ce que ça change pour l'utilisateur ou pour le risque du commanditaire », pas seulement « qu'est-ce qui a été codé ». Je le complète toujours par les dossiers de jalon pour les audiences qui veulent le contexte complet — le CHANGELOG est le compte rendu courant, pas le seul document de reporting.

**Q43. Comment gérez-vous la validation par le commanditaire quand vous êtes seul juge et partie ?**

**Réponse :** Structurellement, je ne suis jamais totalement seul juge : la recette s'appuie sur des scénarios écrits à l'avance et un registre d'anomalies public dans le dossier, ce qui limite le biais de complaisance envers mon propre travail. Sur les jalons de certification, la validation finale n'est pas la mienne mais celle du jury et du campus YNOV, une validation externe réelle. Sur le produit en usage courant, les beta-testeurs Discord jouent le rôle d'un comité utilisateurs qui valide ou remet en cause mes priorités, comme lors de la re-priorisation de juin 2026. Et aujourd'hui, cette démonstration devant vous en tant que commanditaire simulé est la validation ultime prévue par le règlement — je ne me valide donc jamais moi-même sans un tiers en bout de chaîne.

---

## 7. C3.4.2 — Démonstration des fonctionnalités ⚠️ ÉLIMINATOIRE

**Q44. Pourquoi faites-vous la démonstration sur l'environnement de production plutôt qu'en local ?**

**Réponse :** Parce que le règlement demande une démonstration « à partir de la dernière version logicielle développée » pour obtenir la validation avant livraison, et la seule version qui engage réellement cette validation est celle que les utilisateurs finaux utiliseraient — la production, sur oportaler.perfweb.net, pas une version locale qui pourrait diverger de ce qui est réellement déployé. Démontrer en production apporte aussi une preuve cohérente avec le Bloc 3 : que le déploiement continu fonctionne réellement, puisque c'est le même pipeline qui a mis en ligne la version présentée. Je garde un environnement local identique en plan B, prêt à basculer si la connexion ou la production étaient indisponibles au moment de l'oral, mais le choix par défaut est la production parce que c'est la version qui a une valeur de validation réelle.

**Q45. Comment avez-vous choisi les 10 étapes du script de démonstration ? Pourquoi cet ordre ?**

**Réponse :** J'ai suivi le parcours réel d'un joueur, du premier contact jusqu'aux fonctions d'administration, parce que c'est ce parcours qui prouve au commanditaire que l'outil est utilisable de bout en bout par un utilisateur non technicien, pas seulement que chaque fonctionnalité marche isolément. L'ordre suit une logique de complexité et de valeur croissante : découverte et inscription d'abord, fonctionnalités cœur ensuite — recherche joueur, guildes, batailles — puis fonctionnalités à plus forte valeur communautaire — carte, itinéraire partagé, composition d'équipe, craft — et enfin l'administration, qui montre que le commanditaire garde la main sans intervention technique de ma part. Chaque étape couvre une fonctionnalité livrée et versionnée, traçable dans le CHANGELOG.

**Q46. Vous avez pour consigne de ne jamais dire « JWT », « API » ou « localhost » pendant la démo — pourquoi cette contrainte, et n'est-ce pas artificiel ?**

**Réponse :** Ce n'est pas artificiel, c'est la définition même du rôle que je joue pendant cette démonstration : vous êtes mon commanditaire, pas mon équipe technique, et le jargon casserait immédiatement cette posture. Le règlement demande explicitement d'obtenir « la validation du commanditaire avant livraison » — un commanditaire valide un usage et une valeur, pas une architecture technique. Concrètement, je remplace « le jeton JWT en cookie httpOnly » par « le jeton n'est plus accessible par un script du navigateur », et « l'API renvoie une erreur » par « l'application explique pourquoi la donnée manque » — même contenu, vocabulaire adapté à l'audience, ce qui est aussi une compétence managériale.

**Q47. Que faites-vous si le jury demande de voir le code ou pose une question technique en pleine démo ?**

**Réponse :** Je bascule volontiers de posture — la contrainte de vocabulaire fonctionnel s'applique par défaut à mon discours, pas comme une interdiction rigide si le jury sort explicitement du rôle de commanditaire pour poser une question technique. Dans ce cas je réponds techniquement et précisément, avec les vrais termes, avant de reprendre le fil de la démonstration fonctionnelle. Je garde d'ailleurs le code et le tableau CI ouverts en arrière-plan justement pour pouvoir répondre à ce type de sollicitation sans devoir chercher.

**Q48. Comment avez-vous préparé cette démonstration pour limiter le risque d'incident en direct ?**

**Réponse :** J'ai fait une répétition générale chronométrée la veille, sur le même parcours des 10 étapes, en vérifiant que la supervision de production était au vert avant de commencer. J'ai préparé des données de démonstration dédiées et rechargées juste avant l'oral — un compte de démo neuf pour l'inscription en direct, un compte administrateur, un compte utilisateur standard, un joueur et une guilde connus, une composition et un itinéraire déjà créés — pour ne jamais dépendre d'une saisie improvisée en direct. Et j'ai un environnement local identique prêt à basculer en quelques secondes si la production ou la connexion posaient problème le jour J.

**Q49. Cette démonstration vise « l'obtention de la validation du commanditaire avant livraison » — mais le jury n'est pas votre vrai commanditaire, n'est-ce pas un exercice artificiel ?**

**Réponse :** Le jury joue effectivement un rôle simulé, mais l'exercice n'est pas artificiel dans son contenu : la version présentée est réellement en production, réellement utilisée par de vrais joueurs testeurs, et réellement validée par une recette de 29 scénarios avant d'arriver jusqu'ici. La simulation porte sur l'identité du commanditaire, pas sur la réalité du produit ni du processus de validation que je décris. Ma vraie communauté de joueurs a déjà donné une forme de validation d'usage avant cet oral, via Discord et le journal d'utilisation — la validation du jury aujourd'hui s'ajoute à une validation d'usage déjà obtenue, elle ne la remplace pas.

---

## 8. Questions pièges / déstabilisantes

**Q50. Un projet solo, n'est-ce pas justement la preuve que vous ne savez pas travailler en équipe ?**

**Réponse :** Non, c'est l'inverse : j'ai choisi de rendre visible et outillé tout ce qu'une équipe rendrait normalement implicite, précisément parce que je savais que ce bloc serait évalué sur le pilotage collectif. Le fait d'avoir construit un RACI formel, des styles managériaux appliqués à des interlocuteurs réels, et une délégation réelle à l'outillage montre que je comprends la mécanique du management même sans pouvoir la pratiquer sur des collaborateurs physiques. Je ne prétends pas que gérer soi-même équivaut à gérer une équipe de dix personnes ; j'assume la limite et je la transpose explicitement à chaque étape de ma présentation.

**Q51. Vos indicateurs ne sont-ils pas juste construits a posteriori pour coller à ce que le référentiel demande ?**

**Réponse :** Une partie de la structuration en indicateurs formels est effectivement faite pour cet oral, je ne vais pas le nier — mais les données sous-jacentes ne le sont pas : le CHANGELOG, l'historique Git daté, le registre d'anomalies et les scores CI existent depuis le début du projet, pas depuis que je prépare le Bloc 3. La preuve la plus solide, c'est que ces données sont vérifiables indépendamment de mon discours : n'importe qui peut ouvrir le dépôt Git et constater que les dates et le contenu des commits correspondent à ce que je raconte. Ce que j'ai construit pour l'oral, c'est la mise en forme pédagogique, pas les faits eux-mêmes.

**Q52. Vous parlez beaucoup de délégation à l'outillage — n'est-ce pas une façon d'éviter la vraie question du management humain ?**

**Réponse :** C'est une critique honnête à laquelle je n'ai pas de réponse parfaite : je ne peux effectivement pas démontrer de management humain au sens strict, parce qu'il n'y a pas d'humain à manager sur ce projet. Ce que je peux démontrer, c'est la partie du management qui ne dépend pas de la présence physique d'un collaborateur : fixer un cadre, déléguer avec un contrôle, arbitrer, communiquer, faire monter en compétence — et je le fais sur mes deux seuls interlocuteurs réels, l'outillage et ma communauté de testeurs. Je préfère assumer cette limite plutôt que simuler un management fictif sur des collaborateurs qui n'existent pas.

**Q53. Votre recette groupée de juin qui a produit trois bugs tardifs — n'est-ce pas simplement un échec de pilotage que vous habillez en « retour d'expérience » ?**

**Réponse :** C'est un échec de pilotage, je le dis sans détour dans mon dossier — pas un retour d'expérience enjolivé. Ce que je peux revendiquer, c'est ce que j'en ai fait : identifié la cause racine — une casquette QA sous-dotée en créneaux — corrigé structurellement en sanctuarisant un créneau hebdomadaire et en passant à une recette au fil de l'eau, et vérifié depuis qu'aucun pic d'anomalies tardives n'est réapparu. Un jury professionnel sait qu'un pilotage sans aucun échec est suspect ; ce qui compte, c'est la vitesse et la rigueur de la correction, pas l'absence d'erreur.

**Q54. Vous avez un incident de production le 14 août — soit tout juste aujourd'hui, ou très récemment. N'est-ce pas gênant de présenter un projet qui vient tout juste d'avoir un problème ?**

**Réponse :** Je préfère au contraire le présenter que le cacher, parce que c'est l'exemple le plus complet de pilotage d'incident que j'ai à montrer : `deploy.sh` effaçait la crontab de ma sonde de supervision à chaque déploiement — sous `set -e`, quand la sonde était la seule ligne restante, `grep -v` sortait en code 1, tuant le sous-shell avant l'`echo`, et `crontab -` recevait un flux vide. Je l'ai détecté par la disparition de la remontée de la sonde interne, diagnostiqué jusqu'à la cause racine exacte, corrigé par une garde `|| true`, et validé par un déploiement à vide vérifiant que la crontab restait intacte après passage — documenté au CHANGELOG v3.3.1. C'est exactement le cycle détection-diagnostic-correctif-validation qu'un manager doit dérouler sous pression, et le montrer à quelques jours de l'oral est une preuve de transparence plutôt qu'une gêne.

**Q55. Si votre commanditaire n'est pas réel, comment être sûr que vos arbitrages n'ont pas juste été guidés par ce qui vous arrangeait, vous, le développeur seul ?**

**Réponse :** C'est une question légitime, et la garantie que je peux apporter n'est pas l'existence d'un commanditaire humain qui aurait pu me contredire, mais la traçabilité de mes arbitrages : chacun est documenté avec les options réellement évaluées, y compris celles que je n'ai pas choisies, comme la matrice localStorage contre cookie httpOnly du cas JWT. Un arbitrage orienté par confort personnel n'aurait pas de raison de documenter l'option écartée avec autant de détail, ni de revenir la réaliser ensuite une fois la contrainte de délai levée, comme je l'ai fait en juillet. Mes joueurs testeurs, sur Discord, ont un intérêt direct et des retours parfois contraires à mes priorités techniques — ce sont eux qui se rapprochent le plus d'un commanditaire réel capable de me contredire.

**Q56. Votre chiffrage de charge de développement, environ 80 jours-homme, ça ne semble pas beaucoup pour tout ce que vous présentez — n'est-ce pas sous-évalué ?**

**Réponse :** C'est une estimation par analogie faite au chiffrage initial du Bloc 1, autour de 85 j-h, et le réel constaté depuis mon suivi Kanban en est proche, autour de 80 j-h — je n'ai pas de raison de le gonfler ou de le minorer puisque ce chiffre n'a pas d'enjeu financier réel dans un contexte de certification, seulement un enjeu de justesse méthodologique. Il paraît serré parce qu'il ne compte que le temps de développement effectif, pas le temps de formation que je classe séparément dans mon plan de développement de compétences. Si le jury pense que c'est sous-évalué, c'est aussi le signal qu'un profil senior irait plus vite qu'un profil qui, comme moi en février 2025, partait d'un niveau 1-2 sur plusieurs compétences clés de la grille.

**Q57. Entre le début du projet en février 2025 et vos versions de CHANGELOG qui commencent en mai 2026, il y a un écart de calendrier — pouvez-vous l'expliquer ?**

**Réponse :** Oui, et c'est une zone que je préfère assumer plutôt qu'éluder : le CHANGELOG suit le versioning sémantique à partir de la v1.0.0, publiée en mai 2026, qui marque la bascule vers un rythme de livraison versionné et un suivi Kanban formalisé. Les mois antérieurs, depuis février 2025, correspondent à la phase de cadrage, de montée en compétence sur les technologies et de socle technique non versionné, documentée dans le dossier Bloc 1 plutôt que dans le CHANGELOG. C'est un axe d'amélioration honnête de ma discipline de versioning : une entrée v0.x rétroactive aurait mieux tracé cette période, je ne l'ai pas fait et je le reconnais.

**Q58. Vous dites que le WIP = 2 a permis qu'« aucune fonctionnalité commencée n'ait été abandonnée » — comment le prouvez-vous, et n'est-ce pas invérifiable ?**

**Réponse :** C'est vérifiable a minima négativement : mon historique Git ne montre aucune branche ou développement entamé puis explicitement abandonné, contrairement à ce qu'on verrait si des chantiers avaient été ouverts puis délaissés — chaque fonctionnalité entamée se retrouve dans une version livrée du CHANGELOG. Je reconnais que l'absence de preuve négative n'est pas une preuve positive absolue, et que sur un projet solo sans audit externe de mon flux de travail, cette affirmation repose largement sur ma propre discipline. Ce que je peux garantir, c'est que le mécanisme structurel — la limite WIP empêchant d'ouvrir un troisième chantier avant d'en fermer un des deux en cours — rend l'abandon statistiquement moins probable qu'en l'absence de toute limite.

**Q59. Si le jury vous dit « votre présentation est trop lisse, un vrai pilotage de projet a plus de ratés que ça » — que répondez-vous ?**

**Réponse :** Je répondrais que je ne prétends pas à un pilotage sans rater : j'ai déjà nommé devant vous un défaut de management de mon propre planning (la recette groupée de juin), une préconisation de sécurité que je n'ai pas pu réaliser immédiatement (le cas JWT), et un incident de production corrigé à quelques jours de cet oral (la crontab effacée). Ce que j'ai cherché à rendre lisse, ce n'est pas l'absence d'incident mais la manière de les traiter — détection, cause racine, correctif, validation, traçabilité — parce que c'est cette mécanique-là que le référentiel évalue, pas un score de zéro défaut. Si le jury veut creuser un autre raté, je suis prêt à en discuter : mon retard à formaliser un outil de suivi visuel dédié, plutôt que de m'appuyer longtemps sur le seul historique Git, en est un autre.

---

## 9. Si la démo plante — scénarios et conduite à tenir

**Q60. L'API du jeu Albion Online (source de données tierce) est down pendant votre démo. Que faites-vous ?**

**Réponse :** Je le dis immédiatement et sans paniquer, en langage commanditaire : « notre fournisseur de données externe est temporairement indisponible, voici comment l'application le gère » — puis je montre le message d'erreur explicite déjà conçu pour ce cas, comme celui du calculateur de craft qui explique pourquoi un prix est indisponible plutôt que de planter silencieusement. Cette panne devient une démonstration positive de robustesse plutôt qu'un échec : `/api/health` teste justement la disponibilité de cette API tierce en continu, et je peux montrer que ma supervision l'aurait détectée avant même l'oral. Si la panne empêche une étape entière du script, je passe à l'étape suivante sans m'attarder et je propose d'y revenir en fin de démo si l'API revient, sans casser le rythme des 8 minutes prévues.

**Q61. Le wifi coupe en pleine démonstration en production. Que faites-vous ?**

**Réponse :** Je bascule sur mon plan B annoncé en amont : l'environnement local identique, lancé et prêt avant le début de l'oral, avec une base pré-remplie des mêmes données de démonstration. Je le dis explicitement au jury plutôt que de tenter de réparer la connexion en silence : « je bascule sur mon environnement local de secours pour ne pas perdre de temps, la fonctionnalité est strictement identique ». La seule perte est cosmétique — je referme la boucle en fin de démo en réexpliquant que la version locale est un miroir exact de la version déployée, vérifiable par le même numéro de version affiché.

**Q62. Un bug survient en direct pendant la démo — une fonctionnalité ne répond pas comme prévu. Que faites-vous ?**

**Réponse :** Je ne masque pas le bug, je le nomme factuellement — « voici un comportement inattendu, je vais vérifier » — parce que le jury est composé de professionnels qui reconnaîtraient immédiatement une tentative de dissimulation, plus dommageable que le bug lui-même. Je consulte en direct le canal Monolog incident si c'est rapide, sinon je passe à l'étape suivante du script en indiquant que je consignerai l'anomalie selon mon processus habituel — fiche, correctif, re-test, CHANGELOG — exactement le processus qui a traité les 17 anomalies déjà tracées sur ce projet. Montrer que je sais réagir avec méthode à un imprévu en direct est, pour ce bloc, une meilleure preuve de pilotage qu'une démo sans accroc.

**Q63. Vous constatez, juste avant de commencer, que la supervision de production indique un incident en cours. Que faites-vous ?**

**Réponse :** Je le vérifie dans mes secondes de préparation avant l'oral — c'est prévu dans ma check-list de préparation matérielle — et si un incident réel est en cours, je bascule immédiatement sur mon environnement local de secours plutôt que de risquer une démo dégradée en production. Je préviens le jury en une phrase avant de commencer : « ma supervision signale un incident en production actuellement, je démarre donc directement sur mon environnement de secours, identique en version » — l'honnêteté immédiate évite toute suspicion s'ils constatent eux-mêmes une lenteur. Après l'oral, cet incident suivrait mon processus habituel de traitement, ce que je peux mentionner comme preuve que la supervision fonctionne même quand elle capte un problème au pire moment possible.

**Q64. Le jury vous interrompt et demande de sauter directement à l'administration ou à une fonctionnalité hors de l'ordre prévu du script. Que faites-vous ?**

**Réponse :** Je m'adapte sans résister : je navigue directement vers la fonctionnalité demandée, parce que le script en 10 étapes est un fil conducteur par défaut, pas une contrainte imposée au jury. La seule vigilance que je garde, c'est de vérifier mentalement que mes données de démonstration couvrent bien ce cas — mes comptes et données préparés en amont (admin, utilisateur standard, joueur et guilde connus) sont volontairement assez larges pour répondre à une demande hors script. Si la demande sort de ce périmètre, je le dis simplement — « je n'ai pas de donnée de démonstration prête pour ce cas précis, laissez-moi vous montrer l'équivalent le plus proche » — plutôt que d'improviser un exemple qui pourrait échouer.
