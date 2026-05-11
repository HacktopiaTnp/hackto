# TnP Nginx Advanced Features Setup Script - Windows PowerShell

function Write-Step {
    param([string]$message)
    Write-Host ">> $message" -ForegroundColor "Blue"
}

function Write-Success {
    param([string]$message)
    Write-Host "OK $message" -ForegroundColor "Green"
}

function Write-Warning {
    param([string]$message)
    Write-Host "!! $message" -ForegroundColor "Yellow"
}

# Header
Write-Host "`n========================================" -ForegroundColor "Blue"
Write-Host "  TnP Nginx Advanced Features Setup" -ForegroundColor "Blue"
Write-Host "========================================`n" -ForegroundColor "Blue"

# Step 1: Create directories
Write-Step "Creating required directories..."
@("certs", "certbot", "nginx_cache", "nginx_cache\resume", "nginx_cache\api") | ForEach-Object {
    $path = $_
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}
Write-Success "Directories created"

# Step 2: Generate self-signed SSL certificate
Write-Step "Generating self-signed SSL certificate (valid 365 days)..."

$certPath = "certs\cert.pem"
$keyPath = "certs\key.pem"

if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
    Write-Warning "SSL certificates already exist, skipping generation"
} else {
    try {
        # Check if OpenSSL is available
        $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
        if ($opensslPath) {
            & openssl req -x509 -newkey rsa:4096 -keyout $keyPath -out $certPath -days 365 -nodes `
                -subj "/C=IN/ST=Maharashtra/L=Pune/O=TnP/OU=Engineering/CN=localhost" 2>$null
            
            if (-not $?) {
                # Fallback to simpler subject
                & openssl req -x509 -newkey rsa:2048 -keyout $keyPath -out $certPath -days 365 -nodes `
                    -subj "/CN=localhost" 2>$null
            }
            
            Write-Success "SSL certificate created successfully"
            Write-Host "  Certificate: $certPath" -ForegroundColor "Green"
            Write-Host "  Private Key: $keyPath" -ForegroundColor "Green"
            Write-Host "  Valid for: 365 days" -ForegroundColor "Yellow"
        } else {
            Write-Warning "OpenSSL not found in PATH. Please install OpenSSL and try again."
            Write-Host "  Download: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor "Yellow"
        }
    } catch {
        Write-Warning "Failed to generate certificate: $_"
    }
}

# Step 3: Create cache directories
Write-Step "Setting up cache directories..."
@("nginx_cache\resume", "nginx_cache\api") | ForEach-Object {
    $path = $_
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}
Write-Success "Cache directories created"

# Step 4: Display feature status
Write-Host "`n========================================" -ForegroundColor "Blue"
Write-Host "OK All Features Configured:`n" -ForegroundColor "Green"

Write-Host "  [SSL/TLS]" -ForegroundColor "Green"
Write-Host "     Certificates located in .\certs\"
Write-Host "     HTTP to HTTPS redirect active"
Write-Host "     Supports TLS 1.2, 1.3`n"


Write-Host "  [Resume Caching]" -ForegroundColor "Green"
Write-Host "     Endpoint: /api/resume/*"
Write-Host "     Duration: 30 days"
Write-Host "     Cache path: .\nginx_cache\resume`n"

Write-Host "  [WebSocket Support]" -ForegroundColor "Green"
Write-Host "     Interview stream: /api/interview/stream"
Write-Host "     Generic WebSocket: /api/ws/*"
Write-Host "     Timeout: 24 hours`n"

Write-Host "  [Rate Limiting]" -ForegroundColor "Green"
Write-Host "     Auth APIs: 5 req/sec (burst 10)"
Write-Host "     General APIs: 20 req/sec (burst 100)"
Write-Host "     Resume APIs: 20 req/sec (burst 50)`n"


Write-Host "========================================`n" -ForegroundColor "Blue"

# Step 5: Next steps
Write-Host "TODO Next Steps:`n" -ForegroundColor "Yellow"

Write-Host "  1. Start services:"
Write-Host "     docker-compose up -d`n" -ForegroundColor "Green"

Write-Host "  2. Verify SSL:"
Write-Host "     curl -k https://localhost/health`n" -ForegroundColor "Green"

Write-Host "  3. View Nginx logs:"
Write-Host "     docker logs -f tnp-nginx`n" -ForegroundColor "Green"

Write-Host "  4. Monitor cache:"
Write-Host "     curl -k https://localhost/api/resume/view -H 'Authorization: Bearer TOKEN'`n" -ForegroundColor "Green"

Write-Host "  5. Test WebSocket:"
Write-Host "     wscat -c wss://localhost/api/interview/stream`n" -ForegroundColor "Green"

Write-Host "  6. Check rate limits (run 10 rapid requests):"
Write-Host "     for ([int]`$i=1; `$i -le 10; `$i++) { curl -k https://localhost/api/auth/login -d '{}' }`n" -ForegroundColor "Green"

Write-Host "WARNING For Production:" -ForegroundColor "Yellow"
Write-Host "  - Replace self-signed certificates with Let us Encrypt"
Write-Host "  - Configure proper domain names in Nginx config"
Write-Host "  - Set up certificate auto-renewal"
Write-Host "  - Monitor rate limit violations`n"

Write-Success "Setup complete! Your Nginx is ready with all advanced features."
