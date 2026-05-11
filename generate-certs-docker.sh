#!/bin/bash
# Generate SSL certificates using Docker

mkdir -p certs

echo "Generating self-signed SSL certificate using Docker..."
docker run --rm -v "$(pwd)/certs:/certs" alpine/openssl req \
    -x509 -newkey rsa:4096 \
    -keyout /certs/key.pem \
    -out /certs/cert.pem \
    -days 365 -nodes \
    -subj "/C=IN/ST=Maharashtra/L=Pune/O=TnP/OU=Engineering/CN=localhost" \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ SSL certificate created successfully"
    echo "  Certificate: certs/cert.pem"
    echo "  Private Key: certs/key.pem"
    echo "  Valid for: 365 days"
else
    echo "✗ Failed to generate certificate"
    exit 1
fi

# Verify certificate
echo ""
echo "Certificate Details:"
docker run --rm -v "$(pwd)/certs:/certs" alpine/openssl x509 -in /certs/cert.pem -text -noout | grep -E "(Subject:|Not Before|Not After|Public-Key:)" 2>/dev/null || echo "Certificate created (details not displayed)"

echo ""
echo "Ready to use with Docker Compose!"
