#!/bin/bash

# 🚀 Render Deployment Script
# This script helps prepare your project for Render deployment

echo "🚀 Preparing your printing software for Render deployment..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Ready for Render deployment"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Switching to main branch..."
    git checkout -b main
fi

# Add deployment files to git
echo "📝 Adding deployment configuration files..."
git add backend/render.yaml
git add frontend/render.yaml
git add frontend/next.config.js
git add backend/server.js
git add DEPLOYMENT_GUIDE.md
git add deploy.sh

# Commit changes
git commit -m "Add Render deployment configuration"

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin <your-github-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. Follow the DEPLOYMENT_GUIDE.md for step-by-step instructions"
echo ""
echo "3. Your deployment URLs will be:"
echo "   Backend: https://printing-software-backend.onrender.com"
echo "   Frontend: https://printing-software-frontend.onrender.com"
echo ""
echo "🎉 Ready to deploy to Render!"
