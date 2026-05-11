@echo off
REM Docker CLI for TnP Platform (Windows)

setlocal enabledelayedexpansion

:menu
cls
echo.
echo ════════════════════════════════════════
echo   TnP Docker ^& CI/CD Manager (Windows)
echo ════════════════════════════════════════
echo.
echo Development:
echo   1. Start all services (development)
echo   2. Stop all services
echo   3. View logs
echo   4. Rebuild containers
echo.
echo Database:
echo   5. Access PostgreSQL CLI
echo   6. Reset database
echo   7. Backup database
echo.
echo Testing ^& Deployment:
echo   8. Build Docker images
echo   9. Deploy with Docker Compose (production)
echo.
echo Utilities:
echo   10. View running containers
echo   11. View container stats
echo   12. Clean up Docker
echo.
echo   0. Exit
echo.

set /p choice="Enter your choice [0-12]: "

if "%choice%"=="1" goto start_services
if "%choice%"=="2" goto stop_services
if "%choice%"=="3" goto view_logs
if "%choice%"=="4" goto rebuild_containers
if "%choice%"=="5" goto access_postgres
if "%choice%"=="6" goto reset_database
if "%choice%"=="7" goto backup_database
if "%choice%"=="8" goto build_images
if "%choice%"=="9" goto deploy_production
if "%choice%"=="10" goto view_containers
if "%choice%"=="11" goto view_stats
if "%choice%"=="12" goto cleanup_docker
if "%choice%"=="0" goto exit
goto menu

:start_services
cls
echo.
echo Starting All Services (Development)...
echo.
if not exist ".env" (
    echo Creating .env from .env.docker...
    copy .env.docker .env
)
docker-compose up -d
timeout /t 5
docker-compose ps
pause
goto menu

:stop_services
cls
echo.
echo Stopping All Services...
echo.
docker-compose down
pause
goto menu

:view_logs
cls
echo.
echo Select service:
echo   1. All services
echo   2. Backend
echo   3. Frontend
echo   4. PostgreSQL
echo   5. Redis
echo.
set /p log_choice="Enter choice [1-5]: "

if "%log_choice%"=="1" docker-compose logs -f
if "%log_choice%"=="2" docker-compose logs -f backend
if "%log_choice%"=="3" docker-compose logs -f frontend
if "%log_choice%"=="4" docker-compose logs -f postgres
if "%log_choice%"=="5" docker-compose logs -f redis
pause
goto menu

:rebuild_containers
cls
echo.
echo Rebuilding Containers...
echo.
docker-compose build --no-cache
pause
goto menu

:access_postgres
cls
echo.
echo Accessing PostgreSQL...
echo.
docker-compose exec postgres psql -U neondb_owner -d neondb
pause
goto menu

:reset_database
cls
echo.
echo WARNING: This will delete all data!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker-compose down -v
    echo Database reset!
) else (
    echo Database reset cancelled
)
pause
goto menu

:backup_database
cls
echo.
echo Backing up Database...
echo.
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set backup_file=backup-%mydate%-%mytime%.sql
docker-compose exec -T postgres pg_dump -U neondb_owner neondb > %backup_file%
if exist %backup_file% (
    echo Backup created: %backup_file%
    dir %backup_file%
) else (
    echo Backup failed
)
pause
goto menu

:build_images
cls
echo.
echo Building Docker Images...
echo.
docker-compose build
pause
goto menu

:deploy_production
cls
echo.
echo Deploy with Docker Compose (Production)
echo.
if not exist ".env.production" (
    echo ERROR: .env.production not found!
    echo Please create .env.production file with production settings
    pause
    goto menu
)
echo Using docker-compose.prod.yml...
docker-compose -f docker-compose.prod.yml up -d
echo Production deployment started!
pause
goto menu

:view_containers
cls
echo.
echo Running Containers:
echo.
docker-compose ps
pause
goto menu

:view_stats
cls
echo.
echo Container Stats:
echo.
docker stats
pause
goto menu

:cleanup_docker
cls
echo.
echo WARNING: This will remove unused Docker objects!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker system prune -af
    echo Docker cleanup completed!
) else (
    echo Cleanup cancelled
)
pause
goto menu

:exit
echo.
echo Exiting...
exit /b 0
