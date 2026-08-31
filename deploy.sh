#!/bin/bash
# ==============================================================================
# Toolera Store — Production Deployment Script
# Target: Ubuntu 24.04 LTS (Hetzner / any VPS with Docker)
#
# Services deployed:
#   api-gateway        :5000  — public API entry point
#   store-management   :5001  — auth, store config, CMS, subscriptions
#   business           :5002  — products, orders, payments, uploads
#   storefront         :3000  — Next.js public store (SSR + SEO)
#   dashboard          :3001  — Next.js admin panel
#
# Infrastructure:
#   PostgreSQL  :5432   Redis    :6379
#   MinIO       :9000   RabbitMQ :5672
#   Kafka       :9092
# ==============================================================================

set -euo pipefail

DOMAIN=${DOMAIN:-"toolera.store"}
ADMIN_DOMAIN="dashboard.${DOMAIN}"
API_DOMAIN="api.${DOMAIN}"
MINIO_DOMAIN="media.${DOMAIN}"
REPO_DIR=${REPO_DIR:-"/opt/toolera"}
COMPOSE_FILE="docker-compose.prod.yml"

echo "========================================================"
echo " Toolera Store — Production Deployment"
echo " Domain   : ${DOMAIN}"
echo " Admin    : ${ADMIN_DOMAIN}"
echo " API      : ${API_DOMAIN}"
echo " Repo dir : ${REPO_DIR}"
echo "========================================================"

# ── 1. System dependencies ────────────────────────────────────────────────────
echo ""
echo "[1/8] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    curl git ufw nginx certbot python3-certbot-nginx \
    ca-certificates gnupg lsb-release

# ── 2. Docker Engine ──────────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
    echo ""
    echo "[2/8] Installing Docker Engine..."
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker "$USER"
    echo "      Docker installed. You may need to re-login for group to take effect."
else
    echo "[2/8] Docker already installed — $(docker --version)"
fi

# ── 3. Firewall ───────────────────────────────────────────────────────────────
echo ""
echo "[3/8] Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# ── 4. Clone / Update repo ────────────────────────────────────────────────────
echo ""
echo "[4/8] Pulling latest code..."
if [ -d "$REPO_DIR/.git" ]; then
    git -C "$REPO_DIR" pull --rebase
else
    sudo git clone https://github.com/Code-Quivers/Toolera-App.git "$REPO_DIR"
    sudo chown -R "$USER":"$USER" "$REPO_DIR"
fi

cd "$REPO_DIR"

# ── 5. Env file check ─────────────────────────────────────────────────────────
echo ""
echo "[5/8] Checking .env files..."

check_env() {
    local file="$1"
    local example="$2"
    if [ ! -f "$file" ]; then
        echo "      WARN: $file not found — copying from example. Edit before going live!"
        cp "$example" "$file"
    else
        echo "      OK: $file exists"
    fi
}

check_env "Backend/store-management/.env"  "Backend/store-management/.env.example"
check_env "Backend/business/.env"          "Backend/business/.env.example"
check_env "api-gateway/.env"               "api-gateway/.env.example"
check_env "Frontend/storefront/.env"       "Frontend/storefront/.env.example" 2>/dev/null || true
check_env "Frontend/dashboard/.env"        "Frontend/dashboard/.env.example"  2>/dev/null || true

# ── 6. Build & start containers ───────────────────────────────────────────────
echo ""
echo "[6/8] Building and starting all containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans || true
docker compose -f "$COMPOSE_FILE" build --no-cache
docker compose -f "$COMPOSE_FILE" up -d

# ── 7. Wait for services to be healthy ────────────────────────────────────────
echo ""
echo "[7/8] Waiting for services to be healthy..."

wait_for_http() {
    local name="$1"
    local url="$2"
    local retries=20
    echo -n "      $name "
    for i in $(seq 1 $retries); do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "✓"
            return 0
        fi
        echo -n "."
        sleep 3
    done
    echo " TIMEOUT — check: docker compose logs $name"
    return 1
}

wait_for_http "api-gateway"       "http://localhost:5000/health"
wait_for_http "store-management"  "http://localhost:5001/health"
wait_for_http "business"          "http://localhost:5002/health"
wait_for_http "storefront"        "http://localhost:3000"
wait_for_http "dashboard"         "http://localhost:3001"

# ── 8. Nginx vhosts ───────────────────────────────────────────────────────────
echo ""
echo "[8/8] Writing Nginx virtual host config..."
sudo tee /etc/nginx/sites-available/toolera.conf > /dev/null << NGINX
# ── Toolera Store — Nginx reverse proxy ──────────────────────────────────────
# HTTP → HTTPS redirect for all domains
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} ${ADMIN_DOMAIN} ${API_DOMAIN} ${MINIO_DOMAIN};

    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://\$host\$request_uri; }
}

# ── Public Storefront ─────────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    gzip on; gzip_comp_level 6; gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js static assets — long-lived cache
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# ── Admin Dashboard ───────────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name ${ADMIN_DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3001;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# ── API Gateway ───────────────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name ${API_DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}

# ── MinIO Public Media ────────────────────────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name ${MINIO_DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/toolera.conf /etc/nginx/sites-enabled/toolera.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "========================================================"
echo " Toolera Store is running!"
echo ""
echo "  Storefront  : http://${DOMAIN}"
echo "  Dashboard   : http://${ADMIN_DOMAIN}"
echo "  API Gateway : http://${API_DOMAIN}"
echo "  MinIO Media : http://${MINIO_DOMAIN}"
echo ""
echo " Running containers:"
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo "========================================================"
echo " SSL — run once your DNS A-records point to this IP:"
echo ""
echo "   sudo certbot --nginx \\"
echo "     -d ${DOMAIN} -d www.${DOMAIN} \\"
echo "     -d ${ADMIN_DOMAIN} \\"
echo "     -d ${API_DOMAIN} \\"
echo "     -d ${MINIO_DOMAIN}"
echo ""
echo " Then reload nginx: sudo systemctl reload nginx"
echo "========================================================"
