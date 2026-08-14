# Banque de questions du jury — Bloc 1 : Cadrer un projet

Document privé de préparation à l'oral (30 min : 20 de présentation + 10 d'échanges), RNCP39583, Albion Helper.
63 questions, organisées par compétence. Marqueur ⚠️ ÉLIM sur les 5 compétences éliminatoires du Bloc 1 (C1.1.1, C1.2.2, C1.3.2, C1.4.1, C1.6) — jamais de non-acquisition possible dessus.

## Règles d'or pour répondre

1. Structurer chaque réponse (contexte → décision → preuve chiffrée) plutôt que répondre à plat.
2. Toujours chiffrer (j-h, €, %, ms, dates) plutôt qu'affirmer sans preuve.
3. Assumer une limite plutôt que la nier, puis montrer aussitôt la mesure prise pour la traiter.
4. Raccrocher spontanément aux 5 compétences éliminatoires quand la question s'y prête, sans forcer.
5. Ne jamais inventer un chiffre ou un fait : dire « je ne l'ai pas mesuré » est acceptable, inventer ne l'est pas.

---

## 1. C1.1.1 — Cartographier les acteurs ⚠️ ÉLIM

**Q1. Vous présentez un commanditaire « communauté/guilde » qui est en réalité fictif pour les besoins de la certification. Comment avez-vous procédé pour recueillir un besoin réaliste malgré cela ?**

**Réponse :** Je me suis appuyé sur mon expérience de joueur d'Albion Online et sur l'observation réelle de la communauté : les sites tiers utilisés, les questions posées sur les forums et Discord, les manques exprimés (pas de partage, pas de multilingue). J'ai formalisé ce recueil en état des lieux fonctionnel (grille fonction/langue/serveurs/partage) qui figure au support, ce qui documente une démarche d'audit et non une simple supposition. Le commanditaire fictif reste crédible parce que le besoin qu'il exprime correspond à un manque objectivement constaté sur 4 outils tiers concurrents, aucun ne couvrant le partage ni le multilingue. Cette traçabilité état des lieux → besoin → périmètre est ce qui rend le cadrage vérifiable par le jury.

**Q2. Pourquoi Sandbox Interactive (l'éditeur du jeu) figure-t-il dans votre cartographie des acteurs alors qu'il n'est pas votre client ?**

**Réponse :** Parce qu'un acteur externe sans lien contractuel peut avoir un pouvoir de blocage total sur le projet, ici via l'API de données dont dépend l'application. Dans ma cartographie pouvoir × intérêt, Sandbox Interactive a un intérêt faible pour mon projet mais un pouvoir critique : s'il change les conditions d'usage ou coupe l'accès, l'application perd sa source de données. C'est justement pour cela que ce risque (R1, criticité élevée) est directement raccroché à cette cartographie et débouche sur des mesures concrètes : cache local, dégradation gracieuse, supervision de l'API dans la sonde de santé. Ignorer cet acteur externe aurait été une lacune du cadrage.

**Q3. Quel est le niveau d'implication de l'hébergeur dans votre projet, et pourquoi le classez-vous différemment de Sandbox Interactive ?**

**Réponse :** L'hébergeur (VPS perfweb.net) a une implication faible et contractuelle : je paie un service, j'ai un SLA implicite mais pas de dépendance fonctionnelle forte, je peux changer d'hébergeur si besoin sans réécrire le produit. Sandbox Interactive, à l'inverse, n'a aucun contrat avec moi et pourtant conditionne le cœur fonctionnel de l'application — la donnée de jeu. La distinction que je fais dans la cartographie n'est donc pas seulement le niveau d'implication mais le couple pouvoir/dépendance : un acteur contractuel remplaçable pèse moins qu'un acteur non contractuel irremplaçable. C'est cette lecture qui alimente ensuite ma cartographie des risques.

**Q4. Vous êtes seul sur ce projet : développeur, chef de projet, testeur, administrateur. N'est-ce pas un biais de cadrer un projet où vous jouez tous les rôles ?**

**Réponse :** C'est une réalité du contexte de formation que j'assume plutôt que de la masquer : je l'ai identifiée moi-même comme une faiblesse dans le SWOT (bus factor = 1) et comme un risque priorisé (R6, criticité moyenne). Pour compenser ce biais, j'ai séparé les rôles dans mon organisation même si une seule personne les occupe : documentation systématique, historique Git conventionnel, architecture standard du framework — ce sont les mesures qui permettraient à un tiers de reprendre le projet. Le cadrage a ensuite été challengé par des livrables externes vérifiables : 177 tests automatisés, 29 scénarios de recette, CI/CD bloquante — ce ne sont pas des auto-déclarations mais des preuves opérationnelles. Le biais existe, je ne le nie pas, mais il est contenu par l'outillage.

**Q5. Les administrateurs de l'outil sont-ils une partie prenante distincte des utilisateurs finaux ? Pourquoi cette distinction compte-t-elle pour le cadrage ?**

**Réponse :** Oui, je les distingue parce que leurs attentes et leur niveau d'implication diffèrent : les joueurs veulent consulter vite dans leur langue, les administrateurs veulent gérer comptes, langues et contenus sans compétence technique, en autonomie après livraison. Cette distinction a directement dimensionné une fonctionnalité MUST (F1.3 Administration) dans mon diagramme de fonctionnalités, avec un vrai back-office : gestion des rôles, KPI, synchronisation des items, administration de 20 langues. Sans cette cartographie fine, j'aurais pu considérer « les utilisateurs » comme un bloc homogène et sous-dimensionner l'admin, ce qui aurait cassé l'autonomie promise au commanditaire.

**Q6. Comment avez-vous pris en compte les futurs utilisateurs en situation de handicap dès la cartographie des acteurs ?**

**Réponse :** Je les ai intégrés comme un sous-ensemble transverse des utilisateurs finaux plutôt que comme un acteur à part, parce que l'accessibilité devait être une exigence dès le cadrage et non un correctif après coup. Cette préoccupation se retrouve concrètement dans le résultat mesuré en production : score Lighthouse accessibilité 98/100, conformité visée RGAA 4.1, 0 violation bloquante détectée par axe-core. Ce n'est pas anecdotique : c'est la traduction directe, au niveau produit, d'un engagement pris dès la phase de cadrage envers l'ensemble des utilisateurs, handicap inclus.

---

## 2. C1.1.2 — Analyse de la demande, objectifs et enjeux

**Q7. Vous avez envisagé trois pistes (application sur mesure, surcouche d'un site existant, bot Discord). Pourquoi avoir éliminé les deux dernières si vite ?**

**Réponse :** Je ne les ai pas éliminées « vite », je les ai confrontées aux objectifs recensés par partie prenante. Le bot Discord ne peut techniquement pas porter une carte interactive ni des compositions d'équipe visuelles — il aurait fallu sacrifier deux fonctionnalités MUST dès le départ. La surcouche d'un site existant aurait résolu une partie du besoin mais créé une dépendance à un tiers non contractuel, exactement le type de risque que je venais d'identifier avec Sandbox Interactive — cela aurait dédoublé le risque plutôt que de le maîtriser. L'application web sur mesure est la seule option qui couvre l'intégralité du périmètre MUST tout en gardant la maîtrise technique, et c'est ce choix que confirment ensuite l'étude comparative et le chiffrage.

**Q8. Quel est l'enjeu principal côté joueurs, et comment se traduit-il concrètement dans le produit ?**

**Réponse :** L'enjeu que j'ai identifié est l'adoption : un outil lent ou uniquement en anglais ne sera simplement pas utilisé par une communauté qui a déjà 4 alternatives disponibles. Cet enjeu s'est traduit en objectifs mesurables dès le cadrage — réponse en moins d'1 seconde, interface disponible dans plusieurs langues, couverture des 3 serveurs — puis en résultat vérifiable : l'application est aujourd'hui disponible en 20 langues administrables et `/api/health` répond en environ 0,8 seconde en routine. Le lien entre l'enjeu identifié en entretien et le chiffre mesuré en production est justement ce qui prouve que le cadrage n'était pas théorique.

**Q9. Comment avez-vous recueilli concrètement les besoins si le commanditaire est fictif ? N'est-ce pas juste vous qui décidez seul de ce qui est utile ?**

**Réponse :** J'assume que la source primaire est mon expérience de joueur et l'observation de la communauté réelle d'Albion Online — forums, Discord, sites tiers utilisés — ce qui n'est pas équivalent à des entretiens formels avec un vrai client, et je le dis sans détour. Ce que j'ai cherché à objectiver, c'est le besoin lui-même : j'ai construit une grille d'audit fonctionnelle comparant 4 outils tiers sur des critères précis (fonction couverte, langue, serveurs, partage), ce qui constitue une preuve externe et non une opinion personnelle. La limite réelle est l'absence de retours utilisateurs contradictoires en amont ; je la compense en aval par les 29 scénarios de recette et par le fait que le périmètre Must/Should livré correspond exactement à ce qui avait été cadré, ce qui valide a posteriori la pertinence du recueil initial.

**Q10. Les objectifs par partie prenante que vous présentez sont-ils suivis dans le temps, ou sont-ils restés figés au cadrage ?**

**Réponse :** Ils ont été traduits en engagements vérifiables suivis tout au long du projet, pas juste couchés sur un slide initial. Par exemple l'objectif « réponse rapide » pour les joueurs est devenu un indicateur de contrôle supervisé (temps de réponse cible < 1 s), et l'objectif « autonomie du commanditaire » pour les administrateurs est devenu une fonctionnalité MUST livrée et recettée. Le fait que ces objectifs se retrouvent identiques dans le chiffrage, le diagramme de fonctionnalités et les indicateurs de contrôle montre une continuité entre cadrage et exécution plutôt qu'un document jetable.

---

## 3. C1.2.1 — Cartographie des opportunités et menaces (SWOT)

**Q11. Votre SWOT identifie « compétence sécurité à construire » comme une faiblesse. Comment cette faiblesse identifiée au cadrage s'est-elle traduite ensuite ?**

**Réponse :** Je l'ai prise au sérieux en la transformant en actions concrètes plutôt qu'en la laissant comme un constat : revue systématique OWASP Top 10, authentification par JWT à jetons courts, migration vers des cookies httpOnly en v3.1.0 pour éliminer l'exposition du token en localStorage, activation de compte et réinitialisation de mot de passe sécurisées via Brevo en v3.2.0, rate limiting, CORS en liste fermée, en-têtes de sécurité. La preuve que cette faiblesse a été maîtrisée et non seulement compensée par la chance, c'est que composer audit ne remonte aujourd'hui aucun advisory sur les dépendances back. Une faiblesse identifiée tôt au cadrage devient un axe de vigilance qui structure des choix techniques concrets sur toute la durée du projet.

**Q12. Quelle opportunité identifiée au SWOT s'est-elle réellement concrétisée pendant le projet ?**

**Réponse :** L'opportunité « aucun outil concurrent multilingue + multi-serveur + partage » s'est concrétisée dans le périmètre livré : 20 langues administrables, couverture des 3 serveurs (Americas/Europe/Asia), routes de farming partageables par lien avec expiration 24 h, compositions d'équipe exportables. C'est précisément la combinaison de ces trois axes qui n'existait chez aucun concurrent identifié à l'audit, et c'est elle que je mets en avant dans l'argumentaire au commanditaire à la préconisation. L'opportunité identifiée au cadrage a donc directement orienté la hiérarchisation MoSCoW des fonctionnalités différenciantes.

**Q13. La menace « désintérêt du jeu à long terme » vous semble-t-elle avoir été surestimée ou sous-estimée avec le recul ?**

**Réponse :** Je pense l'avoir correctement positionnée : c'est une menace externe réelle mais à horizon long, que je ne pouvais ni éliminer ni traiter par une mesure technique — seulement surveiller. Sur la durée du projet (juin à octobre 2026), le jeu est resté actif et la communauté disponible pour les tests, donc cette menace ne s'est pas matérialisée à ce stade. Ce que je referais pareil, c'est de ne pas avoir cherché à la « traiter » comme les autres risques : une menace de marché à horizon incertain relève de la veille et de la surveillance, pas d'un plan d'action immédiat, et c'est ce classement de bon sens que j'assume.

**Q14. Vous mentionnez un « point de vigilance environnemental » dès le cadrage. Ce n'est pas un peu artificiel pour une petite application web ?**

**Réponse :** Je ne le présente pas comme un chapitre à part mais comme un critère intégré aux décisions techniques : le choix d'un hébergement mutualisé plutôt que du cloud managé, la mise en cache systématique des appels à l'API du jeu pour réduire le trafic réseau, et le refus de surdimensionner l'infrastructure pour une cible d'environ 200 utilisateurs actifs. Le résultat concret est que je n'ai ajouté aucune ressource serveur pour PostgreSQL, déjà installé sur le VPS existant, et que le front est un build statique servi par Nginx plutôt qu'un serveur applicatif dédié. Ce n'est pas un exercice de communication : c'est le même raisonnement de sobriété qui explique pourquoi j'ai choisi Symfony LTS plutôt qu'une version à cycle de vie court, pour limiter la fréquence des migrations.

---

## 4. C1.2.2 — Évaluer la faisabilité technique ⚠️ ÉLIM

**Q15. ⚠️ Sur quoi repose concrètement votre avis de faisabilité, et pas seulement votre intuition que « c'est possible » ?**

**Réponse :** Il repose sur trois audits distincts et complémentaires que j'ai menés au cadrage : un état des lieux fonctionnel des outils existants, un audit technique de l'API du jeu (format des données, latence, limites de débit, absence d'authentification requise), et un audit de l'infrastructure cible (versions PHP, PostgreSQL, mémoire, HTTPS déjà disponibles sur le VPS). Chaque constat d'audit a débouché sur une décision vérifiable : l'API sans garantie de service a imposé le cache, la volumétrie visée d'environ 200 utilisateurs actifs a validé le VPS mutualisé sans besoin de scalabilité horizontale. Mon avis de faisabilité n'est donc pas « c'est possible » dans l'absolu, mais « c'est possible sous trois conditions » que j'énonce explicitement : cache des données du jeu, périmètre v1 limité aux fonctions à plus forte valeur, automatisation des tests et du déploiement dès le départ.

**Q16. ⚠️ Le budget évalué au cadrage (~38 k€, TJM 400 €) n'est-il pas fictif puisque personne ne vous paie réellement ?**

**Réponse :** Le budget est une valorisation, je le dis clairement, mais la méthode qui produit ce chiffre est la même que j'utiliserais pour un vrai client : estimation par analogie lot par lot, affinée en tâches de moins de 2 jours, avec une réserve pour aléas de 10 %. Ce qui rend l'exercice sérieux et non artificiel, c'est que la charge réelle constatée — environ 80 j-h — est cohérente avec les 85 j-h estimés hors réserve, ce qui valide la méthode a posteriori sur un cas réel et vérifiable par les dates de commits Git. Le fait que ce ne soit pas un vrai contrat ne change rien à la rigueur de la démarche d'estimation ; c'est même une preuve que je maîtrise la méthode indépendamment du contexte commercial.

**Q17. ⚠️ Quelles contraintes financières et techniques ont le plus pesé sur vos décisions de cadrage ?**

**Réponse :** La contrainte financière dominante était l'absence de budget pour du cloud managé, ce qui a imposé une architecture sobre sur un VPS mutualisé à environ 10 €/mois et un choix exclusif de briques open source pour ne pas payer de licences. La contrainte technique dominante était l'absence totale de chaîne de livraison et de supervision au moment du cadrage — il fallait tout construire, pas seulement l'application. La contrainte de délai, enfin, imposée par les jalons de certification de juin à octobre 2026, m'a conduit à découper le périmètre en lots priorisés MoSCoW plutôt que de tout vouloir livrer d'un bloc. Ces trois contraintes se recoupent dans le chiffrage : les postes « Qualité & sécurité » et « Documentation & MCO » existent précisément parce que je devais construire ces briques manquantes moi-même.

**Q18. ⚠️ Votre diagnostic infrastructure dit que la chaîne de livraison et la supervision sont « inexistantes » au cadrage. Comment avez-vous transformé cette lacune en plan d'action réaliste ?**

**Réponse :** J'ai traité ce manque comme une charge de travail à part entière et non comme un détail technique, en l'intégrant explicitement dans le lot « Cadrage & socle » du chiffrage. Cette lacune s'est concrétisée en un pipeline CI/CD GitHub Actions avec deux jobs de tests parallèles conditionnant un job de déploiement, et en une supervision double aujourd'hui opérationnelle : UptimeRobot en sonde externe et une sonde cron interne réinstallée automatiquement à chaque déploiement. Le fait d'avoir anticipé cette absence dès le cadrage, plutôt que de la découvrir en cours de projet, m'a évité un chiffrage sous-estimé — c'est un des points sur lesquels j'ai été le plus rigoureux car c'est souvent l'angle mort des petits projets solo.

**Q19. ⚠️ Comment avez-vous validé que la volumétrie cible (~200 utilisateurs actifs) était réaliste et non une estimation en l'air ?**

**Réponse :** Cette cible vient de l'observation de la taille typique d'une guilde active dans Albion Online, un jeu de niche où les communautés organisées se comptent en centaines de membres plutôt qu'en dizaines de milliers — je ne l'ai pas inventée, je l'ai calée sur le contexte réel du commanditaire fictif. Cette hypothèse a directement conditionné un choix d'architecture : pas de besoin de montée en charge horizontale, un seul VPS suffit, ce qui a été confirmé par les indicateurs de supervision en production (temps de réponse moyen 635 ms, disponibilité 99,95 % sur 7 jours). Si la cible avait été 10 fois plus grande, j'aurais dû revoir le choix d'hébergement mutualisé et probablement introduire du cache distribué, donc cette hypothèse n'est pas neutre dans le cadrage.

**Q20. ⚠️ Si le projet n'avait pas été faisable dans les conditions constatées, qu'auriez-vous fait ?**

**Réponse :** J'aurais dû soit réduire davantage le périmètre MUST, soit revoir l'hypothèse d'infrastructure — typiquement basculer sur un hébergement légèrement plus coûteux si le cache seul ne suffisait pas à absorber la dépendance à l'API du jeu. Mon avis de faisabilité n'était d'ailleurs pas inconditionnel : je l'ai formulé comme « faisable à condition de » trois mesures précises, ce qui signifie que si l'une de ces conditions n'avait pas pu être remplie — par exemple si l'API du jeu s'était révélée bien plus limitée en débit que constaté à l'audit — j'aurais dû retravailler le chiffrage avant de lancer le développement. Le fait que ces trois conditions aient effectivement été tenues en production, cache compris, confirme que le seuil de faisabilité était correctement placé et non optimiste par confort.

---

## 5. C1.2.3 — Cartographie des risques, référentiel d'évaluation, indicateurs de contrôle

**Q21. Quel risque identifié au cadrage s'est réellement matérialisé au cours du projet ?**

**Réponse :** Deux se sont matérialisés concrètement. D'abord la donnée manquante sur l'API du jeu : des prix de marché sont parfois absents sur certains serveurs, exactement comme anticipé à l'audit, et j'ai dû gérer ce cas dans l'UX plutôt que de le découvrir en production. Ensuite, un incident de supervision le 14/08 où `deploy.sh` effaçait la crontab à chaque déploiement à cause d'un piège classique de scripting bash sous `set -e` (`grep -v` sortant en code 1 quand la sonde était la seule ligne, tuant le sous-shell avant l'écriture) — un scénario proche du risque R4 (interruption de service liée au déploiement). Dans les deux cas, les mesures prévues au cadrage — cache et UX pour le premier, supervision qui a permis de détecter l'anomalie pour le second — ont permis de l'identifier et de le corriger rapidement, avec traçabilité au CHANGELOG v3.3.1.

**Q22. Comment avez-vous priorisé vos 6 risques, et qu'est-ce qui distingue une criticité « élevée » d'une criticité « moyenne » dans votre référentiel ?**

**Réponse :** J'utilise une criticité calculée comme probabilité × impact sur des échelles de 1 à 3, réévaluée à chaque jalon plutôt que figée une fois pour toutes. R1 (dépendance API du jeu) et R2 (compromission de comptes) sont classés en criticité élevée parce qu'ils combinent une probabilité moyenne à un impact fort ; R3, R4, R5, R6 sont en criticité moyenne parce qu'ils ont soit une probabilité plus faible, soit un impact plus modéré. Mon référentiel fixe des seuils d'action clairs : criticité ≥ 6 impose une mesure préventive obligatoire avant mise en production, 3-4 une mesure planifiée, en dessous une simple surveillance — ce qui évite de traiter tous les risques avec la même énergie.

**Q23. Le risque de compromission de comptes (R2) est classé en criticité élevée. Quelles mesures concrètes avez-vous mises en œuvre, au-delà de l'intention affichée au cadrage ?**

**Réponse :** Les mesures prévues au cadrage — revue OWASP Top 10 systématique, jetons courts, ORM exclusivement, limitation de débit — sont devenues des choix d'architecture réels et mesurables : authentification par JWT désormais en cookies httpOnly depuis la v3.1.0 pour éviter l'exposition côté client, rate limiting actif, CORS en liste fermée, en-têtes de sécurité, activation de compte et réinitialisation de mot de passe sécurisées via Brevo depuis la v3.2.0. La preuve que ce n'est pas resté théorique, c'est que composer audit ne relève aujourd'hui aucun advisory ouverte et que la migration Symfony 7.4 LTS a corrigé 36 advisories dont une CVE de sévérité élevée avant mise en production. C'est exactement l'articulation attendue entre cartographie des risques au cadrage et mesures vérifiées ensuite.

**Q24. Vous présentez un référentiel d'évaluation des risques et un suivi des incidents. Ce ne sont pas juste deux tableaux théoriques ?**

**Réponse :** Non, les deux sont réellement appliqués sur le projet et non seulement esquissés au cadrage. Le référentiel de criticité (probabilité × impact, seuils d'action) a été réévalué à chaque jalon comme prévu. Le suivi des incidents s'appuie sur un registre unique d'anomalies avec une fiche normalisée à 11 champs incluant la reproduction obligatoire, et un cycle consignation → qualification → correctif → re-test → clôture tracée ; ce registre compte aujourd'hui les anomalies BUG-001 à BUG-016 plus une observation OBS-01, toutes tracées jusqu'au CHANGELOG. C'est ce même registre, conçu dès le Bloc 1, qui est réutilisé et démontré en fonctionnement aux Blocs 2 et 4 de la certification — la preuve qu'un outil de cadrage a survécu à l'épreuve du projet réel.

**Q25. Vos indicateurs de contrôle (disponibilité ≥ 99 %, temps de réponse < 1 s, détection ≤ 5 min) sont-ils réellement mesurés aujourd'hui, ou sont-ils restés des cibles sur le papier ?**

**Réponse :** Ils sont mesurés en continu et je peux donner les chiffres actuels : disponibilité 100 % sur les dernières 24 h et 99,95 % sur 7 jours selon UptimeRobot, largement au-dessus de la cible de 99 % ; latence moyenne 635 ms, sous la cible d'1 seconde ; `/api/health` répond en routine en environ 0,8 s en testant à la fois la base de données et l'API du jeu. La détection d'incident est assurée par une supervision double — sonde externe UptimeRobot toutes les 5 minutes et sonde cron interne toutes les 5 minutes également — avec alertes e-mail via Brevo et un canal Monolog « incident » dédié. Ces indicateurs définis au cadrage sont donc devenus des tableaux de bord opérationnels réels, pas des objectifs abstraits.

---

## 6. C1.3.1 — Méthodologie de recherche, sources et outils de veille

**Q26. Concrètement, quelle est la différence entre votre veille « passive », « active » et « exploratoire » ? Ce n'est pas juste trois mots pour dire « je regarde des sites » ?**

**Réponse :** Non, ce sont trois rythmes et trois objectifs différents que j'applique réellement. La veille passive automatisée est quotidienne et vient à moi sans effort — Dependabot me pousse une alerte de sécurité ou de version dès qu'une dépendance est concernée. La veille active ciblée est hebdomadaire et me coûte un effort délibéré de 30 minutes : je consulte les notes de version officielles Symfony et React, SymfonyCasts, les newsletters Symfony Weekly et This Week in React. La veille exploratoire est mensuelle ou liée à des événements — conférences en ligne, meetups, SymfonyLive — et sert à capter des signaux faibles plutôt que des correctifs immédiats. Cette hiérarchie de fréquences est justement ce qui me permet de traiter en priorité l'urgent (sécurité) sans négliger le tendanciel (architecture, écosystème).

**Q27. Donnez-moi une preuve concrète, datée, que votre veille a eu un effet réel sur le projet — pas une intention.**

**Réponse :** La preuve la plus nette est la migration de Symfony 7.2, qui arrivait en fin de vie, vers la version 7.4 LTS. Cette migration n'était pas planifiée au départ dans le chiffrage initial ; elle a été déclenchée par ma veille de sécurité (advisories GitHub, CVE) et exécutée avant la mise en production, corrigeant 36 advisories dont une CVE de sévérité élevée, le tout validé par mes 177 tests automatisés avant d'être livré. C'est un exemple daté et vérifiable dans l'historique Git et le CHANGELOG, pas une déclaration d'intention : la veille a produit une décision technique concrète avec un impact sécurité direct.

**Q28. Pourquoi avoir choisi Dependabot plutôt qu'un outil de veille plus large ou un service payant ?**

**Réponse :** Parce qu'il répond exactement à ma contrainte de cadrage : un projet solo, sans budget outillage, qui a besoin d'une veille automatisée sans effort manuel récurrent. Dependabot est gratuit sur GitHub, couvre à la fois composer (back), npm (front) et les actions CI, et pousse directement des pull requests que mes 177 tests valident ou invalident automatiquement avant fusion. C'est un choix cohérent avec le reste de mon architecture : je préfère systématiquement l'automatisation à la charge manuelle récurrente, parce que je suis seul et que le temps de veille manuel n'est pas extensible. Le résultat mesurable est que composer audit ne remonte aujourd'hui aucun advisory ouverte.

**Q29. Votre veille technologique influence-t-elle vos choix d'architecture, ou reste-t-elle cantonnée à la sécurité ?**

**Réponse :** Elle dépasse la sécurité : je classe mes évolutions par impact métier d'abord (la sécurité prime), mais aussi par impact environnemental — c'est explicitement pourquoi j'ai privilégié une version LTS de Symfony plutôt qu'une version à cycle court, pour réduire la fréquence des migrations futures et donc l'effort et l'empreinte associés. La veille exploratoire, via les conférences et les retours d'expérience de la communauté, alimente aussi mes choix d'écosystème — par exemple le suivi des dépôts communautaires autour de l'API du jeu m'aide à anticiper des changements côté Sandbox Interactive avant qu'ils ne cassent quelque chose en production. La veille au cadrage n'est donc pas un chapitre isolé, elle irrigue les décisions d'architecture et de risques.

---

## 7. C1.3.2 — Étude comparative des solutions techniques et sécurité de l'architecture ⚠️ ÉLIM

**Q30. ⚠️ Pourquoi Symfony plutôt que Laravel ou Node/Express, sur quels critères précis ?**

**Réponse :** J'ai comparé les trois options sur quatre critères identiques : sécurité, écosystème/maintenabilité, accessibilité, impact environnemental/système. Symfony l'emporte sur la maintenabilité parce qu'il propose un cycle LTS de 4 ans et une structure imposée qui facilite la reprise par un tiers — un point important vu mon risque bus factor = 1 — et parce que j'avais déjà une compétence sur ce framework, ce qui réduisait le risque d'exécution du chiffrage. Sur la sécurité, son composant sécurité est mature et les advisories sont bien suivies, avec un ORM qui protège nativement contre l'injection. Sur l'impact système, PHP-FPM est sobre sur un VPS mutualisé sans processus résident permanent, contrairement à un serveur Node qui reste en mémoire en continu — un critère qui compte vu ma contrainte de sobriété.

**Q31. ⚠️ N'est-ce pas un biais de choisir la techno que vous connaissiez déjà, plutôt qu'un choix objectif ?**

**Réponse :** Je ne le nie pas : la compétence déjà acquise fait partie des critères que j'ai assumés, parce qu'en solo, le risque d'exécution d'un framework à apprendre en même temps que le projet est réel et aurait pesé sur le chiffrage. Mais ce n'est pas le seul critère : Symfony l'emporte aussi sur des critères objectifs indépendants de moi — cycle LTS, maturité du composant sécurité, sobriété de PHP-FPM face à un processus Node résident. Si le critère de compétence avait été seul déterminant, je n'aurais pas eu besoin de construire un tableau à quatre critères pour trois briques différentes ; le fait que le même raisonnement retienne PostgreSQL, que je maîtrisais moins bien au départ que MySQL, montre que le choix n'est pas systématiquement celui du confort.

**Q32. ⚠️ Pourquoi JWT plutôt que des sessions serveur classiques, et comment gérez-vous le risque XSS souvent associé au JWT ?**

**Réponse :** J'ai choisi JWT parce que l'architecture sépare un front React et une API Symfony consommée sans état, ce qui évite un stockage de session côté serveur sur un VPS aux ressources modestes — c'est cohérent avec ma contrainte de sobriété. Le risque XSS classique associé au JWT stocké en localStorage était réel, je l'avais identifié, et j'ai fait évoluer l'implémentation en v3.1.0 vers des cookies httpOnly, ce qui rend le jeton inaccessible au JavaScript côté client et neutralise ce vecteur d'attaque. Les jetons sont également à courte durée avec rotation, ce qui limite la fenêtre d'exploitation en cas de compromission. Cette évolution illustre d'ailleurs bien ma démarche : identifier une limite au cadrage, la traiter au fil du projet plutôt que l'ignorer.

**Q33. ⚠️ Pourquoi PostgreSQL plutôt que MongoDB, alors que certaines de vos données (compositions, routes) pourraient sembler plus adaptées à un document ?**

**Réponse :** Mes données centrales — utilisateurs, routes, compositions, cache de marché — sont fondamentalement relationnelles avec des relations bien définies entre entités, ce qui correspond mieux à un modèle relationnel que document. PostgreSQL était en outre déjà installé sur le VPS existant, donc son choix ajoute zéro ressource supplémentaire, contrairement à MongoDB qu'il aurait fallu provisionner. Doctrine, l'ORM de Symfony, s'intègre nativement avec PostgreSQL, ce qui réduit le risque d'erreur de mapping et le temps de développement. Un modèle document aurait pu convenir pour des données peu structurées, mais ce n'est pas la nature de mes données principales — le choix n'est donc pas une préférence, c'est une adéquation vérifiée aux critères du projet.

**Q34. ⚠️ Comment votre étude comparative garantit-elle la sécurité, pas seulement la fonctionnalité ?**

**Réponse :** La sécurité est un des quatre critères explicites de mon tableau comparatif pour chaque brique, pas un sujet traité à part. Pour le back, j'ai retenu un framework au composant sécurité mature avec advisories suivies et ORM anti-injection nativement. Pour le front, React échappe le XSS par défaut. Pour l'authentification, j'ai comparé JWT et sessions serveur sous l'angle sécurité et non seulement sous l'angle architecture, ce qui m'a conduit ensuite à l'évolution vers les cookies httpOnly. Le résultat vérifiable de cette approche est que composer audit ne remonte aujourd'hui aucun advisory ouverte sur les dépendances back, et que la migration LTS a corrigé une CVE élevée avant mise en production — la sécurité de l'étude comparative n'est donc pas restée déclarative.

**Q35. ⚠️ React vs Vue vs Angular : pourquoi React, sachant que vous auriez pu argumenter Vue sur sa simplicité ou Angular sur sa structure ?**

**Réponse :** J'ai comparé les trois sur les mêmes quatre critères. React l'emporte sur l'écosystème et la maintenabilité long terme : c'est le premier écosystème en taille, avec MUI pour les composants et i18next pour l'internationalisation — deux besoins concrets de mon cahier des charges vu mes 20 langues à administrer. Sur l'accessibilité, MUI fournit des composants avec attributs ARIA prêts à l'emploi, ce qui a directement contribué au score Lighthouse accessibilité de 98/100 obtenu en production. Vue aurait été un choix défendable sur la simplicité, Angular sur la structure imposée, mais aucun des deux n'apportait un avantage décisif sur mes critères précis face à l'écosystème et l'accessibilité déjà couverts par React et MUI — c'est un choix motivé par l'adéquation aux besoins, pas par la mode.

---

## 8. C1.4.1 — Évaluer la charge de travail ⚠️ ÉLIM

**Q36. ⚠️ Votre méthode d'estimation par analogie vous semble-t-elle fiable pour un projet aussi original (application liée à un jeu vidéo) ?**

**Réponse :** La méthode par analogie ne compare pas le projet dans sa globalité à un autre projet identique, elle compare lot par lot des tâches déjà réalisées en formation — authentification, CRUD, intégration d'API tierce, front React — qui sont des briques génériques indépendantes du domaine « jeu vidéo ». C'est justement pour cette raison que je découpe en 8 lots (Cadrage & socle, F1 à F5, Qualité & sécurité, Documentation & MCO) plutôt que d'estimer le projet d'un bloc. La fiabilité de la méthode s'est vérifiée a posteriori : la charge réellement consommée, environ 80 j-h, est cohérente avec les 85 j-h estimés hors réserve pour aléas de 10 %. Ce n'est donc pas une méthode théorique, elle a été validée par le réalisé.

**Q37. ⚠️ Et si vous vous étiez trompé de 50 % sur votre estimation de 94 j-h — que se serait-il passé ?**

**Réponse :** Une erreur de 50 % aurait porté la charge à environ 140 j-h, ce qui aurait très probablement mis en péril le respect des jalons de certification imposés entre juin et octobre 2026. Concrètement, ma parade aurait été le découpage MoSCoW : les fonctions COULD (F6, API publique et application mobile) étaient déjà mises en backlog dès le cadrage, donc le premier levier aurait été de reporter également les fonctions SHOULD les moins critiques (F5 confort d'usage) pour sécuriser le périmètre MUST. Dans les faits, je n'ai pas eu à activer ce levier puisque le réalisé (~80 j-h) est resté inférieur à l'estimation, mais le fait d'avoir hiérarchisé le périmètre dès le cadrage est précisément ce qui aurait absorbé un dérapage de cette ampleur sans remettre en cause la livraison du cœur du produit.

**Q38. ⚠️ Votre réserve pour aléas de 10 % a-t-elle vraiment servi, ou est-ce une ligne de confort ajoutée pour faire sérieux ?**

**Réponse :** Elle a réellement servi, et je peux citer l'événement précis qui l'a consommée : la campagne de sécurité de juin 2026, notamment la migration Symfony 7.2 vers 7.4 LTS avec correction de 36 advisories dont une CVE de sévérité élevée, n'était pas prévue au chiffrage initial des lots fonctionnels. C'est exactement le type d'imprévu que la réserve pour aléas est censée couvrir — un événement de sécurité déclenché par la veille et non par un retard d'exécution. Le fait que la charge totale réalisée reste malgré cela proche de l'estimation initiale hors réserve confirme que la réserve a joué son rôle d'amortisseur sans pour autant faire déraper le budget global.

**Q39. ⚠️ Comment avez-vous réparti la charge entre les lots, et pourquoi F2 (Recherche) est-il le plus lourd avec 15 j-h ?**

**Réponse :** J'ai réparti la charge selon la complexité technique réelle de chaque lot plutôt qu'un découpage arbitraire égal. F2 est le plus lourd car il regroupe la recherche joueurs, guildes et batailles avec leurs statistiques, ce qui implique l'intégration complète de l'API du jeu tiers — normalisation des données, gestion du cache, gestion des cas d'absence de données (prix de marché manquants sur certains serveurs) — une complexité d'intégration externe que les autres lots n'ont pas au même degré. À l'inverse, F5 (confort d'usage : i18n, multi-serveur, thème, tutoriel) ne pèse que 8 j-h parce qu'il s'appuie sur des briques déjà posées par les lots précédents plutôt que de créer de nouvelles fondations. Cette granularité de découpage en tâches de 2 jours maximum est ce qui rend l'estimation par analogie fiable lot par lot.

**Q40. ⚠️ La charge livrée (~80 j-h) est légèrement inférieure à l'estimation (85 j-h hors réserve). N'auriez-vous pas dû viser plus juste, voire plus haut pour rester crédible ?**

**Réponse :** Je considère au contraire que cet écart de l'ordre de 6 % entre estimé et réalisé est une preuve de fiabilité de la méthode plutôt qu'un problème : un chiffrage qui tomberait exactement juste au j-h près serait même suspect sur un projet de cette durée. L'écart s'explique par le fait que certains lots (F5 confort, documentation) ont bénéficié de l'expérience accumulée sur les lots précédents, un effet d'apprentissage classique en cours de projet. Ce que je retiens surtout, c'est que la réserve de 10 % a, elle, été consommée par un imprévu réel et non anticipé (la campagne sécurité), ce qui montre que le chiffrage global — lots + réserve — était calibré au bon niveau, ni trop optimiste ni exagérément prudent.

---

## 9. C1.4.2 — Estimation des coûts et budget prévisionnel

**Q41. Sur quoi repose le TJM de 400 € que vous utilisez, et pourquoi ce montant précis ?**

**Réponse :** C'est un TJM de profil junior/débutant en développement full-stack, cohérent avec mon statut de candidat en fin de formation M2 et non celui d'un expert senior — je ne voulais pas gonfler artificiellement la valorisation. Appliqué aux 94 j-h chiffrés, il donne un budget développement de 37 600 €, auquel s'ajoutent 270 € d'infrastructure sur deux ans et 0 € de licences puisque la stack est exclusivement open source, pour un budget prévisionnel total d'environ 38 k€. Ce montant sert avant tout d'exercice de valorisation économique du travail réalisé, cohérent avec l'objectif pédagogique de la compétence C1.4.2 qui demande une estimation des coûts et non un devis commercial réel.

**Q42. Le poste infrastructure (270 € sur 2 ans) vous semble-t-il réaliste, ou sous-estimé pour un vrai projet de production ?**

**Réponse :** Il est réaliste parce qu'il correspond au coût réellement engagé : un VPS mutualisé à environ 10 €/mois plus un nom de domaine, ce qui donne les 270 € sur deux ans, soit environ 135 €/an — c'est d'ailleurs exactement le chiffre que j'avance au commanditaire dans mes préconisations quand il demande combien coûte le maintien en condition opérationnelle. Il n'est pas sous-estimé pour mon volume cible d'environ 200 utilisateurs actifs et une volumétrie de données locales inférieure à 1 Go, validé par les indicateurs de supervision en production (disponibilité 99,95 % sur 7 jours, latence moyenne 635 ms). Il serait en revanche sous-estimé si la cible passait à plusieurs milliers d'utilisateurs, ce qui imposerait de revoir l'hébergement — mais ce n'est pas l'hypothèse retenue et validée au cadrage.

**Q43. Le budget prévisionnel de 38 k€ inclut-il les coûts de maintenance, ou seulement le développement initial ?**

**Réponse :** Il inclut le développement initial (37 600 €) et l'infrastructure sur deux ans (270 €), mais reste centré sur le chiffrage de cadrage du Bloc 1 — la maintenance en condition opérationnelle continue relève du Bloc 4 et de mon coût annuel d'hébergement de 135 €/an que j'annonce d'ailleurs au commanditaire dans mes préconisations. Le poste « Documentation & MCO » (6 j-h) dans mon lot de charge couvre la préparation initiale à la maintenance — manuels, supervision, correctifs — mais pas un budget de run récurrent en j-h, puisque le modèle visé est une automatisation maximale (CI/CD, Dependabot, supervision automatique) pour réduire justement ce coût de maintien à un minimum incompressible.

**Q44. Comment justifiez-vous que les licences et l'outillage soient à 0 € — n'y a-t-il vraiment aucun coût caché ?**

**Réponse :** La stack est exclusivement open source — Symfony, React, PostgreSQL, Doctrine — et les services externes utilisés (GitHub, GitHub Actions, Dependabot, UptimeRobot) le sont dans leurs offres gratuites au volume de ce projet solo. Je ne prétends pas qu'il n'y a strictement aucun coût caché : Brevo, utilisé pour l'envoi d'e-mails transactionnels (activation de compte, réinitialisation, alertes), a un plan gratuit à quota limité qui pourrait devenir payant si le volume d'utilisateurs augmentait fortement — c'est une limite que j'assume et que je surveillerais si le service devait grandir au-delà de la cible actuelle d'environ 200 utilisateurs actifs.

---

## 10. C1.5 — Schémas de l'architecture logicielle proposée

**Q45. Pourquoi avoir choisi le modèle C4 plutôt qu'un diagramme UML complet pour présenter votre architecture ?**

**Réponse :** Parce que mon cadrage s'adresse à deux publics différents : un commanditaire non technicien et une équipe (même réduite à moi seul) qui a besoin de précision technique. Le modèle C4, avec son niveau contexte lisible sans jargon et son niveau conteneurs qui détaille les responsabilités techniques, permet de zoomer progressivement sans changer de notation — contrairement à UML qui, avec ses diagrammes de classes ou de séquence, est illisible pour un non-technicien et parfois trop détaillé même pour un cadrage. Ce choix illustre directement ma préoccupation de double audience évoquée aussi dans mes préconisations : vulgariser au commanditaire, assumer la technique face à un jury professionnel.

**Q46. Pourquoi ne pas avoir opté pour une architecture microservices, plus « à la mode », plutôt qu'une API monolithique ?**

**Réponse :** Parce que les microservices répondent à un besoin de scalabilité indépendante par domaine et d'équipes séparées, ce qui n'est pas mon contexte : je suis seul développeur, sur un VPS mutualisé, avec une cible d'environ 200 utilisateurs actifs et moins d'1 Go de données. Des microservices auraient ajouté une complexité opérationnelle — orchestration, communication réseau interne, observabilité distribuée — sans bénéfice réel à cette échelle, et auraient consommé une part significative de mes 94 j-h en plomberie plutôt qu'en fonctionnalités. Mon architecture en couches Contrôleur → Service → Repository → Entité, standard du framework Symfony, offre déjà une séparation claire des responsabilités et une extensibilité prouvée : le multi-serveur a été ajouté en 2 semaines sans refonte, ce qui aurait été un argument bien plus faible avec une architecture qu'un développeur seul peine à maintenir.

**Q47. Comment votre architecture gère-t-elle concrètement la dépendance à l'API externe du jeu, qui est votre risque le plus critique ?**

**Réponse :** Le schéma d'architecture matérialise cette dépendance comme un flux d'appels sortants explicitement contrôlé — anti-SSRF, cache — et non comme une intégration directe et fragile. Les données de l'API publique Albion Online sont mises en cache local dans PostgreSQL, ce qui permet à l'application de continuer à afficher les dernières données connues en cas de panne ou de latence de l'API tierce, avec un message explicite pour l'utilisateur plutôt qu'une erreur brute. La supervision inclut d'ailleurs un test de l'API du jeu directement dans `/api/health`, ce qui permet de détecter une dégradation de cette dépendance externe en moins de 5 minutes via mes sondes. C'est la traduction architecturale directe du risque R1 identifié dès le cadrage.

**Q48. Vous dites que l'architecture a « prouvé son extensibilité ». Sur quelle preuve concrète vous appuyez-vous, au-delà de l'affirmation ?**

**Réponse :** Sur le fait que l'ajout du multi-serveur (Americas/Europe/Asia) — une fonctionnalité qui touche potentiellement toutes les couches, de la base de données à l'interface — a été réalisé en 2 semaines sans refonte de l'architecture existante, uniquement par extension des contrôleurs, services et entités existants. De la même façon, les 20 langues administrables ont été ajoutées sans toucher à la structure Contrôleur-Service-Repository-Entité posée dès le départ. Ces deux évolutions, survenues après le cadrage initial, sont la preuve empirique que le choix d'une architecture standard en couches, plutôt qu'une solution plus originale, tenait sa promesse de maintenabilité et d'extensibilité annoncée dès le Bloc 1.

---

## 11. C1.6 — Préconisation des axes de solutions et argumentaire ⚠️ ÉLIM

**Q49. ⚠️ Comment structurez-vous votre argumentaire pour emporter l'adhésion d'un commanditaire non technicien ?**

**Réponse :** Je structure ma préconisation en trois temps progressifs et non en une liste de fonctionnalités techniques : d'abord l'essentiel qui remplace immédiatement ce que le commanditaire connaît déjà (retrouver en un seul endroit ce qu'il cherche aujourd'hui sur quatre sites), ensuite ce qui n'existe nulle part ailleurs et constitue la vraie valeur ajoutée (le partage par lien, même sans compte pour le destinataire), enfin l'autonomie qui répond à sa préoccupation de dépendance (un espace d'administration sans développeur). Cette structure suit volontairement la logique MoSCoW du cadrage — Must, Should, autonomie — traduite en bénéfices concrets et non en jargon technique, ce qui est la condition pour obtenir une adhésion réelle plutôt qu'une validation de façade.

**Q50. ⚠️ Quelle objection anticipiez-vous comme la plus difficile à surmonter, et comment l'avez-vous traitée dans votre argumentaire ?**

**Réponse :** La plus difficile est « et si le site du jeu coupe ses données ? » parce qu'elle touche directement à la dépendance externe la plus critique du projet, celle que j'ai identifiée comme risque R1 en criticité élevée. Ma réponse préparée n'est pas une promesse vague mais une explication technique vulgarisée : les données sont mises en réserve chez nous, donc l'outil continue d'afficher les dernières informations connues et prévient l'utilisateur plutôt que de planter silencieusement. C'est une objection que je ne peux pas éliminer complètement — je ne contrôle pas l'API de Sandbox Interactive — donc mon argumentaire vise à démontrer une maîtrise du risque plutôt qu'à nier son existence, ce qui est plus crédible face à un commanditaire.

**Q51. ⚠️ Comment avez-vous traité l'objection sur le coût de fonctionnement, et ce chiffre est-il tenu aujourd'hui ?**

**Réponse :** J'avais annoncé au cadrage environ 135 €/an d'hébergement, le reste étant automatisé — mises à jour surveillées par Dependabot, alertes automatiques en cas de panne via la supervision. Ce chiffre est tenu : l'infrastructure réelle en production reste sur un unique VPS mutualisé avec les mêmes coûts, et je n'ai eu besoin d'aucune ressource supplémentaire pour absorber les évolutions ajoutées depuis — multi-serveur, 20 langues. L'argument qui rassure le plus le commanditaire dans cette réponse, c'est justement que le coût « humain » de maintien n'est pas de 135 €/an à lui seul : c'est l'automatisation (CI/CD, veille, supervision) qui absorbe la charge récurrente, pas mon temps manuel.

**Q52. ⚠️ « Pourquoi pas une application mobile ? » — Comment répondez-vous sans décevoir le commanditaire tout en respectant votre chiffrage ?**

**Réponse :** Je réponds en deux temps : d'abord que le site s'adapte déjà au mobile via un design responsive, ce qui couvre l'usage nomade immédiat sans coût supplémentaire ; ensuite que l'architecture retenue — une API REST séparée du front — rend une application mobile native possible plus tard sans refonte, puisque toutes les données passent déjà par une interface réutilisable. C'est une façon honnête de ne pas fermer la porte sans pour autant l'ouvrir immédiatement : l'application mobile figure d'ailleurs explicitement dans mon diagramme de fonctionnalités comme F6, classée COULD et mise en backlog, ce qui montre que ce n'est pas un point aveugle mais un arbitrage assumé et documenté dès le cadrage.

**Q53. ⚠️ Comment mesurez-vous concrètement que vous avez « obtenu l'adhésion » du commanditaire, au-delà d'un discours convaincant sur le papier ?**

**Réponse :** Dans le cadre de ce projet, l'adhésion se mesure par la cohérence entre ce qui a été préconisé et ce qui a été effectivement livré et validé : le périmètre Must/Should cadré a été intégralement livré et confirmé par 29 scénarios de recette à 100 % PASS, ce qui aurait été impossible si le périmètre préconisé avait été rejeté ou profondément renégocié en cours de route. Les objections anticipées — coût, sécurité, dépendance API — ont toutes reçu une réponse qui s'est vérifiée dans les faits : coût tenu à 135 €/an, sécurité renforcée en v3.1.0/v3.2.0, dépendance API gérée par cache et supervision. L'adhésion n'est donc pas un sentiment déclaré à l'oral, c'est une cohérence vérifiable entre l'engagement pris au cadrage et le produit livré en production.

---

## 12. Questions pièges / déstabilisantes

**Q54. Honnêtement, votre couverture de tests (34 % back, 25 % front) n'est-elle pas trop faible pour un projet que vous présentez comme « professionnel » ?**

**Réponse :** Je l'assume comme une limite réelle et je ne cherche pas à la maquiller : ce ne sont pas des chiffres de couverture exhaustive. Mon choix a été de prioriser la couverture des chemins critiques — authentification, calcul de craft, partage de routes — plutôt qu'une couverture large et superficielle, avec 177 tests automatisés au total (53 back, 124 front) qui restent 100 % verts et bloquants en CI. La limite que j'identifie moi-même est l'absence de plancher de couverture imposé en CI, ce que j'envisage explicitement comme amélioration future. C'est exactement le type de réponse que je veux donner face à une limite : je la nomme, je donne le chiffre exact, et je montre la mesure envisagée plutôt que de prétendre que tout est déjà parfait.

**Q55. Si vous vous étiez trompé de 50 % sur la charge, votre commanditaire vous aurait-il fait confiance une seconde fois ?**

**Réponse :** Probablement pas sans explication solide, ce qui est justement pourquoi je documente ma méthode et non seulement mon résultat : estimation par analogie, réserve pour aléas de 10 %, découpage MoSCoW permettant d'absorber un dépassement en reportant les fonctions les moins prioritaires. Dans les faits je n'ai pas eu à tester cette confiance puisque le réalisé (~80 j-h) est resté sous l'estimation, mais si un dépassement de cette ampleur s'était produit, je l'aurais annoncé au plus tôt — pas à la livraison — avec la cause identifiée, ce qui est la seule façon de préserver une relation de confiance en cas de dérive plutôt que de la découvrir au dernier moment.

**Q56. Vous êtes seul sur ce projet : n'est-ce pas la preuve qu'un vrai commanditaire professionnel ne vous confierait jamais un projet de cette taille ?**

**Réponse :** Je comprends l'objection, et je la retourne en argument plutôt que de l'éviter : un projet solo m'a obligé à être plus rigoureux qu'une équipe, précisément parce qu'il n'y avait personne pour rattraper une erreur — d'où l'automatisation systématique (CI/CD bloquante, Dependabot, supervision double, 177 tests). Le bus factor = 1 est un risque réel que j'ai identifié moi-même dès le SWOT et le cadrage des risques (R6), avec des mesures concrètes : documentation systématique, architecture standard reprenable par un tiers, historique Git conventionnel. Un vrai commanditaire professionnel pourrait effectivement préférer une équipe pour un périmètre plus large, mais pour le périmètre cadré ici — un outil communautaire, pas un système critique à grande échelle — la charge de 94 j-h est cohérente avec un profil junior en solo sur environ 18 mois à temps partiel.

**Q57. N'avez-vous pas construit votre étude comparative a posteriori, pour justifier des choix déjà faits par confort personnel ?**

**Réponse :** C'est une question légitime à laquelle je réponds par un fait vérifiable : si le confort personnel avait été le seul critère, je n'aurais pas retenu PostgreSQL, une base que je maîtrisais moins bien à l'époque que MySQL, mais plutôt sur des critères objectifs — adéquation relationnelle aux données, présence déjà installée sur le VPS existant. De même, l'évolution du JWT vers les cookies httpOnly en v3.1.0 montre que mes choix ont continué d'évoluer après le cadrage initial en fonction de critères de sécurité, pas de préférences figées à l'avance. L'étude comparative n'élimine pas la subjectivité — je l'assume, notamment sur ma compétence préalable en Symfony — mais elle n'est pas non plus une justification a posteriori déguisée : les quatre critères sont appliqués de façon identique aux quatre briques.

**Q58. Si Sandbox Interactive coupait l'accès à son API demain matin, votre produit ne meurt-il pas instantanément ?**

**Réponse :** Non, pas instantanément, et c'est précisément l'objet du risque R1 et de sa mesure principale : le cache local des données dans PostgreSQL permet à l'application de continuer à fonctionner en affichant les dernières données connues, avec un message explicite plutôt qu'une panne silencieuse. Ce que je ne peux pas nier, c'est que sur le long terme, sans mise à jour des données, la valeur du service se dégraderait progressivement — c'est une dépendance structurelle que je ne peux pas éliminer, seulement amortir. C'est d'ailleurs l'objection que j'anticipe explicitement dans mes préconisations au commanditaire, avec la même réponse honnête : le service continue en dégradé et prévient, il ne s'arrête pas net.

**Q59. Votre TJM de 400 € vous semble-t-il crédible face à un jury professionnel qui connaît les vrais tarifs du marché ?**

**Réponse :** Je le positionne explicitement comme un TJM junior, cohérent avec mon niveau de sortie de formation M2 et non avec un profil senior ou expert — je préfère un chiffre défendable et modeste à un chiffre gonflé qui serait facilement contesté par un jury professionnel. La cohérence de ce choix se voit dans le résultat : appliqué aux 94 j-h chiffrés, il donne 37 600 €, un montant qui reste dans un ordre de grandeur plausible pour un projet de cette taille réalisé par un développeur junior en solo. Je resterais transparent si le jury objectait un TJM différent : la méthode d'estimation (j-h par lot, réserve 10 %) est indépendante du TJM choisi et resterait valable avec un tarif senior, seul le montant final changerait.

**Q60. MoSCoW vous a fait sacrifier des fonctionnalités. Le commanditaire a-t-il vraiment eu son mot à dire sur ce qui a été sacrifié, ou avez-vous décidé seul ?**

**Réponse :** La hiérarchisation MoSCoW a été construite à partir des entretiens d'usage et de l'audit des outils tiers, donc ancrée dans les besoins exprimés plutôt que dans mon confort de développement — le Must reprend exactement ce qui remplace les outils tiers existants, le Should les différenciateurs. Ce qui a été sacrifié en Could, à savoir F6 (API publique et application mobile), correspond aux fonctions les moins urgentes pour l'usage quotidien immédiat du commanditaire, et non aux moins intéressantes à développer pour moi. Je reconnais la limite du contexte fictif : sans commanditaire réel pour arbitrer formellement ce compromis, l'arbitrage final reste le mien, ce que j'assume plutôt que de prétendre à une validation contradictoire qui n'a pas eu lieu.

**Q61. Avec le recul, que referiez-vous différemment dans votre cadrage ?**

**Réponse :** Je renforcerais le plancher de couverture de tests dès le chiffrage initial plutôt que de le traiter comme une amélioration continue après coup — c'est une limite que j'ai identifiée en cours de route plutôt qu'anticipée au cadrage. Je formaliserais aussi davantage le recueil de besoin, par exemple avec des retours utilisateurs structurés en amont plutôt que principalement mon expérience de joueur, même si le contexte solo/fictif limitait cette option. Enfin, je documenterais plus tôt certains scripts d'infrastructure critiques comme `deploy.sh` — l'incident de crontab du 14/08 aurait pu être évité par une revue de script plus systématique dès sa première version, ce qui montre qu'un cadrage rigoureux sur le produit ne dispense pas d'une rigueur équivalente sur l'outillage annexe.

**Q62. Quelles sont, selon vous, les limites de votre cadrage que le jury devrait challenger en premier ?**

**Réponse :** La première limite est le recueil de besoin, qui repose sur mon expérience de joueur et l'observation communautaire plutôt que sur des entretiens formalisés avec un commanditaire réel et contradictoire. La deuxième est la couverture de tests, 34 % back et 25 % front, suffisante pour les chemins critiques mais pas exhaustive, sans plancher CI imposé au moment du cadrage. La troisième est le bus factor = 1, un risque structurel que je compense par l'automatisation et la documentation mais que je ne peux pas éliminer complètement dans un contexte solo. Je préfère nommer ces trois limites moi-même plutôt que d'attendre qu'elles soient découvertes, parce que c'est la meilleure preuve que mon cadrage a été mené avec un regard critique et non seulement complaisant envers mon propre travail.

**Q63. En résumé, si vous deviez convaincre le jury en une seule phrase que ce cadrage n'était pas un exercice académique déconnecté du réel, que diriez-vous ?**

**Réponse :** Je dirais que chaque décision du cadrage se retrouve vérifiable en production aujourd'hui : le risque API a produit un cache qui fonctionne, la charge de 94 j-h a produit un réalisé d'environ 80 j-h cohérent, l'architecture C4 a produit un multi-serveur ajouté en 2 semaines sans refonte, et la veille a produit une migration LTS avant une CVE critique — le cadrage n'a pas été un document isolé du Bloc 1, il a été le plan que le projet a exécuté et que les Blocs 2, 3 et 4 démontrent ensuite en fonctionnement réel.
