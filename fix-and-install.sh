#!/bin/bash

echo "🔧 Fixing npm permissions and installing dependencies..."
echo ""

# Fix npm cache permissions (this is the root cause)
echo "Fixing npm cache ownership..."
sudo chown -R $(whoami) "$HOME/.npm"

# Navigate to frontend directory
cd "$(dirname "$0")"

# Clear cache
echo "Clearing npm cache..."
npm cache clean --force

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "✅ Done! Try running:"
echo "  npm run dev"
