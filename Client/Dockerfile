# Multi-stage build for production optimization
FROM node:22.2-bullseye AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage - serve static files
FROM caddy:2-alpine AS production

# Copy built files to Caddy's web root
COPY --from=build /app/dist /srv

# Copy appropriate Caddyfile based on build target
ARG CADDY_CONFIG=Caddyfile
COPY ${CADDY_CONFIG} /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Caddy runs automatically
