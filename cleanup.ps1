# Cleanup Script for Development Environment
# This script kills all processes using development ports and cleans Docker

Write-Host "========================================" -ForegroundColor Green
Write-Host "DEVELOPMENT CLEANUP SCRIPT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if running as admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]'Administrator')) {
    Write-Host "Error: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$portsToClean = @(3000, 5173, 5432, 6379, 80, 443, 8080)
$processesKilled = 0

Write-Host "`nStep 1: Checking ports..." -ForegroundColor Cyan

foreach ($port in $portsToClean) {
    Write-Host "Checking port $port..." -NoNewline
    $netstat = netstat -ano | Select-String ":$port"
    
    if ($netstat) {
        Write-Host " OCCUPIED" -ForegroundColor Yellow
        
        foreach ($line in $netstat) {
            $parts = $line -split '\s+' | Where-Object { $_ }
            $pid = $parts[-1]
            
            if ($pid -and $pid -notmatch "^\d+$") {
                continue
            }
            
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  → Killing process ID $pid ($($process.ProcessName))..."
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    $processesKilled++
                }
            } catch {
                # Silently continue if process cannot be killed
            }
        }
    } else {
        Write-Host " FREE" -ForegroundColor Green
    }
}

Write-Host "`nProcesses killed: $processesKilled" -ForegroundColor Cyan

# Kill all Node processes
Write-Host "`nStep 2: Killing all Node processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Measure-Object
if ($nodeProcesses.Count -gt 0) {
    Write-Host "Found $($nodeProcesses.Count) Node process(es)"
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ All Node processes killed" -ForegroundColor Green
} else {
    Write-Host "✓ No Node processes running" -ForegroundColor Green
}

# Kill npm processes
Write-Host "`nStep 3: Killing npm processes..." -ForegroundColor Cyan
$npmProcesses = Get-Process npm -ErrorAction SilentlyContinue | Measure-Object
if ($npmProcesses.Count -gt 0) {
    Write-Host "Found $($npmProcesses.Count) npm process(es)"
    Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ All npm processes killed" -ForegroundColor Green
} else {
    Write-Host "✓ No npm processes running" -ForegroundColor Green
}

# Stop Docker Compose
Write-Host "`nStep 4: Stopping Docker Compose..." -ForegroundColor Cyan
try {
    docker-compose down -v --remove-orphans
    Write-Host "✓ Docker Compose stopped and cleaned" -ForegroundColor Green
} catch {
    Write-Host "⚠ Docker Compose not running or docker-compose command not found" -ForegroundColor Yellow
}

# Clear node_modules cache
Write-Host "`nStep 5: Clearing Node cache..." -ForegroundColor Cyan
npm cache clean --force 2>$null
Write-Host "✓ Node cache cleared" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: docker-compose up -d" -ForegroundColor White
Write-Host "2. Wait 30 seconds for all services to start" -ForegroundColor White
Write-Host "3. Check health: curl http://localhost:3000/health" -ForegroundColor White
Write-Host "4. Frontend: http://localhost/  or http://localhost:5173" -ForegroundColor White

Read-Host "`nPress Enter to exit"
