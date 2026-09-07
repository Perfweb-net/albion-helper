# Albion Helper

**Application web d'assistance aux joueurs d'Albion Online** — recherche de joueurs, guildes et batailles, cartes et itinéraires partageables, compositions d'équipe et calculateur d'artisanat, le tout multilingue et multi-serveur.

[![CI](https://github.com/Perfweb-net/albion-helper/actions/workflows/main.yml/badge.svg)](https://github.com/Perfweb-net/albion-helper/actions/workflows/main.yml)

🌐 **En production : [oportaler.perfweb.net](https://oportaler.perfweb.net)** · API : [albion-back.perfweb.net](https://albion-back.perfweb.net/api/health)

Projet réalisé dans le cadre du titre **RNCP39583 — Expert en développement logiciel** (YNOV, M2), et utilisé en conditions réelles par une communauté de joueurs.

## Fonctionnalités

- 🔎 **Recherche** de joueurs, guildes, alliances et batailles ZvZ, avec statistiques PvP/PvE et rapports de session
- 🗺️ **Cartes et itinéraires** de farming partageables par lien public (sans compte pour le destinataire)
- ⚔️ **Compositions d'équipe** (jusqu'à 100 joueurs, export JPEG) et **calculateur de rentabilité de craft** sur les prix de marché en temps réel
- 🌍 **12 066 objets catalogués, 20 langues administrables, 3 serveurs de jeu** (Americas / Europe / Asia)
- 🔐 Authentification durcie : JWT en **cookies httpOnly**, jetons courts, rotation des refresh tokens, rate limiting
- 🛠️ **Back-office** complet : KPI, rôles, synchronisation des items, gestion des langues — sans intervention technique

## Stack

| Couche | Technologie |
|---|---|
| Backend | Symfony 7.4 LTS (PHP 8.2) — API REST stateless, architecture en couches |
| Frontend | React 19 + Material UI — SPA responsive, i18n (react-i18next) |
| Base de données | PostgreSQL 16 + Doctrine ORM/Migrations |
| CI/CD | GitHub Actions — 177 tests bloquants, déploiement continu conditionné |
| Supervision | Double sonde (UptimeRobot + cron) sur `/api/health`, alertes e-mail, canal Monolog dédié |
| Données de jeu | API publique officielle d'Albion Online (cache + dégradation gracieuse) |

## Démarrage rapide (développement)

```bash
# Backend
cd back
docker compose up -d          # PostgreSQL 16 + mailer
composer install
php bin/console lexik:jwt:generate-keypair
php bin/console doctrine:migrations:migrate
symfony serve                 # API sur :8000

# Frontend
cd front
npm ci --legacy-peer-deps
npm start                     # SPA sur :3000
```

## Tests

```bash
# Backend — PHPUnit (SQLite dédiée)
cd back && APP_ENV=test php bin/phpunit

# Frontend — Jest + React Testing Library
cd front && CI=true npm test -- --watchAll=false
```

Les deux suites (177 tests) sont **bloquantes en CI** : aucune fusion ni aucun déploiement sans 100 % de réussite. La recette fonctionnelle compte 29 scénarios, tous validés.

## Intégration et déploiement continus

- Chaque push déclenche deux jobs parallèles (`backend-tests`, `frontend-tests`)
- La fusion `develop → master` est l'acte de mise en production : le job `deploy` (conditionné aux tests verts) livre via SSH et `deploy/deploy.sh`, migrations et installation de la sonde de supervision comprises
- Mises à jour de dépendances : Dependabot hebdomadaire (composer, npm, GitHub Actions)

## Suivi du projet

- 📋 [Tableau Kanban — Albion Helper · Pilotage](https://github.com/users/Perfweb-net/projects/3)
- 📄 [CHANGELOG](CHANGELOG.md) — format *Keep a Changelog*, versionnage sémantique
- 🐛 [Registre des anomalies](https://github.com/Perfweb-net/albion-helper/issues?q=label%3Abug) — fiches normalisées (BUG-001 → BUG-016 + OBS-01)
- 🔒 [Politique de sécurité](SECURITY.md)

## Licence et données

Projet communautaire à but non lucratif. Les données de jeu proviennent de l'API publique de [Sandbox Interactive](https://albiononline.com), consommée dans le respect de ses conditions d'utilisation (cache local, rate limiting). Aucune statistique de joueur n'est persistée par l'application.
