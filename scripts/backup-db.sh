#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Backup PostgreSQL depuis le container Docker
# Usage: bash scripts/backup-db.sh
# Cron recommandé (crontab -e) :
#   0 3 * * * /home/deploy/recoltes/scripts/backup-db.sh
# ============================================================

BACKUP_DIR="/home/deploy/backups"
CONTAINER_NAME="recoltes-db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/recoltes_$TIMESTAMP.sql.gz"
DAYS_TO_KEEP=14

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Début du backup..."

docker exec "$CONTAINER_NAME" pg_dumpall -U "$POSTGRES_USER" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup créé : $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Suppression des backups de plus de N jours
DELETED=$(find "$BACKUP_DIR" -name "recoltes_*.sql.gz" -mtime +$DAYS_TO_KEEP -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "[$(date)] $DELETED ancien(s) backup(s) supprimé(s)"
fi

echo "[$(date)] Backup terminé."
