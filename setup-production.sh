# Production Environment Setup Script
# This script automates the setup of a production server for the TnP application
# Usage: bash setup-production.sh

set -e

echo "🚀 TnP Production Setup Script"
echo "=============================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/tnp-app"
BACKUP_DIR="/backups/tnp"
LOGS_DIR="/var/log/tnp"

# ============================================================================
# STEP 1: System Requirements
# ============================================================================
echo -e "\n${BLUE}[STEP 1] Checking system requirements...${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    htop \
    vim \
    net-tools \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx

echo -e "${GREEN}✓ System packages installed${NC}"

# ============================================================================
# STEP 2: Docker Installation
# ============================================================================
echo -e "\n${BLUE}[STEP 2] Installing Docker...${NC}"

# Check if Docker is already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo "Docker is already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo "Docker Compose is already installed"
fi

# ============================================================================
# STEP 3: Directory Setup
# ============================================================================
echo -e "\n${BLUE}[STEP 3] Setting up directories...${NC}"

mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR
mkdir -p $LOGS_DIR
mkdir -p $APP_DIR/certs
mkdir -p $APP_DIR/nginx_cache/api
mkdir -p $APP_DIR/nginx_cache/resume

# Set proper permissions
chown -R $SUDO_USER:$SUDO_USER $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $BACKUP_DIR
chown -R $SUDO_USER:$SUDO_USER $LOGS_DIR
chmod 755 $APP_DIR $BACKUP_DIR $LOGS_DIR

echo -e "${GREEN}✓ Directories created${NC}"

# ============================================================================
# STEP 4: Clone or Pull Application Code
# ============================================================================
echo -e "\n${BLUE}[STEP 4] Setting up application code...${NC}"

if [ ! -d "$APP_DIR/.git" ]; then
    echo "Cloning repository..."
    read -p "Enter GitHub repository URL: " REPO_URL
    git clone $REPO_URL $APP_DIR
else
    echo "Repository already exists, updating..."
    cd $APP_DIR
    git pull origin main
fi

cd $APP_DIR
echo -e "${GREEN}✓ Repository ready${NC}"

# ============================================================================
# STEP 5: Environment Configuration
# ============================================================================
echo -e "\n${BLUE}[STEP 5] Configuring environment...${NC}"

if [ ! -f "$APP_DIR/.env.production" ]; then
    echo "Creating .env.production file..."
    
    # Generate strong random passwords
    DB_PASSWORD=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    
    cat > $APP_DIR/.env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3001

# Database Configuration
DB_USER=tnp_prod
DB_PASSWORD=$DB_PASSWORD
DB_NAME=tnp_production
DATABASE_URL=postgresql://tnp_prod:$DB_PASSWORD@postgres:5432/tnp_production

# Redis Configuration
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# Application Configuration
CORS_ORIGIN=https://yourdomain.com
APP_NAME=TnP Platform
APP_VERSION=1.0.0

# External Services (Configure these)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLERK_SECRET_KEY=your_clerk_secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# AWS Configuration (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Logging
LOG_LEVEL=info

# Cache Configuration
SKIP_REDIS_INIT=false
SKIP_DATABASE_INIT=false
EOF
    
    # Secure the file
    chmod 600 $APP_DIR/.env.production
    chown $SUDO_USER:$SUDO_USER $APP_DIR/.env.production
    
    echo -e "${GREEN}✓ .env.production created (review and update with your values)${NC}"
else
    echo "Warning: .env.production already exists - verify it has all required values"
fi

# ============================================================================
# STEP 6: SSL/TLS Certificate Setup
# ============================================================================
echo -e "\n${BLUE}[STEP 6] Setting up SSL/TLS certificates...${NC}"

read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN_NAME

if [ ! -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    echo "Generating Let's Encrypt certificate..."
    certbot certonly --standalone \
        -d $DOMAIN_NAME \
        -d api.$DOMAIN_NAME \
        -m admin@$DOMAIN_NAME \
        --agree-tos \
        --non-interactive
    
    # Copy to app directory
    cp /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem $APP_DIR/certs/
    cp /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem $APP_DIR/certs/
    
    chown $SUDO_USER:$SUDO_USER $APP_DIR/certs/*
    chmod 600 $APP_DIR/certs/*
    
    echo -e "${GREEN}✓ SSL certificate installed${NC}"
else
    echo "Certificate already exists for $DOMAIN_NAME"
fi

# Set up auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer

# ============================================================================
# STEP 7: Firewall Configuration
# ============================================================================
echo -e "\n${BLUE}[STEP 7] Configuring firewall...${NC}"

ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw status

echo -e "${GREEN}✓ Firewall configured${NC}"

# ============================================================================
# STEP 8: Fail2Ban Setup
# ============================================================================
echo -e "\n${BLUE}[STEP 8] Configuring Fail2Ban...${NC}"

systemctl enable fail2ban
systemctl start fail2ban

echo -e "${GREEN}✓ Fail2Ban enabled${NC}"

# ============================================================================
# STEP 9: Docker Images Pull
# ============================================================================
echo -e "\n${BLUE}[STEP 9] Pulling Docker images...${NC}"

cd $APP_DIR

# Login to GitHub Container Registry
read -p "Enter GitHub username: " GH_USER
read -sp "Enter GitHub personal access token: " GH_TOKEN
echo ""

echo $GH_TOKEN | docker login ghcr.io -u $GH_USER --password-stdin

# Pull images
docker pull ghcr.io/$GH_USER/tnp-backend:latest
docker pull ghcr.io/$GH_USER/tnp-frontend:latest

echo -e "${GREEN}✓ Docker images pulled${NC}"

# ============================================================================
# STEP 10: Database & Services Startup
# ============================================================================
echo -e "\n${BLUE}[STEP 10] Starting services...${NC}"

cd $APP_DIR

# Load environment
source .env.production

# Start Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 30

# Check service status
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}✓ Services started${NC}"

# ============================================================================
# STEP 11: Database Migrations
# ============================================================================
echo -e "\n${BLUE}[STEP 11] Running database migrations...${NC}"

docker-compose -f docker-compose.prod.yml exec backend npm run migrate

echo -e "${GREEN}✓ Database migrations completed${NC}"

# ============================================================================
# STEP 12: Health Checks
# ============================================================================
echo -e "\n${BLUE}[STEP 12] Running health checks...${NC}"

# Wait a bit for services to fully initialize
sleep 10

BACKEND_HEALTH=$(curl -s http://localhost:3001/health || echo "failed")
if echo $BACKEND_HEALTH | grep -q "ok"; then
    echo -e "${GREEN}✓ Backend health: OK${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# ============================================================================
# STEP 13: Backup Strategy Setup
# ============================================================================
echo -e "\n${BLUE}[STEP 13] Setting up backups...${NC}"

# Create backup script
cat > /usr/local/bin/tnp-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/tnp"
APP_DIR="/opt/tnp-app"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cd $APP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U ${DB_USER} ${DB_NAME} > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup Redis
docker-compose -f docker-compose.prod.yml exec -T redis redis-cli SAVE
docker cp tnp-redis:/data/dump.rdb $BACKUP_DIR/redis_backup_$TIMESTAMP.rdb

# Compress backups older than 1 day
find $BACKUP_DIR -name "*.sql" -mtime +1 -exec gzip {} \;

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /usr/local/bin/tnp-backup.sh

# Add to crontab for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/tnp-backup.sh") | crontab -

echo -e "${GREEN}✓ Backup strategy configured (daily at 2 AM UTC)${NC}"

# ============================================================================
# STEP 14: Monitoring Setup (Optional)
# ============================================================================
echo -e "\n${BLUE}[STEP 14] Monitoring setup...${NC}"

# Create monitoring script
cat > /usr/local/bin/tnp-monitor.sh << 'EOF'
#!/bin/bash

APP_DIR="/opt/tnp-app"
cd $APP_DIR

echo "=== TnP Application Status ==="
echo ""
echo "Docker Containers:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "System Resources:"
docker stats --no-stream
echo ""
echo "Recent Logs:"
docker-compose -f docker-compose.prod.yml logs --tail=10 backend
EOF

chmod +x /usr/local/bin/tnp-monitor.sh

echo -e "${GREEN}✓ Monitoring script created (run: tnp-monitor.sh)${NC}"

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n${GREEN}=============================="
echo "✓ Production Setup Complete!"
echo "==============================${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Review and update .env.production with your values"
echo "2. Test backend: curl http://localhost:3001/health"
echo "3. Test frontend: curl http://localhost:80"
echo "4. Configure DNS to point to this server"
echo "5. Test HTTPS: curl https://$DOMAIN_NAME"
echo "6. Set up monitoring dashboards"
echo "7. Configure backup alerts"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "  Health check: tnp-monitor.sh"
echo "  Manual backup: tnp-backup.sh"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  Full guide: DEPLOYMENT_GUIDE.md"
echo "  Status: cd $APP_DIR && docker-compose -f docker-compose.prod.yml ps"
echo ""

# Save setup configuration
cat > $APP_DIR/SETUP_CONFIG.txt << EOF
Setup Date: $(date)
Domain: $DOMAIN_NAME
App Directory: $APP_DIR
Backup Directory: $BACKUP_DIR
Logs Directory: $LOGS_DIR

PostgreSQL User: tnp_prod
Redis Password: ••••••••• (see .env.production)
JWT Secret: ••••••••• (see .env.production)

SSL Certificate: /etc/letsencrypt/live/$DOMAIN_NAME/
Certificate Renewal: Daily via certbot.timer
Backup Schedule: Daily at 2:00 AM UTC
EOF

echo -e "\n${GREEN}Setup configuration saved to: SETUP_CONFIG.txt${NC}"
