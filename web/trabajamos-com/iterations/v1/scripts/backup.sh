#!/usr/bin/env bash
# Respaldo del servidor de prueba: volcado de la base y copia de las imágenes.
# Uso: ./scripts/backup.sh [directorio-destino]   (por defecto ./backups)
set -euo pipefail

cd "$(dirname "$0")/.."
destino="${1:-backups}"
marca="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$destino"

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > "$destino/trabajamos-$marca.dump"
docker compose exec -T app tar -C /data -czf - uploads > "$destino/uploads-$marca.tar.gz"

echo "Respaldo listo en $destino:"
ls -lh "$destino"/*"$marca"*
