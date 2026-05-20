# ============================================
# Frontend Dockerfile - React App (Nginx)
# ============================================

# ---- Build Stage ----
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install ALL dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM nginx:stable-alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user for nginx worker
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 8080 (non-privileged for non-root nginx)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]