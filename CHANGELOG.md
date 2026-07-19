# Changelog

All notable changes to the Albion Helper project will be documented in this file.

## [3.2.0] - 2026-07-19
### Added
- **Réinitialisation de mot de passe par e-mail :** adresse e-mail optionnelle sur le compte (unique, validée), `POST /api/password/forgot` (réponse générique anti-énumération, rate limit 5/h par IP) et `POST /api/password/reset` (jeton à usage unique valable 1 h, seul son hash SHA-256 est stocké). Pages front `/forgot-password` et `/reset-password`, champ e-mail optionnel à l'inscription. Envoi via Brevo (SMTP), templates HTML aux couleurs du site.
- **Confirmation d'adresse à l'inscription :** e-mail de vérification (jeton à usage unique, hash SHA-256), endpoint `POST /api/email/verify` et page `/verify-email`. La récupération de compte n'est active que pour une adresse confirmée (anti-abus + consentement RGPD).
- **Alertes de supervision par e-mail :** `/api/health` envoie le détail des services en erreur à `ALERT_EMAIL` (anti-spam : 1 envoi max / 30 min). Commande `app:mail-test` pour vérifier la configuration SMTP.
- **Tests :** +38 tests (confirmation d'adresse, flux complet forgot → e-mail → reset → login côté back, pages front) — 169 au total (51 back, 118 front).

## [3.1.0] - 2026-07-15
### Security
- **Jetons JWT en cookies httpOnly :** le jeton d'accès et le refresh token ne transitent plus par localStorage — ils sont posés et lus exclusivement par l'API (cookies httpOnly + Secure). La classe d'attaque XSS → vol de jeton disparaît ; l'axe d'amélioration identifié au Bloc 2 (§7.1) est réalisé.
- **Nouvelles routes :** `GET /api/me` (identité de la session : username + rôles) et `POST /api/logout` (invalidation du refresh token en base + expiration des cookies).
- **CORS :** `allow_credentials` activé, origines toujours en liste fermée (`origin_regex`).
- **BUG-016 :** la suppression d'un compte échouait si l'utilisateur possédait des routes (contrainte FK sans cascade) — migration `ON DELETE CASCADE`, droit à l'effacement complet.

### Changed
- Front : session observée via `/api/me` (contexte utilisateur), rafraîchissement automatique sur 401 puis rejeu de la requête ; suites de tests Login/authUtils réécrites (96 tests).
- Repasse design : filet héraldique sous les titres de page, focus clavier visible (`:focus-visible`), respect de `prefers-reduced-motion`, états vides réécrits, navigation regroupée en sous-menus Exploration/Outils.

### Fixed
- **BUG-014 :** titre de section du craft affiché comme « KEY 'craft.settings' returned an object » — clé i18n dédiée `craft.settings.title` (fr + en).
- **BUG-015 :** mode clair illisible par endroits (variables Sass figées sur la palette sombre) — variables CSS commutées par `body[data-theme]`.

## [3.0.0] - 2026-07-03
### Added
- **Multi-serveur :** support des trois serveurs de jeu (Americas, Europe, Asia) — sélecteur dans l'en-tête, tous les endpoints back paramétrés par serveur.
- **Statistiques PvP joueur :** kills, morts et rapport de session sur la fiche joueur.
- **Batailles :** recherche par guilde/alliance et page de détail d'une bataille.
- **Craft localisé :** noms d'objets traduits dans les recettes de craft.
- **Langues d'interface dynamiques :** gestion des langues depuis le back office (activation, templates de traduction téléchargeables) et internationalisation des dernières pages restantes — l'interface est désormais 100 % i18n.

### Changed
- **Thème visuel :** thème sombre « fantasy » (palette dorée) appliqué à toute l'interface.
- **Build :** build de production v3 du front.

### Fixed
- **CORS / sécurité :** ajustements pour le multi-serveur et l'exposition publique des langues.
- **Tests :** suites Admin et Dashboard réalignées après le passage des libellés en i18n (12 suites / 95 tests verts).

## [2.1.0] - 2026-06-12
### Security
- **BUG-010 :** CORS en wildcard `['*']` — remplacé par la variable d'environnement `CORS_ALLOW_ORIGIN` avec `origin_regex` (localhost en dev, sous-domaines perfweb.net en prod).
- **Rate limiting :** `login_throttling` sur `/api/login` (5 tentatives / 15 min) et limiteur `registration` sur `/api/register` (5 inscriptions / IP / heure) via `symfony/rate-limiter`.
- **Politique de mot de passe :** longueur minimale de 8 caractères imposée à l'inscription.
- **Headers de sécurité :** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` et `Content-Security-Policy` ajoutés sur toutes les réponses `/api` (`SecurityHeadersSubscriber`).
- **Rotation des refresh tokens :** `single_use: true` (gesdinet) — un refresh token volé ne peut servir qu'une seule fois.
- **Dépendances backend :** migration Symfony 7.2 (EOL) → **7.4.13 LTS** — corrige 36 advisories dont CVE-2025-64500 (high, bypass d'autorisation via PATH_INFO dans http-foundation). `composer audit` : 0 advisory.
- **Dépendances frontend :** axios 1.7.9 → 1.17.0 (advisory high corrigée). Vulnérabilités restantes limitées à la chaîne de build `react-scripts` (outillage de dev, risque accepté et documenté).
- **Dependabot :** activé (`.github/dependabot.yml`) pour composer, npm et GitHub Actions (C4.1.1).

### Fixed
- **BUG-011 :** Échec de connexion invisible — l'intercepteur axios rechargeait la page sur tout 401, y compris celui du login ; les appels d'authentification sont désormais exclus de la redirection (détecté par la recette AUTH-05).
- **BUG-012 :** « Kill Ratio : NaN » sur la fiche joueur quand Death Fame = 0 — garde ajoutée (détecté par la recette RECH-02).
- **BUG-013 :** Clés React dupliquées dans les listes de guildes (`AllianceId` non unique) — remplacées par `guild.Id` (détecté par la recette RECH-03).
- **Accessibilité (audit axe-core/Lighthouse du 12/06) :** 47 curseurs de maîtrise sans étiquette (`aria-label` ajouté), sélecteurs sans `labelId`, contraste du texte désactivé relevé de 1,8:1 à 4,5:1. Scores Lighthouse : login 100, register 100, accueil 93.
- **BUG-009 :** Page Admin — la carte « nouveaux aujourd'hui » affichait toujours « — » (`stats.newUsersToday` lu au lieu de `newToday` renvoyé par l'API).
- **Tests Admin.jsx :** 7 tests Jest en échec — le mock `useTranslation` recréait `t` à chaque render, provoquant une boucle infinie de fetch via `useCallback([t])` ; mocks et assertions réalignés sur la page (i18n). Suites : 12/12, 95 tests verts.
- **Code mort :** `AuthController::login()` (jamais exécuté, intercepté par `json_login`) remplacé par le pattern documenté Symfony (route conservée pour le `check_path`, corps explicite).

## [2.0.0] - 2026-06-10
### Added
- **Administration :** tableau de bord admin (KPI utilisateurs/routes/recherches, gestion des comptes et des rôles, synchronisation des items depuis l'API Albion), protégé par `ROLE_ADMIN`.
- **Internationalisation :** i18n complet (react-i18next), langues administrables depuis la page Admin (templates de traduction téléchargeables).
- **Routes :** création de routes liant jusqu'à 8 cartes, timer par carte (max 24 h), expiration automatique à 24 h, partage par lien public (`/api/routes/share/{token}`).
- **Compositions :** éditeur de compositions de groupe, visibilité privée/publique, partage par token, export image.
- **Craft :** calculateur de craft (recettes, ingrédients, données de marché par ville, focus/spécialisations via les préférences du profil).
- **Items :** base d'items synchronisée + proxy d'icônes (`/api/proxy/icon/{uniqueName}`).
- **Profil :** préférences utilisateur (ville, premium, focus, spécialisations).
- **Mode sombre :** thème clair/sombre persistant.
- **Tutoriel :** page de présentation des fonctionnalités, accessible connecté ou non.
- **Refonte UI :** nouveau design complet (MUI, thème personnalisé).

## [1.2.0] - 2026-06-02
### Added
- **Tests PHPUnit :** Ajout de `GuildControllerTest`, `PlayerControllerTest`, `ZoneControllerTest`, `GuildServiceTest` — couverture 18 tests, 50 assertions (C2.2.2).
- **Tests Jest :** Ajout de `Login.test.jsx` et `Register.test.jsx` — 9 tests frontend (C2.2.2).
- **Documentation :** Création du cahier de recettes (`doc/cahier_de_recettes.md`) — 41 cas de test (C2.3.1).
- **Documentation :** Schéma d'architecture logicielle (`doc/architecture_logicielle.md`) (C2.2.1).
- **Documentation :** Référentiel accessibilité RGAA 4.1 (`doc/accessibilite_rgaa.md`) (C2.2.3).
- **Documentation :** Manuels déploiement, utilisation et mise à jour (`doc/manuels.md`) (C2.3.2).
- **Documentation :** Plan CI/CD et gestion des bogues (`doc/cicd_et_gestion_bogues.md`) (C2.3.1).
- **Utilitaire :** Extraction de `isTokenValid` vers `front/src/utils/authUtils.js` (brise la dépendance circulaire).
- **Configuration :** Variables d'environnement `front/.env.development` et `front/.env.production`.

### Fixed
- **BUG-001 :** `isTokenValid()` retournait une Promise (toujours truthy) — corrigé en async/await dans `authUtils.js`.
- **BUG-002 :** Dépendance circulaire `api.js ↔ PrivateRoute.jsx` — résolue par extraction vers `authUtils.js`.
- **BUG-003 :** `Zone.php` — `$this->markers` non initialisé dans le constructeur — corrigé.
- **BUG-004 :** Route `/api/health` retournait 401 — rendue `PUBLIC_ACCESS` dans `security.yaml`.
- **BUG-005 :** `APP_SECRET` avec valeur par défaut non sécurisée — nouveau secret généré.
- **BUG-006 :** `<html lang="en">` corrigé en `lang="fr"`.
- **BUG-007 :** CI/CD utilisait MySQL incompatible avec les tests SQLite — workflow corrigé.
- **BUG-008 :** Imports morts et commentaires copier-collés dans les contrôleurs — nettoyés.

### Changed
- **CI/CD :** Workflow GitHub Actions migré de MySQL vers SQLite, ajout de la génération de clés JWT et de la création du schéma de BDD de test.
- **Header :** Ajout `aria-expanded`, `aria-controls` sur le bouton burger, `id` et `aria-label` sur le Drawer (RGAA 12.6).

## [1.1.0] - 2026-06-01
### Added
- **Supervision:** Added `/api/health` endpoint for real-time monitoring of database and external API status (RNCP C4.1.2).
- **Logging:** Configured a dedicated `incident` channel in Monolog for production incident tracking (RNCP C4.2.1).
- **CI/CD:** Implementation of GitHub Actions for automated testing and deployment protocols (RNCP C2.1.2).
- **Testing:** Added backend PHPUnit tests (Entities, Services, Controllers) and frontend Jest tests (RNCP C2.2.2).

### Changed
- **Architecture:** Refactored `ZoneController` logic into `MapService` to implement proper Service-Oriented Architecture (RNCP C2.2.1).
- **Accessibility:** Improved semantic HTML and added ARIA labels to the Header component (RNCP C2.2.3).

## [1.0.0] - 2026-05-15
### Added
- Initial release of the Albion Helper prototype.
- User authentication with JWT and Refresh Tokens.
- Interactive map with markers, resources, and mobs.
- Dashboard for player and guild statistics.
