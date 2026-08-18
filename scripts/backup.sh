#!/usr/bin/env bash
# QA-EMS — สำรองข้อมูลฐานข้อมูล PostgreSQL และไฟล์หลักฐานใน MinIO
#
# วิธีใช้:
#   ./scripts/backup.sh                 # ใช้ค่าตั้งต้น (อ่าน .env ที่ repo root)
#   BACKUP_DIR=/var/backups/qaems ./scripts/backup.sh
#
# ตัวอย่างการตั้ง cron รายวัน 02:00 น. (แก้ path ให้ตรงกับเครื่องจริง):
#   0 2 * * * cd /path/to/qaems && ./scripts/backup.sh >> /var/log/qaems-backup.log 2>&1
#
# สคริปต์นี้เป็นจุดเริ่มต้น (stub) — ยังไม่ได้อัปโหลดไปเก็บนอกเครื่อง (off-site) เอง
# แนะนำให้ต่อยอด rsync/rclone ไปยังที่เก็บนอกเครื่องหลังรันสคริปต์นี้

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

mkdir -p "$BACKUP_DIR"

echo "[backup] $(date) — เริ่มสำรองข้อมูล"

echo "[backup] PostgreSQL ($POSTGRES_DB) ..."
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "$BACKUP_DIR/postgres-$TIMESTAMP.sql.gz"

echo "[backup] MinIO evidence bucket (${MINIO_BUCKET}) ..."
MINIO_VOLUME="$(docker compose -f "$COMPOSE_FILE" ps -q minio | xargs -r docker inspect \
  --format '{{ range .Mounts }}{{ if eq .Destination "/data" }}{{ .Name }}{{ end }}{{ end }}')"
if [ -n "$MINIO_VOLUME" ]; then
  docker run --rm \
    -v "$MINIO_VOLUME":/data:ro \
    -v "$BACKUP_DIR":/backup \
    alpine tar czf "/backup/minio-$TIMESTAMP.tar.gz" -C /data .
else
  echo "[backup] WARNING: ไม่พบ volume ของ MinIO — ข้ามขั้นตอนนี้" >&2
fi

echo "[backup] ลบไฟล์สำรองที่เก่ากว่า $RETENTION_DAYS วัน ..."
find "$BACKUP_DIR" -type f \( -name 'postgres-*.sql.gz' -o -name 'minio-*.tar.gz' \) -mtime "+$RETENTION_DAYS" -delete

echo "[backup] $(date) — เสร็จสิ้น: $BACKUP_DIR/postgres-$TIMESTAMP.sql.gz, $BACKUP_DIR/minio-$TIMESTAMP.tar.gz"
