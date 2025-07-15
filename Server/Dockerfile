# Development Stage
FROM node:22.2-bullseye AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --include=dev

# Force install nodemon globally as backup
RUN npm install -g nodemon

# Copy source code
COPY . .

# Run migrations and seed data in development
# RUN npm run migrate && npm run seed

CMD ["npm", "run", "dev"]

# Production Stage
FROM node:22.2-bullseye AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code directly (no build step needed for JS)
COPY . .

# Start production server
CMD ["npm", "start"]