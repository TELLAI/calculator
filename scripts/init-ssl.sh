#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Obtention initiale du certificat Let's Encrypt
# Usage: bash scripts/init-ssl.sh ton-domaine.fr email@example.com
# ============================================================

DOMAIN=${1:?"Usage: $0 <domaine> <email>"}
EMAIL=${2:?"Usage: $0 <domaine> <email>"}

echo "==> Remplacement du placeholder dans nginx.conf"
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/nginx.conf

echo "==> Démarrage de Nginx (HTTP uniquement pour le challenge)"
# Temporairement, on commente le bloc HTTPS pour que Nginx démarre sans certificat
cp nginx/nginx.conf nginx/nginx.conf.bak

cat > nginx/nginx-init.conf << 'INITEOF'
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name DOMAIN;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'En attente du certificat SSL...';
            add_header Content-Type text/plain;
        }
    }
}
INITEOF
sed -i "s/DOMAIN/$DOMAIN/g" nginx/nginx-init.conf

docker compose up -d db
docker compose run --rm -v "$(pwd)/nginx/nginx-init.conf:/etc/nginx/nginx.conf:ro" \
    --service-ports nginx &
NGINX_PID=$!
sleep 3

echo "==> Obtention du certificat Let's Encrypt pour $DOMAIN"
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

echo "==> Arrêt du Nginx temporaire"
kill $NGINX_PID 2>/dev/null || true
docker compose down

rm nginx/nginx-init.conf

echo "==> Démarrage complet avec HTTPS"
docker compose up -d

echo ""
echo "============================================"
echo " SSL configuré pour $DOMAIN"
echo "============================================"
echo " L'app est accessible sur https://$DOMAIN"
echo ""
