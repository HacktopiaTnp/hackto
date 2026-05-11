#!/bin/bash

# QUICK VERIFICATION SCRIPT
# Tests the basic integration between Frontend, Backend, and Database

echo "========================================" 
echo "QUICK VERIFICATION"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    
    echo -ne "${CYAN}Testing: ${name}${NC} ... "
    
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" 2>/dev/null)
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $status_code =~ ^[2] ]]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Status: $status_code)"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Backend Health
echo -e "\n${CYAN}[1] BACKEND HEALTH${NC}"
test_endpoint "Backend Health" "GET" "http://localhost:3000/health"

# Test 2: Backend Info
echo -e "\n${CYAN}[2] BACKEND INFO${NC}"
test_endpoint "Backend Info" "GET" "http://localhost:3000/info"

# Test 3: Database Check
echo -ne "${CYAN}Testing: Database Connection${NC} ... "
if PGPASSWORD=postgres psql -h localhost -U neondb_owner -d neondb -c "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 4: Redis Check
echo -ne "${CYAN}Testing: Redis Connection${NC} ... "
if redis-cli -h localhost ping >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Test 5: Frontend Access
echo -e "\n${CYAN}[3] FRONTEND ACCESS${NC}"
test_endpoint "Frontend (via Nginx)" "GET" "http://localhost/"

# Test 6: Docker Containers
echo -e "\n${CYAN}[4] DOCKER CONTAINERS${NC}"

containers=("tnp-backend" "tnp-frontend" "tnp-postgres" "tnp-redis" "tnp-nginx")

for container in "${containers[@]}"; do
    echo -ne "${CYAN}Checking: ${container}${NC} ... "
    status=$(docker-compose ps $container --format='{{.State}}' 2>/dev/null)
    if [[ $status == "Up" ]]; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        ((FAILED++))
    fi
done

# Summary
echo ""
echo "========================================"
echo -e "Results: ${GREEN}$PASSED Passed${NC} | ${RED}$FAILED Failed${NC}"
echo "========================================"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All checks passed!${NC}"
    echo "Your application integration is working correctly."
    echo ""
    echo "Access points:"
    echo "  Frontend: http://localhost/"
    echo "  Backend:  http://localhost:3000"
    echo "  API:      http://localhost:3000/api/v1"
    exit 0
else
    echo -e "\n${RED}❌ Some checks failed${NC}"
    echo "Run 'docker-compose logs' to debug"
    exit 1
fi
