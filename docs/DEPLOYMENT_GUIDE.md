# 🚀 TravelMate Deployment Guide

## 📋 Prerequisites

### System Requirements
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 50GB+ SSD
- **OS**: Windows 10/11, Ubuntu 20.04+, or macOS 12+

### Software Requirements
- **Node.js**: 18.0+ (LTS recommended)
- **Python**: 3.10+
- **Docker**: 24.0+
- **Docker Compose**: 2.0+
- **Git**: 2.30+

## 🛠️ Development Setup

### Quick Start (Recommended)
```powershell
# Clone and setup
git clone <repository-url>
cd "Travel Chatbot"

# Complete automated setup
./setup-complete.ps1

# Start development
./start-dev.ps1
```

### Manual Setup
```powershell
# 1. Install dependencies
npm run setup

# 2. Setup environment files
Copy-Item "frontend\.env.example" "frontend\.env"
Copy-Item "backend\.env.example" "backend\.env"

# 3. Start services
npm start  # Or use docker-compose up --build
```

## 🐳 Docker Development

### Full Stack with Docker
```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f langflow
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Service URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Langflow**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 🏭 Production Deployment

### 1. Environment Configuration

#### Frontend Production (.env.production)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_LANGFLOW_URL=https://langflow.yourdomain.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

#### Backend Production (.env.production)
```bash
DEBUG=False
DATABASE_URL=postgresql://user:password@prod-db:5432/travel_db
REDIS_URL=redis://prod-redis:6379/0
JWT_SECRET=your-super-secure-production-secret
CORS_ORIGINS=["https://yourdomain.com"]
```

### 2. Build Production Images
```powershell
# Build and deploy with Docker
./build-prod.ps1 -Docker -Deploy

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3. Manual Production Build
```powershell
# Frontend
cd frontend
npm ci --only=production
npm run build

# Backend
cd ../backend
pip install -r requirements.txt --no-dev
```

## 🌐 Server Deployment

### Option 1: VPS/Cloud Server

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Deploy Application
```bash
# Clone repository
git clone <repository-url>
cd TravelMate

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Setup Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Cloud Platforms

#### AWS Deployment
```bash
# Using AWS ECS/Fargate
aws ecs create-cluster --cluster-name travelmate
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster travelmate --service-name travelmate-service
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/travelmate
gcloud run deploy --image gcr.io/PROJECT-ID/travelmate --platform managed
```

#### Azure Container Instances
```bash
# Deploy to Azure
az container create --resource-group myResourceGroup --name travelmate --image your-registry/travelmate:latest
```

## 📊 Monitoring & Maintenance

### Health Checks
```powershell
# Run health check
./scripts/health-check.ps1

# Or manual checks
curl http://localhost:8000/health
curl http://localhost:3000/health
curl http://localhost:8080/api/v1/health
```

### Log Monitoring
```bash
# Docker logs
docker-compose logs -f --tail=100

# Application logs
tail -f backend/logs/app.log
tail -f nginx/logs/access.log
```

### Database Backup
```bash
# PostgreSQL backup
docker exec postgres pg_dump -U postgres travel_db > backup.sql

# Redis backup
docker exec redis redis-cli BGSAVE
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Using Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Environment Security
- Use strong, unique passwords
- Rotate API keys regularly
- Enable 2FA for all accounts
- Use environment variables for secrets
- Never commit .env files to git

### Firewall Configuration
```bash
# UFW setup
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📈 Performance Optimization

### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement service workers
- Optimize images and fonts
- Bundle size analysis

### Backend Optimization
- Database query optimization
- Redis caching strategy
- Connection pooling
- Background task processing
- Rate limiting

### Database Optimization
```sql
-- PostgreSQL performance tuning
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_conversations_user_id ON conversations(user_id);
ANALYZE;
```

## 🔧 Troubleshooting

### Common Issues

#### Frontend Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Backend Connection Issues
```bash
# Check database connection
docker exec -it postgres psql -U postgres -d travel_db -c "\l"

# Check Redis connection
docker exec -it redis redis-cli ping
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a
docker-compose down -v
docker-compose up --build
```

### Performance Issues
```bash
# Monitor resource usage
docker stats
htop
iostat -x 1

# Database performance
docker exec postgres pg_stat_activity
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly performance review
- [ ] Database optimization
- [ ] Log rotation and cleanup
- [ ] SSL certificate renewal
- [ ] Backup verification

### Monitoring Endpoints
- **Health**: `/health`
- **Metrics**: `/metrics`
- **Status**: `/status`
- **Version**: `/version`

### Emergency Procedures
1. **Service Down**: Check health endpoints
2. **Database Issues**: Review logs and connections
3. **High Load**: Scale containers horizontally
4. **Security Breach**: Rotate secrets immediately

---

**🎯 Deployment Status: Production Ready**

For technical support, contact: support@techness.com
