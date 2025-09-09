# Test File Upload System

This script helps you test the file upload functionality.

## Prerequisites
- Backend server running
- Database connected
- Cloudinary configured
- Authentication token

## Test Commands

### 1. Health Check
```bash
curl -X GET "http://localhost:3001/api/files/health"
```

### 2. Test File Upload (requires authentication)
```bash
curl -X POST "http://localhost:3001/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/test-file.pdf" \
  -F "folder=Test Folder" \
  -F "subfolder=Subfolder"
```

### 3. Get Files List
```bash
curl -X GET "http://localhost:3001/api/files/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Public Files (no auth required)
```bash
curl -X GET "http://localhost:3001/api/files/public/files"
```

## Troubleshooting

### If upload returns HTML instead of JSON:
1. Check that Cloudinary variables are set in Railway
2. Verify the route is correctly mounted
3. Check server logs for detailed error messages
4. Ensure multer middleware is properly configured

### Common Issues:
- Missing Cloudinary configuration
- Authentication token expired
- File size too large
- Invalid file type
- Database connection issues

## Environment Variables Required:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- DATABASE_URL
- JWT_SECRET
