#!/bin/bash

# LearnHub Setup Script
# This script helps you set up the Online Learning Platform

echo "🎓 LearnHub - Online Learning Platform Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MySQL is installed
echo "📦 Checking prerequisites..."
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Database setup
echo "🗄️  Setting up database..."
echo "Please enter your MySQL root password:"
read -s MYSQL_ROOT_PASSWORD

# Create database
mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS lecture_platform;
USE lecture_platform;
SOURCE schema.sql;
SOURCE seed.sql;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed"
else
    echo "❌ Database setup failed"
    exit 1
fi
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please update with your database credentials:"
    echo "   DB_PASSWORD=$MYSQL_ROOT_PASSWORD"
    nano .env
fi

echo "✅ Backend setup completed"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local file"
fi

echo "✅ Frontend setup completed"
echo ""

# Final instructions
echo "=============================================="
echo "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "📚 Demo Credentials:"
echo "   Admin:   admin@example.com / admin123"
echo "   Student: john@example.com / admin123"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   ${YELLOW}Backend:${NC}"
echo "   cd backend"
echo "   pm2 start ecosystem.config.cjs"
echo ""
echo "   ${YELLOW}Frontend:${NC}"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "=============================================="
