# Discours — Bloc 1 : Cadrer un projet de développement d'applications logicielles

**Support associé :** `Support_Bloc1_Albion_Helper_FINAL.pptx` (17 slides, dont 1 slide d'annexe non projetée)
**Format de l'épreuve :** 30 minutes — 20 minutes de présentation + 10 minutes d'échanges avec le jury
**Durée cible de ce script :** environ 20 minutes à un débit de ~135 mots/minute (~2 800 mots)
**Candidat :** Pierre Saugues — M2 Expert en développement full-stack, YNOV — RNCP39583

> Les 5 compétences éliminatoires du Bloc 1 sont traitées explicitement dans ce script, chacune annoncée à voix haute au moment où elle est couverte, pour qu'elles soient repérables par le jury sans ambiguïté :
> - **C1.1.1** cartographie des acteurs → Slide 3
> - **C1.2.2** faisabilité → Slide 7
> - **C1.3.2** étude comparative → Slide 11
> - **C1.4.1** charge de travail → Slide 13
> - **C1.6** préconisations → Slide 15

---

## Slide 1 — Titre — 0 min 50 (départ 0 min 00)

Bonjour à toutes et à tous, et merci de me recevoir pour cette présentation du cadrage d'Albion Helper. Je m'appelle Pierre Saugues, je suis en M2 Expert en développement full-stack à YNOV, et je passe aujourd'hui l'épreuve orale du bloc 1 du titre RNCP39583, Expert en développement logiciel.

Je vais vous présenter, en vingt minutes, le cadrage du projet Albion Helper : comment je suis parti d'une demande, comment je l'ai analysée, quels risques j'ai identifiés, et quelles solutions j'ai préconisées. Ce cadrage n'est pas resté théorique : le projet est aujourd'hui en version 3.3.1, en production réelle, et je m'appuierai autant que possible sur des faits vérifiables plutôt que sur des intentions.

---

## Slide 2 — Le problème à résoudre — 1 min 25 (départ 0 min 50)

Albion Online est un jeu où l'information est une arme : connaître l'équipement d'un adversaire, le prix du marché, un itinéraire sûr, c'est souvent ce qui fait gagner ou perdre une bataille. Le commanditaire, une communauté de joueurs organisée en guilde, m'a exposé un problème très concret : toutes ces informations existent, mais elles sont éclatées entre plusieurs sites tiers, en anglais, sans aucun moyen de les partager entre membres, et aucun ne couvre les trois serveurs mondiaux du jeu.

Leur demande tient en une phrase : un outil unique, dans leur langue, où la guilde prépare et partage tout ce dont elle a besoin en session de jeu. Dès le cadrage, j'ai identifié un atout décisif : l'éditeur du jeu expose une API de données publique et gratuite. Cela rendait le projet possible sans aucun partenariat commercial.

Le périmètre proposé couvrait la recherche de joueurs et de guildes, la carte et les itinéraires partageables, les compositions d'équipe et le calcul d'artisanat, le tout multi-langue et multi-serveur. Aujourd'hui, en version 3.3.1, cette vision est en production : 12 066 objets catalogués, 20 langues, une authentification durcie, et 177 tests automatisés qui protègent chaque livraison.

---

## Slide 3 — Cartographie des parties prenantes (C1.1.1 — éliminatoire) — 1 min 10 (départ 2 min 15)

J'entre maintenant dans une compétence éliminatoire du bloc 1 : cartographier les acteurs.

Sept parties prenantes gravitent autour du projet. Le commanditaire, la communauté de joueurs, exprime le besoin et valide chaque livraison : son implication est forte et décisionnaire. Les utilisateurs finaux, du joueur débutant au chef de guilde, l'utilisent au quotidien et attendent rapidité, langue native et zéro installation. Moi-même, comme développeur unique, je conçois, développe et exploite l'application : mon implication est permanente. Les administrateurs gèrent le back-office.

Et puis il y a deux acteurs externes essentiels : Sandbox Interactive, l'éditeur du jeu, qui fournit l'API de données — son implication dans le projet est faible, mais son pouvoir est critique, car sans cette API, rien ne fonctionne. Et l'hébergeur, dont le rôle est contractuel.

Cette lecture pouvoir-intérêt n'est pas un exercice académique : elle a directement nourri ma cartographie des risques, que je détaillerai plus loin, avec un risque explicitement dédié à la dépendance à cette API.

---

## Slide 4 — Analyse de la demande — 1 min 15 (départ 3 min 25)

Pour chaque partie prenante, j'ai croisé les besoins recensés en entretien avec des objectifs mesurables. Le commanditaire veut un outil unique qui remplace quatre sites tiers, pour renforcer la cohésion de la guilde. Les joueurs veulent une réponse en moins d'une seconde, dans leur langue, sur leur serveur — sans quoi l'outil ne sera tout simplement pas adopté, c'est l'enjeu numéro un. Les administrateurs veulent de l'autonomie, sans dépendre de moi après la livraison. Et moi, en tant que développeur solo, je devais viser un périmètre finançable et maintenable seul.

Trois pistes de solution ont été étudiées au cadrage : une application web sur mesure, une surcouche d'un site existant, ou un bot Discord. J'ai écarté le bot, qui ne peut pas afficher une carte interactive ni des compositions visuelles, et la surcouche, qui aurait créé une dépendance non contractuelle à un tiers. La piste retenue, l'application web sur mesure, a ensuite été confirmée par l'étude comparative technique et par l'estimation budgétaire que je détaillerai plus loin.

---

## Slide 5 — Analyse SWOT du projet — 1 min 15 (départ 4 min 40)

La cartographie des opportunités et menaces complète cette analyse. Côté forces, une stack entièrement open source, donc un coût de licence nul, une API de jeu gratuite et documentée, et le fait que je sois moi-même joueur, ce qui me donne une connaissance métier directe.

Côté faiblesses, assumons-le : je suis seul sur ce projet, donc un bus factor de un, un budget d'infrastructure minimal, et une compétence sécurité que j'ai dû construire pendant le projet — je l'ai identifiée dès le cadrage plutôt que de la découvrir en cours de route.

Côté opportunités, aucun concurrent ne combine multilingue, multi-serveur et partage, et la communauté active du jeu constitue un vivier de testeurs gratuits. Et côté menaces, la plus structurante est la dépendance à l'API de l'éditeur, suivie par la surface d'attaque qu'implique une exposition web publique.

J'ai aussi intégré des points de vigilance transverses dès le cadrage : la sobriété environnementale, avec un hébergement mutualisé et un cache qui réduit les appels réseau, et le respect scrupuleux des conditions d'usage de l'API externe.

---

## Slide 6 — Démarche d'audit — 1 min 15 (départ 5 min 55)

La démarche d'audit s'est construite en trois volets. D'abord un état des lieux fonctionnel : j'ai inventorié tous les outils utilisés par la communauté, sites de statistiques, cartes en ligne, tableurs partagés, Discord, avec une grille de lecture fonction, langue, serveurs, partage. Ensuite un audit technique de l'API du jeu, avec des essais outillés pour mesurer le format des données, la latence, les limites de débit. Et enfin un audit de l'infrastructure cible, pour vérifier les capacités réelles du VPS existant.

Les constats ont été structurants : il fallait quatre outils tiers pour couvrir le besoin, et aucun ne permettait le partage ni n'était multilingue — c'est notre différenciateur. L'API du jeu est gratuite et sans clé, mais sans garantie de service, ce qui a imposé un cache et une supervision. Et le VPS existant s'est révélé suffisant pour la volumétrie visée.

Ce qu'il faut retenir, c'est que chaque constat d'audit s'est transformé en décision de cadrage concrète, que je vais détailler dans les slides suivantes.

---

## Slide 7 — Diagnostic des infrastructures (C1.2.2 — éliminatoire, faisabilité) — 1 min 25 (départ 7 min 10)

J'aborde maintenant la deuxième compétence éliminatoire : évaluer la faisabilité technique.

Le diagnostic de l'infrastructure existante a montré un VPS mutualisé suffisant, avec PHP-FPM 8.2, une base PostgreSQL déjà disponible, et un poste de développement sous Docker qui garantit des environnements reproductibles. En revanche, deux éléments étaient totalement absents au moment du cadrage : la chaîne de livraison et la supervision, qu'il a fallu construire de zéro — ce que j'ai fait, et que je démontrerai concrètement au bloc 3.

J'ai aussi posé les contraintes chiffrées : un hébergement à environ dix euros par mois, une cible d'environ deux cents utilisateurs actifs avec des pics en soirée, des jalons de certification imposés entre juin et octobre 2026, et un budget de licences quasi nul.

Mon avis critique de faisabilité, à l'époque du cadrage, était clair : le projet est faisable dans ces contraintes, à trois conditions : mettre en cache les données de l'API du jeu, limiter le périmètre de la version un aux fonctions à plus forte valeur, et automatiser tests et déploiement dès le départ pour compenser une équipe réduite à une seule personne. Ces trois conditions ont ensuite structuré toutes mes décisions d'architecture.

---

## Slide 8 — Cartographie des risques — 1 min 25 (départ 8 min 35)

J'ai priorisé six risques techniques et fonctionnels selon une grille probabilité fois impact. Deux risques ressortent en criticité élevée. Le premier, l'indisponibilité ou le changement de l'API du jeu, directement hérité de la cartographie des acteurs : la mesure décidée est un cache local et une dégradation gracieuse, avec la disponibilité de l'API surveillée dans ma sonde de santé. Le second, la compromission de comptes ou une attaque web, m'a conduit à décider dès le cadrage une revue systématique selon l'OWASP Top 10, des jetons courts et l'usage exclusif de l'ORM contre les injections.

Les quatre autres risques, en criticité moyenne, couvrent la perte de données, l'interruption de service, la dégradation des performances, et le bus factor de un puisque je suis seul sur ce projet — pour ce dernier, ma réponse est une documentation systématique et un historique Git conventionnel qui permettrait à un tiers de reprendre le projet.

Je précise que ce ne sont pas des cases cochées pour la forme : au fil du projet, certains de ces risques se sont réellement matérialisés, et je vous montrerai en conclusion qu'ils ont été absorbés par les mesures prévues ici.

---

## Slide 9 — Référentiel d'évaluation & indicateurs de contrôle — 1 min 20 (départ 10 min 00)

Le référentiel d'évaluation des risques calcule la criticité comme le produit de la probabilité et de l'impact, sur des échelles de un à trois, et je le réévalue à chaque jalon. Au-delà d'un seuil de six, une mesure préventive devient obligatoire avant toute mise en production.

Pour le suivi des incidents, j'ai construit un registre unique d'anomalies avec une fiche normalisée à onze champs, incluant une reproduction obligatoire, et un cycle complet : consignation, qualification, correctif, re-test, clôture tracée. Ce n'est pas resté un exercice de cadrage : dix-sept anomalies ont été réellement consignées et traitées sur le projet, numérotées BUG-001 à BUG-016 plus une observation.

Enfin, j'ai défini six indicateurs de contrôle dès le cadrage : disponibilité supérieure ou égale à quatre-vingt-dix-neuf pour cent, temps de réponse inférieur à une seconde, détection d'incident en moins de cinq minutes, moins de un pour cent d'erreurs serveur, zéro vulnérabilité critique ouverte, et zéro régression grâce à une intégration continue bloquante. Aujourd'hui, ces indicateurs sont mesurés en continu en production, avec une disponibilité de 99,95 % sur les sept derniers jours.

---

## Slide 10 — Méthodologie de veille, sources et outils — 1 min 25 (départ 11 min 20)

La veille technologique s'organise en trois strates : une veille passive automatisée quotidienne, une veille active ciblée hebdomadaire sur les technologies du projet, et une veille exploratoire mensuelle via conférences et retours d'expérience. Mes sources principales sont les notes de version officielles de Symfony et React, les bulletins de sécurité OWASP et les CVE, ainsi que les communautés spécifiques au jeu pour anticiper les évolutions de son API.

Côté outils, Dependabot détecte automatiquement les vulnérabilités et les mises à jour disponibles, avec un délai de réaction de quelques heures ; les flux RSS et newsletters me donnent un panorama hebdomadaire à coût fixe ; et le GitHub Watch sur les dépôts clés anticipe les ruptures.

La preuve d'efficacité de cette veille est concrète et récente : elle a déclenché la migration de Symfony 7.2, arrivé en fin de vie, vers la version 7.4 LTS, avec la correction de trente-six advisories de sécurité dont une CVE de sévérité élevée — corrigée avant la mise en production, et validée par mes cent soixante-dix-sept tests automatisés qui garantissent l'absence de régression. C'est un exemple concret d'une veille qui ne reste pas théorique.

---

## Slide 11 — Étude comparative des solutions techniques (C1.3.2 — éliminatoire) — 1 min 20 (départ 12 min 45)

Voici la troisième compétence éliminatoire : sélectionner l'architecture technique via une étude comparative.

J'ai comparé quatre briques sur quatre critères communs : sécurité, écosystème et maintenabilité, impact environnemental et système, et bien sûr le choix final. Pour le back-end, j'ai comparé Symfony, Laravel et Node avec Express ; Symfony l'emporte pour son support LTS de quatre ans et un ORM qui protège nativement contre les injections — aujourd'hui en version 7.4 LTS après la migration dont je viens de parler. Pour le front, React s'est imposé face à Vue et Angular pour son écosystème et son échappement XSS par défaut.

Pour l'authentification, j'ai comparé JWT et sessions serveur classiques ; j'ai retenu JWT, et plus précisément des jetons courts stockés en cookies httpOnly, ce qui protège contre le vol de jeton par une faille XSS. Et pour la base de données, PostgreSQL s'est imposé naturellement puisqu'il était déjà installé sur le VPS, donc zéro ressource supplémentaire.

Ce comparatif a directement déterminé les ressources matérielles nécessaires : le VPS existant a suffi, aucune acquisition n'a été nécessaire.

---

## Slide 12 — Diagramme de fonctionnalités (MoSCoW) — 1 min 20 (départ 14 min 05)

Le diagramme de fonctionnalités hiérarchise le périmètre selon la méthode MoSCoW. Les fonctions Must, incontournables, couvrent le compte et les accès, la recherche de joueurs, guildes et batailles, et la carte avec ses itinéraires partageables — c'est ce qui remplace directement les quatre outils tiers identifiés à l'audit. Les fonctions Should, différenciatrices, ajoutent les compositions d'équipe et le calculateur de craft, aujourd'hui appuyé sur un catalogue de douze mille soixante-six objets, ainsi que le confort d'usage : vingt langues administrables, trois serveurs, thème sombre. Les fonctions Could, comme une API publique ou une application mobile, sont reportées en backlog.

Ce recensement n'est pas venu de mon seul jugement : il s'appuie sur des entretiens d'usage avec les joueurs et sur l'audit de l'existant, avec une attention UX dès le cadrage — réponse rapide en session de jeu, thème sombre pour un usage nocturne, partage sans compte pour le destinataire d'un lien.

Et ce découpage n'est pas resté sur le papier : il est devenu le backlog réel du projet, chaque fonction terminale correspondant à un lot livré et recetté, avec vingt-neuf scénarios de recette, tous validés.

---

## Slide 13 — Estimation de la charge de travail (C1.4.1 — éliminatoire) — 1 min 15 (départ 15 min 25)

Quatrième compétence éliminatoire : évaluer la charge de travail pour permettre une évaluation budgétaire.

J'ai découpé le projet en huit lots, du cadrage à la documentation, chacun estimé par analogie avec mes réalisations antérieures, puis affiné en tâches de deux jours maximum. Le total atteint quatre-vingt-cinq jours-hommes, auquel j'ai ajouté une réserve pour aléas de dix pour cent, portant l'estimation à environ quatre-vingt-quatorze jours-hommes — cette réserve a d'ailleurs été consommée en bonne partie par la campagne de sécurité que j'ai menée en juin.

Cette charge, étalée sur environ dix-huit mois à temps partiel en formation, a directement permis l'évaluation budgétaire : quatre-vingt-quatorze jours-hommes à un taux journalier moyen de quatre cents euros, soit trente-sept mille six cents euros de développement, plus deux cent soixante-dix euros d'infrastructure sur deux ans, et zéro euro de licence puisque tout est open source. Le budget prévisionnel total s'établit ainsi à environ trente-huit mille euros. Je vous montrerai en conclusion que ce chiffrage s'est vérifié dans les faits.

---

## Slide 14 — Schéma d'architecture (modèle C4) — 1 min 20 (départ 16 min 40)

Voici le schéma d'architecture, modélisé selon le niveau conteneurs du modèle C4. Le joueur passe par son navigateur en HTTPS vers un front React 19, construit en statique et servi par Nginx, qui communique en JSON avec l'API REST Symfony, elle-même organisée en couches strictes : contrôleur, service, repository, entité, jusqu'à PostgreSQL. Cette API consomme, avec un cache local et une protection anti-SSRF, l'API publique d'Albion Online, et elle est surveillée par une double supervision, sonde externe et sonde interne, avec alertes automatiques.

J'ai choisi le modèle C4 plutôt qu'un UML complet parce qu'il offre une double lecture : lisible par un commanditaire non technicien au niveau du contexte, et suffisamment précis pour une équipe technique au niveau des conteneurs — un choix adapté à un cadrage à double audience.

Les propriétés visées étaient la maintenabilité, grâce aux couches strictes du framework, la sécurité, avec une API sans état et des jetons en cookies httpOnly, l'extensibilité, prouvée par l'ajout du multi-serveur en seulement deux semaines sans refonte, et la sobriété, avec un cache, un build statique et un seul VPS.

---

## Slide 15 — Préconisations au client (C1.6 — éliminatoire) — 1 min 20 (départ 18 min 00)

J'aborde la dernière compétence éliminatoire : proposer des axes de solutions préconisées, avec un argumentaire adapté au client, pour obtenir son adhésion.

Face au commanditaire, mon discours se construit en trois temps. D'abord l'essentiel : retrouver en un seul endroit, dans sa langue, ce qu'il cherche aujourd'hui sur quatre sites différents. Ensuite ce qui n'existe nulle part ailleurs : partager un itinéraire ou une composition d'équipe par un simple lien, même à un joueur sans compte — c'est notre différenciateur. Et enfin l'autonomie : un espace d'administration qui ne dépend plus de moi.

J'ai aussi anticipé les objections qu'un commanditaire non technique pose naturellement. Si l'API du jeu tombe, les données restent en réserve et l'outil prévient l'utilisateur. Le coût de fonctionnement se limite à cent trente-cinq euros par an d'hébergement, tout le reste étant automatisé. La sécurité des comptes s'appuie sur une revue OWASP à chaque livraison et des jetons en cookies httpOnly. Et sur l'application mobile, le site est déjà responsive, et l'architecture en API réutilisable rend une application native possible plus tard sans repartir de zéro.

---

## Slide 16 — Conclusion — 1 min 20 (départ 19 min 20 → fin ~20 min 40)

En conclusion, ce cadrage ne s'est pas contenté de rester sur le papier, il s'est vérifié dans les faits. Le périmètre Must et Should que j'avais cadré a été intégralement livré, avec vingt-neuf scénarios de recette tous validés : le cadrage était réaliste.

Les risques identifiés se sont même concrétisés — des prix de marché parfois manquants sur l'API, des vulnérabilités de dépendances, et même un incident réel de supervision où un script de déploiement effaçait accidentellement ma sonde de surveillance — et à chaque fois, les mesures prévues au cadrage les ont absorbés : cache, veille, migration LTS, correctif documenté au changelog. Le budget est tenu, l'infrastructure coûte cent trente-cinq euros par an comme prévu. Et l'architecture a prouvé son extensibilité, avec le multi-serveur et vingt langues ajoutés sans refonte.

Aujourd'hui, le produit est en production réelle, accessible publiquement, supervisé vingt-quatre heures sur vingt-quatre, protégé par cent soixante-dix-sept tests automatisés bloquants. Chacune des décisions de ce cadrage se retrouve dans l'application que je présenterai aux blocs 2, 3 et 4.

Je vous remercie de votre attention, et je suis prêt à répondre à vos questions.

*(Slide 17, l'annexe de timing et de rappel des compétences éliminatoires, n'est pas projetée devant le jury — elle reste une note de préparation personnelle.)*

---

## Conseils de livraison

- **Respiration.** Marquer une vraie pause (1 à 2 secondes) après chaque changement de slide et après chaque chiffre clé (177 tests, 38 k€, 99,95 %) — un chiffre lâché sans silence derrière ne s'imprime pas chez le jury. Respirer avant les phrases d'ouverture de chaque compétence éliminatoire (« J'entre maintenant dans une compétence éliminatoire… ») pour marquer le changement de registre.
- **Gestion du temps.** Le script est calé à ~20 min 40 à 135 mots/minute, avec une marge naturelle : les slides 3, 7, 11, 13 et 15 (les 5 compétences éliminatoires) sont les points de passage obligés — vérifier au minimum le chronomètre à la slide 8 (repère : ~8 min 35) et à la slide 13 (repère : ~15 min 25). Si l'un de ces repères est dépassé de plus d'une minute, resserrer les slides suivantes (6, 9, 10, 12, 14) qui sont les moins critiques pour l'évaluation, plutôt que les slides éliminatoires.
- **Si on dépasse le temps.** Ne jamais sacrifier une compétence éliminatoire pour rattraper le retard : mieux vaut raccourcir la slide 5 (SWOT), la slide 9 (référentiel/indicateurs) ou la slide 10 (veille) en ne lisant que les points structurants (les chiffres et la preuve d'efficacité), quitte à laisser le jury lire les tableaux à l'écran sans tout commenter à l'oral. Sur la slide 16 (conclusion), avoir une version courte prête (2-3 phrases : périmètre livré, risques absorbés, produit en production) si le temps presse fortement.
- **Si on est en avance.** Ne pas accélérer le débit sur les slides éliminatoires : préférer développer un exemple concret déjà présent dans le script (l'incident réel de la sonde cron slide 16, ou la migration Symfony 7.4 LTS slide 10) pour montrer la maîtrise du sujet au-delà du texte appris.
- **Posture.** Regarder le jury, pas les slides — le support est un support, pas un prompteur. Parler « au commanditaire » (registre vulgarisé) sur les slides 2, 15 et 16 ; assumer un registre technique plus dense sur les slides 11 et 14, le jury étant composé de professionnels du domaine.
- **Dernier repère avant de commencer.** Vérifier que le compteur du support (17 slides) correspond bien à ce script, que le fichier de notes du présentateur s'affiche côté candidat, et couper toute notification pendant les 20 minutes.
