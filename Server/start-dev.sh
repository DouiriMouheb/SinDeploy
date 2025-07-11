#!/bin/bash

# Start script for development
echo "Starting development server..."

# Check if nodemon is available
if ! command -v nodemon &> /dev/null; then
    echo "Nodemon not found, installing..."
    npm install -g nodemon
fi

# Check if node_modules exists and is populated
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
    echo "Installing dependencies..."
    npm ci --include=dev
fi

# Start the application
echo "Starting application with nodemon..."
exec nodemon index.js
