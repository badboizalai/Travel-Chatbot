# 📁 Cấu trúc Project TravelMate AI Chatbot

## 🎯 Tổng quan Project

TravelMate là một nền tảng chatbot AI toàn diện dành cho du lịch Việt Nam với tích hợp thanh toán, dự báo thời tiết, và dịch vụ đặt chỗ.

## 📊 Cấu trúc thư mục chi tiết

```
📁 Travel Chatbot/
├── 📄 README.md                    # Tài liệu chính
├── 📄 package.json                 # Metadata và scripts
├── 📄 docker-compose.yml          # Development environment
├── 📄 docker-compose.prod.yml     # Production environment
├── 📄 Dockerfile                  # Flow manager container
├── 📄 requirements.txt            # Python dependencies cho root
├── 📄 manage_flow.py              # Langflow management script
│
├── 🔧 Scripts/
│   ├── 📄 setup-complete.ps1      # Complete setup script
│   ├── 📄 start-dev.ps1          # Development startup
│   ├── 📄 build-prod.ps1         # Production build
│   ├── 📄 health-check.ps1       # System health check
│   └── 📄 health-check.sh        # Linux health check
│
├── 🎨 Frontend/ (React + TypeScript)
│   ├── 📄 package.json            # Frontend dependencies
│   ├── 📄 tsconfig.json          # TypeScript configuration
│   ├── 📄 tailwind.config.js     # Styling framework
│   ├── 📄 Dockerfile             # Development container
│   ├── 📄 Dockerfile.prod        # Production container
│   ├── 📄 nginx.conf             # Production web server config
│   ├── 📄 .env.example           # Environment template
│   ├── 📄 .dockerignore          # Docker build optimization
│   │
│   ├── 📁 public/
│   │   └── 📄 index.html          # Main HTML template
│   │
│   └── 📁 src/
│       ├── 📄 App.tsx             # Main application component
│       ├── 📄 index.tsx           # Application entry point
│       ├── 📄 index.css           # Global styles
│       │
│       ├── 🧩 components/         # Reusable UI components
│       │   ├── 📄 ChatWidget.tsx      # AI chatbot widget
│       │   ├── 📄 Layout.tsx          # Page layout wrapper
│       │   ├── 📄 PaymentModal.tsx    # Payment processing
│       │   └── 📄 ProtectedRoute.tsx  # Authentication guard
│       │
│       ├── 📄 pages/              # Page components
│       │   ├── 📄 HomePage.tsx        # Landing page
│       │   ├── 📄 DemoPage.tsx        # Feature demonstration
│       │   ├── 📄 ChatPage.tsx        # Chat interface
│       │   ├── 📄 WeatherPage.tsx     # Weather forecast
│       │   ├── 📄 BookingPage.tsx     # Travel booking
│       │   ├── 📄 MapPage.tsx         # Interactive maps
│       │   ├── 📄 ProfilePage.tsx     # User profile
│       │   ├── 📄 AdminPage.tsx       # Administration
│       │   ├── 📄 LoginPage.tsx       # User authentication
│       │   ├── 📄 RegisterPage.tsx    # User registration
│       │   └── 📄 PricingPage.tsx     # Subscription plans
│       │
│       ├── 🔗 hooks/              # Custom React hooks
│       │   └── 📄 useAuth.tsx         # Authentication logic
│       │
│       ├── 🌐 services/           # API service layers
│       │   ├── 📄 api.ts              # Core API client
│       │   ├── 📄 langflowApi.ts      # Langflow integration
│       │   └── 📄 paymentService.ts   # Payment processing
│       │
│       └── 📝 types/              # TypeScript type definitions
│           ├── 📄 index.ts            # Main type exports
│           ├── 📄 environment.d.ts    # Environment types
│           ├── 📄 react.d.ts          # React extensions
│           └── 📄 lucide-react.d.ts   # Icon library types
│
├── 🔙 Backend/ (FastAPI + Python)
│   ├── 📄 main.py                 # Application entry point
│   ├── 📄 requirements.txt        # Python dependencies
│   ├── 📄 Dockerfile             # Development container
│   ├── 📄 Dockerfile.prod        # Production container
│   ├── 📄 .env.example           # Environment template
│   ├── 📄 .dockerignore          # Docker build optimization
│   │
│   ├── 🛣️ routes/               # API endpoint handlers
│   │   ├── 📄 __init__.py         # Package initialization
│   │   ├── 📄 auth.py             # Authentication endpoints
│   │   ├── 📄 chatbot.py          # Chatbot API
│   │   ├── 📄 weather.py          # Weather services
│   │   ├── 📄 booking.py          # Booking services
│   │   ├── 📄 search.py           # Search functionality
│   │   └── 📄 admin.py            # Administration API
│   │
│   ├── 🗄️ models/               # Database models
│   │   ├── 📄 __init__.py         # Package initialization
│   │   ├── 📄 models.py           # SQLAlchemy models
│   │   └── 📄 schemas.py          # Pydantic schemas
│   │
│   ├── 🔧 services/              # Business logic
│   │   ├── 📄 __init__.py         # Package initialization
│   │   ├── 📄 langflow_service.py # AI integration
│   │   ├── 📄 weather_service.py  # Weather data
│   │   ├── 📄 booking_service.py  # Travel booking
│   │   └── 📄 search_service.py   # Search functionality
│   │
│   ├── ⚙️ config/               # Configuration
│   │   ├── 📄 __init__.py         # Package initialization
│   │   ├── 📄 database.py         # Database setup
│   │   └── 📄 redis_client.py     # Redis configuration
│   │
│   ├── 🔐 auth/                 # Authentication
│   │   ├── 📄 __init__.py         # Package initialization
│   │   └── 📄 auth.py             # JWT handling
│   │
│   └── 📁 data/                 # Data storage
│       └── (runtime data files)
│
├── 🤖 custom/                   # Langflow configurations
│   └── 📄 TravelMate.json        # Main chatbot flow
│
└── 🐍 env/                     # Python virtual environment
    ├── 📄 pyvenv.cfg            # Virtual environment config
    ├── 📁 Include/              # Header files
    ├── 📁 Lib/                  # Python libraries
    └── 📁 Scripts/              # Executable scripts
```

## 🔧 Chi tiết từng component

### 🎨 Frontend Components

#### Core Components
- **ChatWidget.tsx**: Widget chat AI nổi với giao diện pink-purple gradient
- **Layout.tsx**: Layout chính với navigation và footer
- **PaymentModal.tsx**: Modal xử lý thanh toán MoMo/ZaloPay/VNPay
- **ProtectedRoute.tsx**: Bảo vệ routes cần authentication

#### Pages
- **HomePage.tsx**: Landing page với hero section và features
- **DemoPage.tsx**: Trang demo tương tác các tính năng
- **ChatPage.tsx**: Giao diện chat chính
- **WeatherPage.tsx**: Dự báo thời tiết cho các thành phố VN
- **BookingPage.tsx**: Đặt vé/phòng qua API
- **MapPage.tsx**: Bản đồ tương tác với Google Maps
- **PricingPage.tsx**: Các gói subscription

### 🔙 Backend Services

#### API Routes
- **auth.py**: Login, register, JWT refresh
- **chatbot.py**: Tích hợp với Langflow AI
- **weather.py**: API thời tiết OpenWeatherMap
- **booking.py**: Tích hợp booking APIs
- **search.py**: Tìm kiếm địa điểm, khách sạn
- **admin.py**: Quản lý users, analytics

#### Services
- **langflow_service.py**: Xử lý AI conversations
- **weather_service.py**: Lấy và cache dữ liệu thời tiết
- **booking_service.py**: Logic đặt chỗ
- **search_service.py**: Tìm kiếm và filter

### 🗄️ Database Schema

#### Core Tables
- **users**: User profiles và authentication
- **conversations**: Chat history
- **bookings**: Travel bookings
- **payments**: Payment transactions
- **subscriptions**: Pro/Enterprise plans

### 🔧 Configuration Files

#### Environment Variables
- **Frontend .env**: React app config, API URLs
- **Backend .env**: Database, Redis, API keys
- **Docker .env**: Container orchestration

#### Build Configs
- **tsconfig.json**: TypeScript compilation
- **tailwind.config.js**: CSS framework
- **docker-compose.yml**: Multi-service setup

## 🚀 Deployment Architecture

### Development
```
Frontend (3000) ←→ Backend (8000) ←→ Database (5432)
     ↓                    ↓              ↓
Langflow (8080)    Redis (6379)    Docker Network
```

### Production
```
Nginx (80/443) → Frontend Container
       ↓
Load Balancer → Backend Containers
       ↓
Database Cluster + Redis Cluster
```

## 📊 Technology Stack

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + Framer Motion
- **React Router** + React Query
- **Axios** + React Hot Toast

### Backend
- **FastAPI** + Uvicorn
- **SQLAlchemy** + Alembic
- **Redis** + Celery
- **JWT** + Bcrypt

### AI & Integrations
- **Langflow** + OpenAI
- **Google Maps** + Places API
- **OpenWeatherMap** API
- **MoMo/ZaloPay/VNPay** gateways

### DevOps
- **Docker** + Docker Compose
- **PostgreSQL** + Redis
- **Nginx** + SSL/TLS
- **Health Checks** + Monitoring

## 📈 Features Overview

### 🤖 AI Chatbot
- Floating widget với modern UI
- Basic vs Pro tiers
- Vietnamese language optimization
- Context-aware responses
- Payment integration cho upgrades

### 💳 Payment System
- Vietnamese payment gateways
- Subscription management
- Real-time transaction processing
- Mock service cho development

### 🌤️ Weather Integration
- Real-time weather data
- 7-day forecasts
- Travel recommendations
- Interactive weather maps

### 🗺️ Location Services
- Interactive maps
- Route planning
- Points of interest
- Location-based recommendations

---

**🎯 Project Status: Production Ready**
- ✅ Clean architecture
- ✅ Comprehensive documentation  
- ✅ Production deployment configs
- ✅ Health monitoring
- ✅ Security best practices
