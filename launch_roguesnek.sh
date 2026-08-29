#!/bin/bash

# ROGUESNEK Launcher Script
# This script ensures dependencies are installed and starts the game.

set -e

# Get the directory of the script to ensure paths are correct
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

echo "------------------------------------------------"
echo "🐍 ROGUESNEK: Roguelike Snake Engine"
echo "------------------------------------------------"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if node_modules exists, install if missing
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules not found. Installing dependencies..."
    npm install
    echo "✅ Dependencies installed."
fi

# Determine mode
MODE="dev"
if [[ "$*" == *"--prod"* ]]; then
    MODE="prod"
fi

echo "🚀 Starting game engine in $MODE mode..."

if [ "$MODE" == "prod" ]; then
    echo "🏗️ Building production bundle..."
    npm run build
    echo "🌍 Opening production preview..."
    npm run preview -- --open
else
    # Run vite dev server and attempt to open the browser
    npm run dev -- --open
fi

# Keep terminal open if it fails immediately
if [ $? -ne 0 ]; then
    echo "❌ Failed to start the game."
    read -p "Press enter to exit..."
fi
