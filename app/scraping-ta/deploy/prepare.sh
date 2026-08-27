#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p data/runs
if [ ! -f data/.scrapingbee_key ]; then
  umask 077
  : > data/.scrapingbee_key
fi
echo "Listo: data/runs y data/.scrapingbee_key"
echo "Siguiente: cp .env.example .env && docker compose up -d --build"
