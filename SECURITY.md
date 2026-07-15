# Sécurité — couverture OWASP Top 10 (2021)

Ce document cartographie chaque famille de risques du [Top 10 OWASP 2021](https://owasp.org/Top10/fr/)
vers les mesures concrètes du code. Chaque mesure est vérifiable dans le fichier cité,
et la plupart sont couvertes par la recette de sécurité (scénarios `SEC-*` et `AUTH-*`,
cf. dossier Bloc 2 §10) ou les tests automatisés.

| # | Risque | Mesures dans Albion Helper | Où dans le code |
|---|---|---|---|
| **A01** | Contrôle d'accès défaillant | Toutes les routes `/api` exigent un JWT sauf liste publique explicite ; `/api/admin` restreint à `ROLE_ADMIN` ; contrôle de propriété sur les routes et compositions (un utilisateur ne voit ni ne supprime celles d'un autre — 404, pas de fuite d'existence) | `back/config/packages/security.yaml` (`access_control`) · `back/src/Controller/RouteController.php` / `CompositionController.php` (filtrage par `getUser()`) |
| **A02** | Défaillances cryptographiques | Mots de passe hachés **bcrypt** (coût auto) ; JWT signés **RS256**, paire de clés générée sur chaque machine et exclue de git ; jetons délivrés en **cookies httpOnly + Secure** (v3.1.0) ; HTTPS en production ; aucun secret commité | `back/config/packages/security.yaml` (`password_hashers`) · `back/config/packages/lexik_jwt_authentication.yaml` (`set_cookies`) · `.gitignore` (`*.pem`) |
| **A03** | Injection | 100 % des accès BDD passent par **Doctrine ORM** (requêtes paramétrées) ; entrées validées et bornées (regex sur les identifiants d'items, `substr`, bornes min/max) ; aucun SQL concaténé | `back/src/Repository/*` · `back/src/Controller/ItemController.php` (validation regex) |
| **A04** | Conception non sécurisée | Rate limiting à l'inscription : **5 comptes/IP/heure** ; expiration automatique des routes à 24 h ; jetons de partage imprévisibles (`bin2hex(random_bytes())`) | `back/config/packages/rate_limiter.yaml` · `back/src/Controller/AuthController.php` (limiteur) · `back/src/Entity/GameRoute.php:47`, `Composition.php:46` |
| **A05** | Mauvaise configuration de sécurité | CORS restreint par variable d'environnement (`origin_regex`, jamais de wildcard — y compris avec `allow_credentials`) ; en-têtes de sécurité posés globalement : `X-Content-Type-Options`, `X-Frame-Options DENY`, `Referrer-Policy`, `Content-Security-Policy` ; pas de stack trace en prod | `back/config/packages/nelmio_cors.yaml` · `back/src/EventSubscriber/SecurityHeadersSubscriber.php` |
| **A06** | Composants vulnérables et obsolètes | Symfony **7.4 LTS** (migration depuis 7.2 EOL : 36 advisories corrigées dont CVE-2025-64500) ; `composer audit` : 0 advisory ; Dependabot hebdomadaire (composer, npm, GitHub Actions) ; vulnérabilités npm restantes limitées à la chaîne de build dev (`react-scripts`), risque accepté et documenté | `back/composer.lock` · `.github/dependabot.yml` |
| **A07** | Identification et authentification défaillantes | **Login throttling** : 5 échecs max / 15 min (par utilisateur + IP) ; mot de passe ≥ 8 caractères ; JWT à durée courte (1 h) en cookie httpOnly ; **rotation des refresh tokens** (`single_use` : un jeton volé ne sert qu'une fois) ; déconnexion côté serveur (`/api/logout` invalide le refresh token en base) | `back/config/packages/security.yaml` (`login_throttling`) · `back/config/packages/gesdinet_jwt_refresh_token.yaml` · `back/src/Controller/AuthController.php` |
| **A08** | Défaut d'intégrité logiciel/données | Dépendances installées exclusivement depuis les lockfiles (`composer.lock`, `package-lock.json`) ; pipeline CI exécuté par GitHub Actions ; schéma BDD versionné par migrations Doctrine (jamais de SQL manuel en production) | `back/composer.lock` · `front/package-lock.json` · `back/migrations/` · `.github/workflows/main.yml` |
| **A09** | Journalisation et surveillance insuffisantes | Canal Monolog **`incident`** dédié (dev + prod) ; échecs d'authentification tracés par le firewall ; aucun mot de passe ni secret en clair dans les logs ; supervision : endpoint public `/api/health` (état BDD + API externe) + sonde cron auto-installée au déploiement | `back/config/packages/monolog.yaml` · `back/src/Controller/HealthCheckController.php` · `deploy/healthcheck-probe.sh` |
| **A10** | SSRF (falsification de requête côté serveur) | Le proxy d'icônes n'accepte qu'un identifiant d'item validé par regex stricte (`^[A-Za-z0-9_@]+$`) interpolé dans une URL fixe : aucune URL fournie par l'utilisateur n'est requêtée ; les domaines de l'API Albion sont une liste fermée (un par serveur de jeu) | `back/src/Controller/ItemController.php` · `back/src/Service/AlbionDataMapper.php` |

## Vérifier soi-même

```bash
# Audits de dépendances
cd back && composer audit
cd front && npm audit

# Suites de tests (incluent les tests de sécurité : 401 sans jeton,
# verrouillage du login, cookies httpOnly, propriété des données…)
cd back && APP_ENV=test php bin/phpunit
cd front && CI=true npm test -- --watchAll=false

# En-têtes de sécurité et santé de l'API
curl -i https://localhost:8000/api/health
```

## Signaler une vulnérabilité

Projet pédagogique (certification RNCP39583) : ouvrir une issue GitHub sur
`Perfweb-net/albion-helper` ou contacter le mainteneur.
