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

# Copy and make startup script executable
COPY start-dev.sh ./
RUN chmod +x start-dev.sh

# Verify nodemon is installed
RUN which nodemon && nodemon --version

# Expose port
EXPOSE 5000

# Start development server using the script
CMD ["./start-dev.sh"]

# Production Stage
FROM node:22.2-bullseye AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]