#!/bin/bash
# NovelWriter Development Startup Script (Linux/Mac)
# One command to start everything with Docker

echo "========================================"
echo "NovelWriter Dev Environment Setup"
echo "========================================"

# Check if .env.dev exists
if [ ! -f ".env.dev" ]; then
    echo ""
    echo "[!] .env.dev not found. Creating from template..."
    cp .env.dev.example .env.dev
    echo ""
    echo "[!] IMPORTANT: Edit .env.dev and add your XAI_API_KEY"
    echo "    Get it from: https://x.ai/api"
    echo ""
    read -p "Press Enter after editing .env.dev..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo ""
echo "Starting services with Docker Compose..."
echo "- PostgreSQL (port 5432)"
echo "- Backend API (port 8000)"
echo "- Frontend (port 5173)"
echo ""

docker-compose -f docker-compose.dev.yml up --build
