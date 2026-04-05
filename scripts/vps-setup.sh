#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Setup initial du VPS (Ubuntu 22.04/24.04)
# Usage: ssh root@IP 'bash -s' < scripts/vps-setup.sh
# ============================================================

DEPLOY_USER="deploy"
APP_DIR="/home/$DEPLOY_USER/recoltes"

echo "==> Mise à jour du système"
apt-get update && apt-get upgrade -y

echo "==> Installation des paquets de base"
apt-get install -y curl git ufw fail2ban unzip

# ── Docker ──
if ! command -v docker &> /dev/null; then
    echo "==> Installation de Docker"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# ── Utilisateur deploy ──
if ! id "$DEPLOY_USER" &> /dev/null; then
    echo "==> Création de l'utilisateur $DEPLOY_USER"
    adduser --disabled-password --gecos "" "$DEPLOY_USER"
    usermod -aG docker "$DEPLOY_USER"

    mkdir -p /home/$DEPLOY_USER/.ssh
    cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/authorized_keys
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
fi

# ── Firewall ──
echo "==> Configuration du firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── Fail2ban ──
echo "==> Configuration de fail2ban"
systemctl enable fail2ban
systemctl start fail2ban

# ── Dossier de l'app ──
echo "==> Création du dossier $APP_DIR"
mkdir -p "$APP_DIR"
chown $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# ── Dossier backups ──
mkdir -p /home/$DEPLOY_USER/backups
chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/backups

echo ""
echo "============================================"
echo " VPS prêt !"
echo "============================================"
echo ""
echo " Prochaines étapes :"
echo "  1. Se connecter : ssh $DEPLOY_USER@<IP>"
echo "  2. Cloner le repo dans $APP_DIR"
echo "  3. Copier le .env dans $APP_DIR"
echo "  4. Lancer : cd $APP_DIR && docker compose up -d"
echo ""
