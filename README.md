# 🌟 TravelMate AI Chatbot Platform

A comprehensive travel platform featuring an AI-powered chatbot, weather forecasting, booking services, and modern Vietnamese payment gateway integration.

## ⚡ **IMPORTANT: Node.js Required**

**Before starting, Node.js must be installed on your system.**

### 🔧 **One-Click Node.js Installation**
```powershell
# Automated Node.js installer (run as Administrator)
.\install-nodejs.ps1
```

Or download manually from: https://nodejs.org/en/download/

---

## 🚀 Quick Start

### ✅ **Step 1: Check Project Status**
```powershell
# Check what needs to be completed
.\check-status.ps1
```

### ✅ **Step 2: Complete Setup** (After Node.js is installed)
```powershell
# Automated complete setup
.\setup-complete.ps1
```

### ✅ **Step 3: Start Development**
```powershell
# Quick development start
.\start-dev.ps1
```

### 🐳 **Alternative: Docker Setup** (No Node.js needed locally)
```powershell
# Full Docker setup
.\setup-complete.ps1 -Docker
```

## 📋 Features

### 🤖 AI Chatbot
- **Intelligent Travel Assistant** powered by Langflow
- **Two-tier system**: Basic (Free) vs Pro (Paid)
- **Vietnamese language support**
- **Real-time conversation** with smart suggestions
- **Context-aware responses** for travel queries

### 💳 Payment Integration
- **Vietnamese Payment Gateways**: MoMo, ZaloPay, VNPay
- **Subscription Plans**: Monthly, Yearly, Enterprise
- **Real-time payment processing**
- **Secure transaction handling**

### 🌤️ Weather Forecasting
- **Real-time weather data** for Vietnamese cities
- **7-day forecast** with detailed metrics
- **Travel-optimized recommendations**
- **Interactive weather maps**

### 🗺️ Location Services
- **Interactive maps** with popular destinations
- **Location-based recommendations**
- **Route planning** and navigation
- **Points of interest** discovery

### 📱 Modern UI/UX
- **Responsive design** for all devices
- **Vietnamese-optimized interface**
- **Pink-purple gradient theme** for young users
- **Smooth animations** with Framer Motion

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **FastAPI** (Python) for REST API
- **PostgreSQL** database
- **Redis** for caching
- **JWT authentication**
- **SQLAlchemy** ORM

### AI & Integrations
- **Langflow** for AI chatbot flows
- **OpenAI API** integration
- **Vietnamese payment gateways**
- **Weather API** services

### DevOps
- **Docker** containerization
- **Docker Compose** for orchestration
- **Environment-based configuration**
- **Health checks** and monitoring

## 📁 Project Structure

```
Travel Chatbot/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layers
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                 # FastAPI backend
│   ├── routes/              # API route handlers
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── config/              # Configuration files
│   └── auth/                # Authentication logic
├── custom/                  # Langflow configurations
│   └── TravelMate.json      # Main chatbot flow
├── docker-compose.yml       # Multi-service orchestration
└── scripts/                 # Automation scripts
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories:

**Backend (.env)**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/travel_db
REDIS_URL=redis://localhost:6379/0
LANGFLOW_HOST=http://localhost:8080
JWT_SECRET=your-secret-key
DEBUG=True
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_LANGFLOW_URL=http://localhost:8080
```

### Database Setup

The PostgreSQL database will be automatically created when using Docker Compose. For manual setup:

```sql
CREATE DATABASE travel_db;
CREATE USER travel_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE travel_db TO travel_user;
```

## 🎯 Usage

### 1. Chatbot Widget
- **Location**: Bottom-right floating button
- **Access**: Available on all pages
- **Features**: Smart suggestions, context awareness
- **Upgrade**: Pro features available via payment

### 2. Demo Page
- **URL**: `http://localhost:3000/demo`
- **Features**: Interactive feature showcase
- **Payment**: Test payment gateway integration

### 3. Weather Page
- **URL**: `http://localhost:3000/weather`
- **Features**: Real-time weather, forecasts
- **Integration**: Travel recommendations

### 4. Admin Panel
- **URL**: `http://localhost:3000/admin`
- **Access**: Admin users only
- **Features**: User management, analytics

## 🔒 Security

- **JWT Authentication** with secure token handling
- **CORS Protection** for cross-origin requests
- **Input Validation** and sanitization
- **Rate Limiting** for API endpoints
- **Secure Headers** configuration

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🚀 Deployment

### Production Build
```powershell
# Build frontend
npm run build

# Build Docker images
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Setup
1. Configure production environment variables
2. Set up SSL certificates
3. Configure reverse proxy (Nginx)
4. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For support and questions:
- **Team**: Techness Team
- **Email**: support@techness.com
- **Documentation**: See `/docs` folder

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ by Techness Team**
