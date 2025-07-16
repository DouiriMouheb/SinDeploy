# Multi-stage build for production optimization
FROM node:22.2-bullseye AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install to handle package.json changes)
RUN npm install --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Create non-root user for security
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser

# Copy application code
COPY . .

# Create logs directory and change ownership to non-root user
RUN mkdir -p /app/logs && chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/auth/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start application
CMD ["npm", "start"]

