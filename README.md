# 📸 Image & Log Management App

A modern web application for uploading, managing images and viewing system logs, built with Node.js, Express, React, and TypeScript.

## ✨ Features

### 🖼️ Image Management
- **Drag & Drop Upload**: Easy image upload with drag-and-drop interface
- **Image Processing**: Automatic thumbnail generation using Sharp
- **Multiple Formats**: Support for JPEG, PNG, GIF, WebP
- **Image Gallery**: Beautiful grid layout with image previews
- **Image Viewer**: Full-size image modal viewer
- **File Management**: Delete images with confirmation

### 📋 Log Management
- **Real-time Logs**: View system logs in real-time
- **Log Filtering**: Filter logs by level (Error, Warning, Info)
- **Log Pagination**: Paginated log viewing for better performance
- **Test Logs**: Create test log entries for testing
- **Log Clearing**: Clear all logs functionality
- **Structured Logging**: JSON-formatted logs with Winston

### 🐳 Docker Support
- **Development Environment**: Complete Docker setup for development
- **Production Ready**: Optimized Docker configuration
- **Volume Persistence**: Persistent storage for uploads and logs
- **Nginx Proxy**: Optional reverse proxy for production

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd image-log-app
   git checkout app-image-log-management
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run server  # Backend on http://localhost:5000
   npm run client  # Frontend on http://localhost:3000
   ```

### Docker Development

1. **Start with Docker Compose:**
   ```bash
   # Development environment
   docker-compose up
   
   # With production nginx proxy
   docker-compose --profile production up
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - With Nginx: http://localhost

### Production Deployment

1. **Build and run:**
   ```bash
   # Build the application
   npm run build
   
   # Start production server
   npm start
   ```

2. **Docker production:**
   ```bash
   # Build production image
   docker build -t image-log-app .
   
   # Run production container
   docker run -p 5000:5000 -v $(pwd)/uploads:/app/server/uploads image-log-app
   ```

## 📁 Project Structure

```
image-log-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Header.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   └── LogViewer.tsx
│   │   ├── App.tsx         # Main app component
│   │   └── App.css         # Styles
│   ├── Dockerfile.dev      # Frontend Docker config
│   └── package.json
├── server/                 # Express backend
│   ├── routes/             # API routes
│   │   ├── images.js       # Image management routes
│   │   └── logs.js         # Log management routes
│   ├── uploads/            # Uploaded images (created at runtime)
│   ├── logs/               # Log files (created at runtime)
│   └── index.js            # Main server file
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Backend Docker config
├── nginx.conf             # Nginx configuration
└── package.json           # Backend dependencies
```

## 🔧 API Endpoints

### Image Management
- `POST /api/images/upload` - Upload an image
- `GET /api/images` - Get all images
- `DELETE /api/images/:id` - Delete an image

### Log Management
- `GET /api/logs` - Get all logs (paginated)
- `GET /api/logs/level/:level` - Get logs by level
- `POST /api/logs/test` - Create test log entry
- `DELETE /api/logs` - Clear all logs

### Health Check
- `GET /api/health` - Health check endpoint

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Winston** - Logging
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **React Dropzone** - File upload UI
- **CSS3** - Styling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (optional)

## 📝 Configuration

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### File Upload Limits
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, WebP
- Automatic thumbnail generation: 300x300px

### Logging Configuration
- Log levels: error, warn, info
- Log files: `combined.log`, `error.log`
- JSON format with timestamps

## 🔒 Security Features

- **Helmet.js** - Security headers
- **File type validation** - Only image files allowed
- **File size limits** - Prevents large file uploads
- **CORS protection** - Configurable cross-origin policies
- **Input validation** - Request validation and sanitization

## 🚀 Performance Features

- **Image optimization** - Automatic JPEG compression
- **Thumbnail generation** - Reduced file sizes for gallery
- **Pagination** - Efficient log viewing
- **Static file serving** - Optimized file delivery
- **Docker optimization** - Multi-stage builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Happy coding! 🎉**