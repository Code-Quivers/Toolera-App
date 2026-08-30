#!/bin/bash
# ==============================================================================
# Raifa's Mart — 1-Click Production Server Deployment Script
# Designed for Hetzner Cloud (Ubuntu 24.04 LTS / CX23 instance)
# ==============================================================================

set -e

echo "🚀 Starting Raifa's Mart automated deployment..."

# 1. Update Ubuntu packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 3. Configure Firewall (UFW)
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 4. Generate Prisma & Start Docker Containers
echo "🏗️ Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# 5. Verify Running Services
echo "🔍 Verifying running services..."
docker compose -f docker-compose.prod.yml ps

echo "=============================================================================="
echo "✅ Raifa's Mart is now running in production containers!"
echo "   - Next.js Frontend: http://localhost:3000"
echo "   - Express API Server: http://localhost:5000"
echo "=============================================================================="
echo "👉 Next step: Point your Domain DNS A-Record to this Server IP and run:"
echo "   sudo certbot --nginx -d raifasmart.com -d www.raifasmart.com -d api.raifasmart.com"
echo "=============================================================================="
