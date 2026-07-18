#!/bin/sh
# Script de déploiement exécuté SUR le serveur (appelé par le job CI via SSH).
# Prérequis serveur : git, php >= 8.2, composer, node >= 20, accès en écriture au dossier.
set -e

echo "=== Déploiement Albion Helper ==="
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

echo "--- Mise à jour du code (master) ---"
git fetch origin master
git reset --hard origin/master

echo "--- Backend : dépendances, migrations, cache ---"
cd back
composer install --no-dev --optimize-autoloader --no-interaction
php bin/console lexik:jwt:generate-keypair --skip-if-exists
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
php bin/console app:seed-reference-data --env=prod --no-interaction
php bin/console cache:clear --env=prod

echo "--- Frontend : build de production ---"
cd ../front
npm ci --legacy-peer-deps
npm run build

echo "--- Supervision : installation de la sonde cron (*/5) ---"
# Idempotent : l'ancienne ligne est retirée puis la ligne courante réécrite,
# la sonde suit donc automatiquement chaque déploiement.
chmod +x "$PROJECT_DIR/deploy/healthcheck-probe.sh"
CRON_LINE="*/5 * * * * $PROJECT_DIR/deploy/healthcheck-probe.sh"
( crontab -l 2>/dev/null | grep -vF "deploy/healthcheck-probe.sh" ; echo "$CRON_LINE" ) | crontab -
echo "Sonde installée : $CRON_LINE"

echo "=== Déploiement terminé : $(date '+%Y-%m-%d %H:%M:%S') ==="
