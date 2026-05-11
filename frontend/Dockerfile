# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build for production with optimizations
ENV VITE_API_BASE_URL=https://api.yourdomain.com
RUN npm run build

# Production Stage - Nginx
FROM nginx:alpine

# Copy nginx config with optimizations
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create health check script
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /healthcheck.sh || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
