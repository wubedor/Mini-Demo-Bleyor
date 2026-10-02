# SAMB Laundry - React Frontend + Node.js Backend

A full-stack laundry services application with React frontend and Node.js backend.

## Tech Stack

### Frontend (React)
- **React 18.3.1** - UI framework
- **React Router DOM 7.13.1** - Client-side routing
- **Axios 1.19.0** - HTTP client for API calls
- **Socket.io Client 4.8.3** - Real-time communication
- **Firebase 12.12.1** - Optional Firebase integration

### Backend (Node.js)
- **Express 4.18.2** - Web framework
- **Node.js 18+** - Runtime environment
- **CORS 2.8.5** - Cross-origin resource sharing
- **Helmet 7.1.0** - Security headers
- **Morgan 1.10.0** - HTTP request logger
- **JWT 9.0.2** - Authentication tokens
- **Mongoose 8.0.3** - MongoDB ODM
- **Socket.io 4.6.0** - Real-time WebSocket server

## Project Structure

```
bleyor/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── config/        # Configuration files
│   │   ├── context/       # React context providers
│   │   ├── routing/       # Route components
│   │   ├── services/      # API service functions
│   │   ├── styles/        # CSS stylesheets
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main React component
│   │   └── index.js       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── backend/           # Node.js Express API
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables
│   ├── firebase.json      # Firebase configuration
│   └── package.json       # Backend dependencies
└── package.json       # Root scripts for both frontend and backend
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Install all dependencies:**
```bash
npm run install:all
```

Or install separately:
```bash
npm run install:frontend  # Install frontend dependencies
npm run install:backend   # Install backend dependencies
```

### Running the Application

**Option 1: Run both frontend and backend together:**
```bash
npm start              # Start both in production mode
npm run dev            # Start backend with nodemon + frontend
```

**Option 2: Run separately:**
```bash
# Terminal 1 - Backend
cd backend
node server.js        # or: npm run dev:backend

# Terminal 2 - Frontend  
cd frontend
npm start             # React development server
```

### Development Servers

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Available Scripts

### Root Scripts
- `npm start` - Start both frontend and backend
- `npm run dev` - Start backend with nodemon + frontend
- `npm run build` - Build frontend for production
- `npm run install:all` - Install all dependencies

### Frontend Scripts (cd frontend)
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Backend Scripts (cd backend)
- `npm start` - Start Node.js server
- `npm run dev` - Start with nodemon (auto-restart)
- `npm test` - Run backend tests

## Features

### Frontend
- Modern React 18 with hooks
- Client-side routing with React Router
- API integration with Axios
- Real-time updates with Socket.io
- Responsive design
- Authentication flow
- Service booking system

### Backend
- RESTful API with Express
- JWT authentication
- MongoDB database integration
- Real-time WebSocket communication
- Security with Helmet and CORS
- Request logging with Morgan
- Environment configuration with dotenv

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/samb-laundry
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Production Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Production
```bash
cd backend
NODE_ENV=production node server.js
```

## Troubleshooting

**Frontend won't start:**
- Check if port 3000 is available
- Run `npm run install:frontend` to ensure dependencies are installed

**Backend won't start:**
- Check if port 5000 is available
- Ensure MongoDB is running if using database features
- Run `npm run install:backend` to ensure dependencies are installed

**API connection errors:**
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure environment variables are set correctly

## License

MIT
