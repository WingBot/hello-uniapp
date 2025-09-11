#!/bin/bash

# Image & Log Management App Startup Script

echo "🚀 Starting Image & Log Management App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "📦 Building Docker images..."
docker-compose build

echo "🐳 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Services started successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo ""
echo "🎉 Happy coding!"