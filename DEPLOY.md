# Mokammel Fit Pro - Deployment Guide

## 1. Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (for local development)
- Valid Google Gemini API Key

## 2. Environment Setup
Create a `.env` file in the root directory:

```bash
POSTGRES_USER=mokammel
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=fitpro
JWT_SECRET=your_jwt_secret
API_KEY=your_google_gemini_api_key
NODE_ENV=production
```

## 3. Directory Structure
Ensure your project follows this structure:
```
/root
  ├── backend/           # NestJS Backend code
  ├── Dockerfile         # Frontend Dockerfile
  ├── docker-compose.yml
  ├── nginx.conf
  └── ... (Frontend source files)
```

## 4. Launching Production
Run the following command to build and start all services:

```bash
docker-compose up -d --build
```

## 5. Verification
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api/health
- **Database**: Port 5432 (Internal)

## 6. Production Checklist
- [x] Dockerization completed
- [x] Nginx Reverse Proxy configured
- [x] Database persistence volume setup
- [ ] SSL Certificates (Certbot) configured for domain
- [ ] CI/CD Pipelines setup

## 7. Architecture
[User] -> [Nginx] -> [Frontend Container (React)]
                  -> [Backend Container (NestJS)] -> [Postgres DB]
                                                  -> [Gemini AI API]
