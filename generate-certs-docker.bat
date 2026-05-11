@echo off
REM Generate SSL certificates using Docker (Windows)

setlocal enabledelayedexpansion

if not exist "certs" mkdir certs

echo Generating self-signed SSL certificate using Docker...

REM Get current directory path
for /f "delims=" %%A in ('cd') do set "current_dir=%%A"

REM Run Docker to generate certificate
docker run --rm -v "%current_dir%\certs:/certs" alpine/openssl req ^
    -x509 -newkey rsa:4096 ^
    -keyout /certs/key.pem ^
    -out /certs/cert.pem ^
    -days 365 -nodes ^
    -subj "/C=IN/ST=Maharashtra/L=Pune/O=TnP/OU=Engineering/CN=localhost" ^
    2>nul

if %ERRORLEVEL% equ 0 (
    echo.
    echo OK SSL certificate created successfully
    echo   Certificate: certs\cert.pem
    echo   Private Key: certs\key.pem
    echo   Valid for: 365 days
) else (
    echo.
    echo ERROR Failed to generate certificate
    exit /b 1
)

REM Verify certificate
echo.
echo Certificate Details:
docker run --rm -v "%current_dir%\certs:/certs" alpine/openssl x509 -in /certs/cert.pem -text -noout 2>nul | findstr /R "Subject Not Public-Key" 2>nul || (
    echo Certificate created successfully
)

echo.
echo Ready to use with Docker Compose!
echo.
pause
