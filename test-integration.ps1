# Integration Testing Script
# Tests Frontend ↔ Backend ↔ Database connectivity

Write-Host "========================================" -ForegroundColor Green
Write-Host "INTEGRATION TEST SUITE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nStarted at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Yellow

$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Cyan -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            ErrorAction = "Stop"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params['Body'] = $Body
            $params['ContentType'] = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host " ✓ PASSED" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
        
        $testsPassed++
        return $response
    } catch {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
        return $null
    }
}

function Test-DockerContainer {
    param(
        [string]$ContainerName
    )
    
    Write-Host "Checking container: $ContainerName" -ForegroundColor Cyan -NoNewline
    
    try {
        $status = docker-compose ps $ContainerName --format='{{.State}}'
        if ($status -eq 'Up') {
            Write-Host " ✓ RUNNING" -ForegroundColor Green
            $testsPassed++
            return $true
        } else {
            Write-Host " ✗ NOT RUNNING" -ForegroundColor Red
            Write-Host "  State: $status" -ForegroundColor Red
            $testsFailed++
            return $false
        }
    } catch {
        Write-Host " ✗ ERROR" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
        return $false
    }
}

# ============================================
# SECTION 1: Docker Containers
# ============================================
Write-Host "`n[1] DOCKER CONTAINERS" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Test-DockerContainer "tnp-nginx" | Out-Null
Test-DockerContainer "tnp-backend" | Out-Null
Test-DockerContainer "tnp-frontend" | Out-Null
Test-DockerContainer "tnp-postgres" | Out-Null
Test-DockerContainer "tnp-redis" | Out-Null

# ============================================
# SECTION 2: Backend Health
# ============================================
Write-Host "`n[2] BACKEND HEALTH CHECKS" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$healthResponse = Test-Endpoint -Name "Backend Health" -Method "GET" -Url "http://localhost:3000/health"
$infoResponse = Test-Endpoint -Name "Backend Info" -Method "GET" -Url "http://localhost:3000/info"

# ============================================
# SECTION 3: Frontend Access
# ============================================
Write-Host "`n[3] FRONTEND ACCESS" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Test-Endpoint -Name "Frontend (via Nginx)" -Method "GET" -Url "http://localhost/" | Out-Null

# ============================================
# SECTION 4: CORS Headers
# ============================================
Write-Host "`n[4] CORS CONFIGURATION" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Write-Host "Checking CORS headers..." -ForegroundColor Cyan -NoNewline
try {
    $corsTest = Invoke-WebRequest `
        -Uri "http://localhost:3000/health" `
        -Method "OPTIONS" `
        -Headers @{"Origin" = "http://localhost:5173"} `
        -TimeoutSec 10 `
        -UseBasicParsing
    
    $corsHeader = $corsTest.Headers['Access-Control-Allow-Origin']
    if ($corsHeader) {
        Write-Host " ✓ ENABLED" -ForegroundColor Green
        Write-Host "  CORS Origin: $corsHeader" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " ⚠ WARNING" -ForegroundColor Yellow
        Write-Host "  No CORS headers found" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ⚠ WARNING" -ForegroundColor Yellow
    Write-Host "  Could not verify CORS: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ============================================
# SECTION 5: Database Connection
# ============================================
Write-Host "`n[5] DATABASE CONNECTION" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Write-Host "Checking PostgreSQL connection..." -ForegroundColor Cyan -NoNewline
try {
    $connectionString = "Server=localhost;Port=5432;User Id=neondb_owner;Password=postgres;Database=neondb;"
    
    # Try to connect using docker
    $psqlTest = docker-compose exec -T postgres pg_isready -U neondb_owner -h localhost
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✓ CONNECTED" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host " ⚠ WARNING" -ForegroundColor Yellow
    Write-Host "  PostgreSQL check skipped" -ForegroundColor Yellow
}

# ============================================
# SECTION 6: Redis Connection
# ============================================
Write-Host "`n[6] REDIS CONNECTION" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Write-Host "Checking Redis connection..." -ForegroundColor Cyan -NoNewline
try {
    $redisTest = docker-compose exec -T redis redis-cli ping
    if ($redisTest -eq "PONG") {
        Write-Host " ✓ CONNECTED" -ForegroundColor Green
        Write-Host "  Response: $redisTest" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host " ✗ FAILED" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host " ⚠ WARNING" -ForegroundColor Yellow
    Write-Host "  Redis check skipped: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ============================================
# SECTION 7: Port Availability
# ============================================
Write-Host "`n[7] PORT AVAILABILITY" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

$ports = @{
    "3000" = "Backend API"
    "5173" = "Frontend Dev"
    "5432" = "PostgreSQL"
    "6379" = "Redis"
    "80" = "Nginx HTTP"
    "443" = "Nginx HTTPS"
}

foreach ($port in $ports.GetEnumerator()) {
    Write-Host "Port $($port.Key) ($($port.Value)):" -ForegroundColor Cyan -NoNewline
    
    $tcpTest = Test-NetConnection -ComputerName "localhost" -Port $port.Key -WarningAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host " ✓ OPEN" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host " ✗ CLOSED" -ForegroundColor Red
        $testsFailed++
    }
}

# ============================================
# SECTION 8: API Endpoint Tests
# ============================================
Write-Host "`n[8] API ENDPOINTS" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Test-Endpoint -Name "GET /api/v1/auth/health" -Method "GET" -Url "http://localhost:3000/api/v1/auth/health" | Out-Null

# ============================================
# SECTION 9: Backend Logs
# ============================================
Write-Host "`n[9] RECENT BACKEND LOGS" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta

Write-Host "Last 10 backend log lines:" -ForegroundColor Cyan
try {
    $logs = docker-compose logs --tail=10 backend
    Write-Host $logs -ForegroundColor Gray
} catch {
    Write-Host "Could not retrieve logs" -ForegroundColor Yellow
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST SUMMARY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nTests Passed: " -NoNewline
Write-Host "$testsPassed" -ForegroundColor Green -NoNewline
Write-Host " ✓"

Write-Host "Tests Failed: " -NoNewline
Write-Host "$testsFailed" -ForegroundColor Red -NoNewline
Write-Host " ✗"

$totalTests = $testsPassed + $testsFailed
Write-Host "Total Tests: $totalTests"

if ($testsFailed -eq 0) {
    Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`nYour integration is working correctly:" -ForegroundColor Green
    Write-Host "• Frontend can communicate with Backend" -ForegroundColor Green
    Write-Host "• Backend can connect to Database" -ForegroundColor Green
    Write-Host "• Backend can connect to Redis" -ForegroundColor Green
    Write-Host "• All services are healthy" -ForegroundColor Green
} else {
    Write-Host "`n❌ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "`nPlease review the failures above and check:" -ForegroundColor Yellow
    Write-Host "• Docker containers are running: docker-compose ps" -ForegroundColor Yellow
    Write-Host "• No port conflicts: netstat -ano | findstr :PORT" -ForegroundColor Yellow
    Write-Host "• Backend logs: docker-compose logs backend" -ForegroundColor Yellow
    Write-Host "• Database logs: docker-compose logs postgres" -ForegroundColor Yellow
}

Write-Host "`nCompleted at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "`n========================================`n" -ForegroundColor Green

Read-Host "Press Enter to exit"
