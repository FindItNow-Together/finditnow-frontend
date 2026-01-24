#!/bin/bash

echo "🚀 Setting up Review System Frontend..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")"

# Clear npm cache (fixes permission issues)
echo "📦 Clearing npm cache..."
npm cache clean --force

# Install dependencies
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the development server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
