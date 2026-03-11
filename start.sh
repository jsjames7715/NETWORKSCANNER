#!/bin/bash

echo "Starting Network Scanner Pro..."
echo "Building frontend..."

# Build the React app
npm run build

echo ""
echo "Starting server on http://localhost:3001"
echo "Press Ctrl+C to stop"

# Start the server
node server.cjs
