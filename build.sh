#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Building React Vite Frontend..."
if command -v npm &> /dev/null; then
    npm --prefix frontend install
    npm --prefix frontend run build
    echo "==> Frontend built successfully!"
else
    echo "==> npm not found, skipping frontend build."
fi
