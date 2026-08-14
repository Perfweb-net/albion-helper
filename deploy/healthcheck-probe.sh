#!/bin/sh
# Sonde de supervision auto-hébergée — Albion Helper
# Installation (sur le VPS) : crontab -e
#   */5 * * * * /chemin/vers/albion-helper/deploy/healthcheck-probe.sh
#
# Vérifie /api/health toutes les 5 minutes :
#  - statut HTTP 200 attendu
#  - champ "status":"OK" attendu dans la réponse JSON
# En cas d'échec : journalise dans PROBE_LOG et envoie un e-mail d'alerte.
# Anti-spam : une seule alerte par incident (fichier témoin), e-mail de
# rétablissement quand le service répond à nouveau.

API_URL="${PROBE_URL:-https://albion-back.perfweb.net/api/health}"
ALERT_EMAIL="${PROBE_EMAIL:-opoweb03@gmail.com}"
STATE_FILE="/tmp/albion-helper-probe.down"

# Journal : /var/log si l'utilisateur du cron peut y écrire, sinon son HOME
# (le déploiement tourne sans privilèges — le journal ne doit jamais être muet).
if [ -z "$PROBE_LOG" ]; then
    if [ -w /var/log/albion-helper-probe.log ] || [ -w /var/log ]; then
        PROBE_LOG="/var/log/albion-helper-probe.log"
    else
        PROBE_LOG="$HOME/albion-helper-probe.log"
    fi
fi

# La commande mail peut être absente du serveur : on journalise au lieu de
# perdre silencieusement l'alerte (l'alerte applicative Brevo de /api/health
# reste le canal principal d'e-mail).
send_mail() {
    if command -v mail >/dev/null 2>&1; then
        mail -s "$1" "$ALERT_EMAIL" 2>>"$PROBE_LOG" || true
    else
        echo "$NOW MAIL-SKIP (commande mail absente) : $1" >> "$PROBE_LOG"
        cat >/dev/null
    fi
}

NOW=$(date '+%Y-%m-%d %H:%M:%S')
HTTP_CODE=$(curl -s -o /tmp/albion-probe-body.json -w "%{http_code}" --max-time 10 "$API_URL" 2>/dev/null)
BODY_OK=$(grep -c '"status":"OK"' /tmp/albion-probe-body.json 2>/dev/null || echo 0)

if [ "$HTTP_CODE" = "200" ] && [ "$BODY_OK" -ge 1 ]; then
    echo "$NOW OK http=$HTTP_CODE" >> "$PROBE_LOG"
    if [ -f "$STATE_FILE" ]; then
        rm -f "$STATE_FILE"
        echo "Albion Helper est de nouveau disponible ($NOW)." \
            | send_mail "[Albion Helper] RETABLISSEMENT — API disponible"
        echo "$NOW RECOVERY notified" >> "$PROBE_LOG"
    fi
else
    echo "$NOW FAIL http=$HTTP_CODE body_ok=$BODY_OK" >> "$PROBE_LOG"
    if [ ! -f "$STATE_FILE" ]; then
        touch "$STATE_FILE"
        {
            echo "La sonde de supervision a détecté une indisponibilité ($NOW)."
            echo "URL    : $API_URL"
            echo "HTTP   : $HTTP_CODE"
            echo "Corps  :"
            cat /tmp/albion-probe-body.json 2>/dev/null
        } | send_mail "[Albion Helper] ALERTE — API indisponible (HTTP $HTTP_CODE)"
        echo "$NOW ALERT notified" >> "$PROBE_LOG"
    fi
fi
