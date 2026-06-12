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
PROBE_LOG="${PROBE_LOG:-/var/log/albion-helper-probe.log}"
STATE_FILE="/tmp/albion-helper-probe.down"

NOW=$(date '+%Y-%m-%d %H:%M:%S')
HTTP_CODE=$(curl -s -o /tmp/albion-probe-body.json -w "%{http_code}" --max-time 10 "$API_URL" 2>/dev/null)
BODY_OK=$(grep -c '"status":"OK"' /tmp/albion-probe-body.json 2>/dev/null || echo 0)

if [ "$HTTP_CODE" = "200" ] && [ "$BODY_OK" -ge 1 ]; then
    echo "$NOW OK http=$HTTP_CODE" >> "$PROBE_LOG"
    if [ -f "$STATE_FILE" ]; then
        rm -f "$STATE_FILE"
        echo "Albion Helper est de nouveau disponible ($NOW)." \
            | mail -s "[Albion Helper] RETABLISSEMENT — API disponible" "$ALERT_EMAIL" 2>>"$PROBE_LOG" || true
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
        } | mail -s "[Albion Helper] ALERTE — API indisponible (HTTP $HTTP_CODE)" "$ALERT_EMAIL" 2>>"$PROBE_LOG" || true
        echo "$NOW ALERT notified" >> "$PROBE_LOG"
    fi
fi
