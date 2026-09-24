#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p data/runs
if [ ! -f data/.scrapingbee_key ]; then
  umask 077
  : > data/.scrapingbee_key
fi
echo "Listo: data/runs y data/.scrapingbee_key"
echo "DNS: A  ta  → IP del VPS  (ta.vissiuss.com)"
echo "Siguiente: cp .env.example .env"
echo "  INGEST_KEY=\$(openssl rand -hex 32)  # no commitear"
echo "  docker compose up -d --build"
