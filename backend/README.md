# RE/MAX Backend API

Backend API for the RE/MAX Knowledge Platform with file management system.

## Features

- 🔐 JWT Authentication
- 📁 File Upload to Cloudinary
- 📊 Folder Organization
- 👥 Role-based Permissions
- 📋 Admin Panel
- 🌐 Public Downloads
- 📈 Monitoring & Metrics

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Cloudinary Account

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup:**
   ```bash
   npm run db:generate
   npm run migrate:dev
   npm run db:seed
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/remax_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Cloudinary (Required for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"
```

### File Upload Configuration

- **Max File Size:** 50MB
- **Allowed Types:** Images, Videos, PDFs, Documents, Archives
- **Storage:** Cloudinary with folder organization

## API Endpoints

### File Management

#### Public Endpoints (No Auth Required)
- `GET /api/files/health` - Health check
- `GET /api/files/public/folders` - Get folder structure
- `GET /api/files/public/files` - Get public files
- `GET /api/files/public/:id` - Download specific file

#### Protected Endpoints (Auth Required)
- `POST /api/files/upload` - Upload file (admin only)
- `GET /api/files/` - List files (admin only)
- `GET /api/files/folders` - Get folder structure (admin only)
- `GET /api/files/:id` - Get file details (admin only)
- `DELETE /api/files/:id` - Delete file (admin only)

### Authentication

#### Auth Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

## Testing File Uploads

### 1. Health Check
```bash
curl http://localhost:3001/api/files/health
```

### 2. Upload File (with JWT token)
```bash
curl -X POST "http://localhost:3001/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "folder=Documents" \
  -F "subfolder=Legal"
```

### 3. List Files
```bash
curl -X GET "http://localhost:3001/api/files/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### File Upload Issues

#### Problem: Upload returns HTML instead of JSON
**Solutions:**
1. Check Cloudinary configuration in Railway
2. Verify JWT token is valid
3. Check file size (max 50MB)
4. Ensure file type is allowed

#### Problem: 413 File Too Large
**Solution:** Reduce file size or increase limit in multer config

#### Problem: Authentication Failed
**Solution:** Ensure JWT token is valid and not expired

### Configuration Issues

#### Check Configuration
```bash
npm run check-config
```

#### Start with Configuration Check
```bash
npm run start:safe
```

## Development Scripts

```bash
# Development with auto-reload
npm run dev

# Development with debug logging
npm run dev:debug

# Check configuration
npm run check-config

# Database operations
npm run db:studio      # Open Prisma Studio
npm run migrate:dev    # Run migrations
npm run db:seed        # Seed database

# Code quality
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── server.js       # Main server file
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.js         # Database seeding
│   └── migrations/     # Database migrations
├── scripts/            # Utility scripts
└── uploads/            # Temporary file storage
```

## Deployment

### Railway Deployment

1. **Environment Variables:** Set all required vars in Railway dashboard
2. **Build Command:** `npm run build`
3. **Start Command:** `npm start`

### Docker Deployment

```bash
# Build image
docker build -t remax-backend .

# Run container
docker run -p 3001:3001 --env-file .env remax-backend
```

## Support

For issues related to file uploads:
1. Check the `/api/files/health` endpoint
2. Verify Cloudinary configuration
3. Check server logs for detailed errors
4. Ensure all environment variables are set

## License

Private - RE/MAX Argentina
