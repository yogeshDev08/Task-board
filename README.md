# Task Management Dashboard

A full-stack task management application (mini Jira-like system) built with Node.js, Express, React, and MongoDB. Features real-time updates via WebSockets, role-based access control, and comprehensive task management capabilities.

## Features

### Backend
- RESTful API with Express.js
- JWT-based authentication
- Role-based authorization (Admin/User)
- MongoDB with Mongoose ODM
- WebSocket support for real-time updates (Socket.io)
- Input validation with express-validator
- Error handling middleware
- Database indexing for performance
- Pagination, filtering, and search

### Frontend
- React 18+ with Hooks
- Redux Toolkit for state management
- React Router v6 for routing
- Tailwind CSS for styling
- Real-time updates via Socket.io client
- Debounced search
- Optimistic UI updates
- Protected routes
- Responsive design

## Tech Stack

### Backend
- Node.js 18+
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- Socket.io for WebSockets
- express-validator for validation
- Jest for testing

### Frontend
- React 18+
- Redux Toolkit
- React Router v6
- Axios
- React Hook Form
- Tailwind CSS
- Socket.io-client
- React Testing Library & Jest

## Project Structure

```
task-management-dashboard/
├── backend/
│   ├── models/          # Mongoose models (User, Task)
│   ├── controllers/      # Route controllers
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, validation, error handling
│   ├── config/          # Database configuration
│   ├── __tests__/       # Unit tests
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store and slices
│   │   ├── utils/       # Utility functions
│   │   ├── hooks/       # Custom hooks
│   │   └── __tests__/   # Unit tests
│   ├── public/
│   └── package.json
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
MONGO_URI=mongodb+srv://admin:password@cluster0.wlp63lo.mongodb.net/?appName=Cluster0
JWT_SECRET=tempararysecretkey
JWT_EXPIRES_IN=1h
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=adminPassword@123
```

4. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Docker Setup

### Using Docker Compose (Recommended)

1. Create `.env` file in the root directory (copy from `.env.example`)

2. Build and start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

4. Stop services:
```bash
docker-compose down
```

### Individual Docker Builds

#### Backend
```bash
cd backend
docker build -t task-manager-backend .
docker run -p 5000:5000 --env-file .env task-manager-backend
```

#### Frontend
```bash
cd frontend
docker build -t task-manager-frontend .
docker run -p 3000:80 task-manager-frontend
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: { email, password, role? }
Response: { success, data: { user, token } }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { success, data: { user, token } }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { success, data: { user } }
```

### User Endpoints (Admin Only)

#### Get All Users
```
GET /api/users
Headers: Authorization: Bearer <token>
Response: { success, count, data: { users } }
```

#### Create User
```
POST /api/users
Headers: Authorization: Bearer <token>
Body: { email, password, role }
Response: { success, data: { user } }
```

#### Get User by ID
```
GET /api/users/:id
Headers: Authorization: Bearer <token>
Response: { success, data: { user } }
```

### Task Endpoints

#### Get All Tasks
```
GET /api/tasks?page=1&limit=10&status=TODO&priority=HIGH&search=title&dueDate=2024-12-31
Headers: Authorization: Bearer <token>
Response: { success, pagination, data: { tasks } }
```

#### Get Task by ID
```
GET /api/tasks/:id
Headers: Authorization: Bearer <token>
Response: { success, data: { task } }
```

#### Create Task
```
POST /api/tasks
Headers: Authorization: Bearer <token>
Body: { title, description?, status?, priority?, dueDate?, assignedTo? }
Response: { success, data: { task } }
```

#### Update Task
```
PUT /api/tasks/:id
Headers: Authorization: Bearer <token>
Body: { title?, description?, status?, priority?, dueDate?, assignedTo? }
Response: { success, data: { task } }
```

#### Delete Task
```
DELETE /api/tasks/:id
Headers: Authorization: Bearer <token>
Response: { success, message }
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Security Features

- JWT token authentication with expiration (1 hour)
- Password hashing with bcryptjs
- Input validation on all endpoints
- Role-based access control
- CORS configuration
- Protected routes middleware

## Performance Optimizations

- Database indexes on frequently queried fields
- React component memoization
- Debounced search input
- Pagination for large datasets
- Optimistic UI updates

## Real-time Features

The application uses WebSockets (Socket.io) for real-time updates:
- Task creation broadcasts to all connected clients
- Task updates broadcast to assignees and admins
- Task deletion broadcasts to all connected clients

## Assumptions

1. MongoDB is running locally or accessible via the provided URI
2. Users can register with any role (admin/user) - in production, you may want to restrict admin registration
3. JWT tokens expire after 1 hour (configurable via JWT_EXPIRES_IN)
4. Frontend runs on port 3000, backend on port 5000
5. All dates are stored in UTC format

## Production Deployment

### Environment Variables
Ensure all environment variables are set correctly:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Strong secret key for JWT signing
- `NODE_ENV`: Set to `production`
- `FRONTEND_URL`: Frontend application URL

### Security Checklist
- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable logging and monitoring
- [ ] Regular database backups