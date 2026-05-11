#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Main menu
show_menu() {
    print_header "TnP Docker & CI/CD Manager"
    echo ""
    echo "Development:"
    echo "  1. Start all services (development)"
    echo "  2. Stop all services"
    echo "  3. View logs"
    echo "  4. Rebuild containers"
    echo ""
    echo "Database:"
    echo "  5. Access PostgreSQL CLI"
    echo "  6. Reset database"
    echo "  7. Backup database"
    echo ""
    echo "Testing & Deployment:"
    echo "  8. Build Docker images"
    echo "  9. Run security scan (Trivy)"
    echo "  10. Deploy with Docker Compose (production)"
    echo ""
    echo "Utilities:"
    echo "  11. View running containers"
    echo "  12. View container stats"
    echo "  13. Clean up Docker (prune)"
    echo "  0. Exit"
    echo ""
}

# Option handlers
start_services() {
    print_header "Starting All Services (Development)"
    if [ ! -f ".env" ]; then
        print_info "Creating .env from .env.docker..."
        cp .env.docker .env
    fi
    docker-compose up -d
    sleep 5
    print_success "All services started!"
    echo ""
    print_info "Services:"
    docker-compose ps
}

stop_services() {
    print_header "Stopping All Services"
    docker-compose down
    print_success "All services stopped!"
}

view_logs() {
    print_header "View Logs"
    echo "Select service:"
    echo "  1. All services"
    echo "  2. Backend"
    echo "  3. Frontend"
    echo "  4. PostgreSQL"
    echo "  5. Redis"
    read -p "Enter choice [1-5]: " log_choice
    
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        4) docker-compose logs -f postgres ;;
        5) docker-compose logs -f redis ;;
        *) print_error "Invalid choice" ;;
    esac
}

rebuild_containers() {
    print_header "Rebuilding Containers"
    docker-compose build --no-cache
    print_success "Containers rebuilt!"
}

access_postgres() {
    print_header "Accessing PostgreSQL"
    docker-compose exec postgres psql -U neondb_owner -d neondb
}

reset_database() {
    print_header "Reset Database"
    print_error "This will delete all data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        docker-compose down -v
        print_success "Database reset!"
        print_info "Run 'start_services' to recreate it"
    else
        print_info "Database reset cancelled"
    fi
}

backup_database() {
    print_header "Backup Database"
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
    docker-compose exec -T postgres pg_dump -U neondb_owner neondb > "$BACKUP_FILE"
    if [ -f "$BACKUP_FILE" ]; then
        print_success "Database backed up to $BACKUP_FILE"
        ls -lh "$BACKUP_FILE"
    else
        print_error "Backup failed"
    fi
}

build_images() {
    print_header "Building Docker Images"
    docker-compose build
    print_success "Images built!"
}

run_security_scan() {
    print_header "Running Security Scan (Trivy)"
    print_info "Scanning backend..."
    trivy fs ./backend
    print_info "Scanning frontend..."
    trivy fs ./frontend
}

deploy_production() {
    print_header "Deploy with Docker Compose (Production)"
    if [ ! -f ".env.production" ]; then
        print_error ".env.production not found!"
        print_info "Please create .env.production file with production settings"
        return 1
    fi
    
    print_info "Using docker-compose.prod.yml..."
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production deployment started!"
}

view_containers() {
    print_header "Running Containers"
    docker-compose ps
}

view_stats() {
    print_header "Container Stats"
    docker stats
}

cleanup_docker() {
    print_header "Docker System Cleanup"
    print_error "This will remove unused Docker objects!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        docker system prune -af
        print_success "Docker cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Main loop
main() {
    while true; do
        show_menu
        read -p "Enter your choice [0-13]: " choice
        
        case $choice in
            1) start_services ;;
            2) stop_services ;;
            3) view_logs ;;
            4) rebuild_containers ;;
            5) access_postgres ;;
            6) reset_database ;;
            7) backup_database ;;
            8) build_images ;;
            9) run_security_scan ;;
            10) deploy_production ;;
            11) view_containers ;;
            12) view_stats ;;
            13) cleanup_docker ;;
            0) 
                print_info "Exiting..."
                exit 0 
                ;;
            *) 
                print_error "Invalid choice. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
}

# Check if docker and docker-compose are installed
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Run
check_requirements
main
