# 🚀 Raifa's Mart — Hetzner Server 1-Click Deployment Guide

This guide explains how to deploy **Raifa's Mart** to a **Hetzner CX23 Cloud Server** (€3.29/month) or any Ubuntu 24.04 server in under 3 minutes.

---

## 1. Create Server on Hetzner Cloud
1. Go to **[Hetzner Cloud Console](https://console.hetzner.cloud/)**.
2. Click **"Add Server"**:
   * **Location:** Nuremberg / Falkenstein or Singapore.
   * **Image:** **Ubuntu 24.04 LTS**.
   * **Type:** **CX23** (2 vCPU, 4GB RAM, 40GB NVMe SSD).
   * **SSH Key:** Add your public SSH key or choose root password.
3. Click **"Create & Buy Now"**. You will receive your **Server Public IPv4 Address** (e.g. `159.69.XX.YY`).

---

## 2. Point Your Domain DNS (A-Record)
In your domain management panel, add these 3 DNS records pointing to your Hetzner Server IP:

| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or `raifasmart.com`) | `159.69.XX.YY` | Automatic / 300 |
| **A** | `www` | `159.69.XX.YY` | Automatic / 300 |
| **A** | `api` | `159.69.XX.YY` | Automatic / 300 |

*(If you don't have direct DNS access, ask your domain provider to point these 3 A-records to your server IP, or delegate nameservers to Cloudflare).*

---

## 3. Clone Repository & Run 1-Click Deploy
Connect to your server via SSH:
```bash
ssh root@159.69.XX.YY
```

Clone the repository and run the setup script:
```bash
git clone https://github.com/your-username/raifas-mart.git /var/www/raifas-mart
cd /var/www/raifas-mart

# Make deploy script executable and run
chmod +x deploy.sh
./deploy.sh
```

---

## 4. Enable Free SSL Certificate (HTTPS)
Once your DNS has propagated, run:
```bash
sudo certbot --nginx -d raifasmart.com -d www.raifasmart.com -d api.raifasmart.com
```
Certbot will automatically install the SSL certificates and configure auto-renewal!

---

## 5. Useful Server Management Commands

* **View live server logs:**
  ```bash
  docker compose -f docker-compose.prod.yml logs -f
  ```
* **Restart containers:**
  ```bash
  docker compose -f docker-compose.prod.yml restart
  ```
* **Update to latest code:**
  ```bash
  git pull
  docker compose -f docker-compose.prod.yml up -d --build
  ```
