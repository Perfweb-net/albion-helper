#!/bin/sh
# Script de déploiement exécuté SUR le serveur (appelé par le job CI via SSH).
# Prérequis serveur : git, php >= 8.2, composer, node >= 20, accès en écriture au dossier.
set -e

echo "=== Déploiement Albion Helper ==="
cd "$(dirname "$0")/.."

echo "--- Mise à jour du code (master) ---"
git fetch origin master
git reset --hard origin/master

echo "--- Backend : dépendances, migrations, cache ---"
cd back
composer install --no-dev --optimize-autoloader --no-interaction
php bin/console lexik:jwt:generate-keypair --skip-if-exists
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
php bin/console cache:clear --env=prod

echo "--- Frontend : build de production ---"
cd ../front
npm ci --legacy-peer-deps
npm run build

echo "=== Déploiement terminé : $(date '+%Y-%m-%d %H:%M:%S') ==="
