#!/bin/bash

# TnP Nginx Advanced Features Setup Script

set -e

COLOR_BLUE='\033[0;34m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
NC='\033[0m'

echo -e "${COLOR_BLUE}════════════════════════════════════════${NC}"
echo -e "${COLOR_BLUE}  TnP Nginx Advanced Features Setup${NC}"
echo -e "${COLOR_BLUE}════════════════════════════════════════${NC}\n"

# Function to print colored messages
print_step() {
    echo -e "${COLOR_BLUE}→ $1${NC}"
}

print_success() {
    echo -e "${COLOR_GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${COLOR_YELLOW}⚠ $1${NC}"
}

# Step 1: Create directories
print_step "Creating required directories..."
mkdir -p certs
mkdir -p certbot
mkdir -p nginx_cache
print_success "Directories created"

# Step 2: Generate self-signed SSL certificate
print_step "Generating self-signed SSL certificate (valid 365 days)..."

if [ -f "certs/cert.pem" ] && [ -f "certs/key.pem" ]; then
    print_warning "SSL certificates already exist, skipping generation"
else
    openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes \
        -subj "/C=IN/ST=Maharashtra/L=Pune/O=TnP/OU=Engineering/CN=localhost" \
        2>/dev/null || openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes \
        -subj "/CN=localhost" 2>/dev/null
    
    chmod 600 certs/key.pem
    chmod 644 certs/cert.pem
    print_success "SSL certificate created successfully"
    echo -e "  Certificate: ${COLOR_GREEN}certs/cert.pem${NC}"
    echo -e "  Private Key: ${COLOR_GREEN}certs/key.pem${NC}"
    echo -e "  Valid for: ${COLOR_YELLOW}365 days${NC}"
fi

# Step 3: Create cache directories
print_step "Setting up cache directories..."
mkdir -p nginx_cache/resume
mkdir -p nginx_cache/api
print_success "Cache directories created"

# Step 4: Display feature status
echo -e "\n${COLOR_BLUE}════════════════════════════════════════${NC}"
echo -e "${COLOR_GREEN}✓ All Features Configured:${NC}\n"

echo -e "  ${COLOR_GREEN}🔒 SSL/TLS${NC}"
echo -e "     Certificates located in ./certs/"
echo -e "     HTTP → HTTPS redirect active"
echo -e "     Supports TLS 1.2 & 1.3\n"

echo -e "  ${COLOR_GREEN}📦 Resume Caching${NC}"
echo -e "     Endpoint: /api/resume/*"
echo -e "     Duration: 30 days"
echo -e "     Cache path: ./nginx_cache/resume\n"

echo -e "  ${COLOR_GREEN}🔌 WebSocket Support${NC}"
echo -e "     Interview stream: /api/interview/stream"
echo -e "     Generic WebSocket: /api/ws/*"
echo -e "     Timeout: 24 hours\n"

echo -e "  ${COLOR_GREEN}🛡️  Rate Limiting${NC}"
echo -e "     Auth APIs: 5 req/sec (burst 10)"
echo -e "     General APIs: 20 req/sec (burst 100)"
echo -e "     Resume APIs: 20 req/sec (burst 50)\n"

echo -e "${COLOR_BLUE}════════════════════════════════════════${NC}\n"

# Step 5: Next steps
echo -e "${COLOR_YELLOW}📋 Next Steps:${NC}\n"
echo -e "  1. Start services:"
echo -e "     ${COLOR_GREEN}docker-compose up -d${NC}\n"

echo -e "  2. Verify SSL:"
echo -e "     ${COLOR_GREEN}curl -I https://localhost/health${NC}\n"

echo -e "  3. View Nginx logs:"
echo -e "     ${COLOR_GREEN}docker logs -f tnp-nginx${NC}\n"

echo -e "  4. Monitor cache:"
echo -e "     ${COLOR_GREEN}curl https://localhost/api/resume/view -H 'Authorization: Bearer TOKEN'${NC}\n"

echo -e "  5. Test WebSocket:"
echo -e "     ${COLOR_GREEN}wscat -c wss://localhost/api/interview/stream${NC}\n"

echo -e "  6. Check rate limits:"
echo -e "     ${COLOR_GREEN}for i in {1..10}; do curl https://localhost/api/auth/login -d '{}'; done${NC}\n"

echo -e "${COLOR_YELLOW}⚠️  For Production:${NC}"
echo -e "  - Replace self-signed certificates with Let's Encrypt"
echo -e "  - Configure proper domain names in Nginx config"
echo -e "  - Set up certificate auto-renewal"
echo -e "  - Monitor rate limit violations\n"

print_success "Setup complete! Your Nginx is ready with all advanced features."
