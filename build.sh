#!/bin/bash
# Build script for Neo-Postman
# Builds frontend and copies to backend/static for deployment

set -e

echo "Building frontend..."
cd frontend
pnpm install
pnpm build
cd ..

echo "Copying frontend build to backend/static..."
rm -rf backend/static
cp -r frontend/dist backend/static

echo "Build complete! Run with: cd backend && deno task start"
