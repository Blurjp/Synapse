#!/bin/bash
# Development entrypoint script
# - Creates database tables
# - Seeds admin user (test@example.com / testpass123)
# - Starts uvicorn with hot reload

set -e

echo "=========================================="
echo "NovelWriter Backend - Development Mode"
echo "=========================================="

# Wait for database to be ready (extra safety)
echo "Waiting for database..."
sleep 2

# Create tables and seed admin user
echo "Setting up database..."
python create_tables.py
python seed_admin.py

# Run auto-migrations
echo "Running migrations..."
python auto_migrate.py

echo ""
echo "=========================================="
echo "Starting server with hot reload..."
echo "=========================================="

# Start uvicorn with reload
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir /app/app
