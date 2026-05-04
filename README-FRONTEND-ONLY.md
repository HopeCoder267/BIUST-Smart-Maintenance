# BIUST Smart Maintenance System - Frontend Only

## 🚀 PURE FRONTEND SETUP

This project has been **intensely cleansed** and converted to a **pure frontend application**. All database and backend dependencies have been removed and replaced with mock data services.

## 📋 What Was Removed

### ❌ Backend Dependencies Deleted
- `axios` - HTTP client for backend APIs
- `bcrypt` - Password hashing (backend only)
- `cors` - CORS middleware (backend only)
- `dotenv` - Environment variables (backend only)
- `express` - Web server framework
- `pg` - PostgreSQL database driver
- All server-related files and directories
- Database migration files
- Backend API endpoints

### ❌ Database References Cleaned
- All database imports and connections
- SQL queries and database operations
- Database schema files
- Migration scripts

### ✅ What Remains (Frontend Only)
- React + TypeScript frontend
- Vite build system
- UI components and styling
- State management with Zustand
- Mock data service for development
- All user interfaces and interactions

## 🎯 Current Status

**PURE FRONTEND MODE** - Ready to run without any backend or database!

### Mock Data System
All data operations now use a single mock service:
- 📍 `src/app/services/mockData.ts` - **ONLY FILE** to replace for real backend
- 🔄 Simulates API calls with delays
- 📊 Provides sample data for all features
- 🎭 Maintains same API interface as real backend

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Public Login**: Use any student credentials
- **Staff Login**: Use mock staff credentials

## 🔐 Mock Login Credentials

### Staff Users
```
Email: admin@biust.ac.bw      Password: admin123      (Role: admin)
Email: coordinator@biust.ac.bw Password: coord123      (Role: coordinator)
Email: operator@biust.ac.bw   Password: oper123       (Role: operator)
Email: finance@biust.ac.bw     Password: fin123        (Role: finance)
```

### Student Login
```
Block: Block A
Room: 101
Digital Key: ALICE101
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # UI components
│   ├── pages/              # Page components
│   ├── services/
│   │   └── mockData.ts     # 🎯 ONLY MOCK DATA FILE
│   ├── store/              # State management
│   └── types/              # TypeScript types
├── stories/                # Storybook stories
└── styles/                 # CSS and styling
```

## 🔄 Connecting to Real Backend

When ready to connect to a real backend:

### Step 1: Delete Mock File
```bash
rm src/app/services/mockData.ts
```

### Step 2: Create Real API Service
Create `src/app/services/api.ts`:
```typescript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://your-backend-url.com/api',
});

// Add authentication headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### Step 3: Update Package Dependencies
Add to package.json:
```json
{
  "dependencies": {
    "axios": "^1.14.0"
  }
}
```

### Step 4: Update All Imports
Replace all imports from:
```typescript
import API from '../services/mockData';
```
To:
```typescript
import API from '../services/api';
```

## 🎨 Features Available (Mock Data)

### ✅ Working Features
- **Authentication System** - Mock JWT tokens
- **Block Management** - CRUD operations on blocks
- **Resident Management** - Add/remove residents
- **Maintenance Tickets** - Create and manage tickets
- **Dashboard Analytics** - Mock statistics and charts
- **User Roles** - Admin, Coordinator, Operator, Finance
- **File Uploads** - Mock file handling
- **Responsive Design** - Mobile-friendly interface

### 📊 Mock Data Included
- 2 mock blocks with capacity data
- 2 mock students with room assignments
- 2 mock maintenance tickets
- 4 mock staff users with different roles
- Sample analytics data

## 🚀 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run run build

# Run Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📱 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Lucide React** - Icons

### Development Tools
- **Storybook** - Component development
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🎯 Key Benefits of Frontend-Only Setup

### ✅ Immediate Development
- No database setup required
- No backend server needed
- Works offline
- Instant deployment ready

### ✅ Easy Testing
- All UI components functional
- Mock data for all features
- No external dependencies
- Fast development cycles

### ✅ Production Ready
- Can be deployed to any static hosting
- Vercel, Netlify, GitHub Pages ready
- No server maintenance
- Zero backend costs

## 🔧 Customization

### Adding New Mock Data
Edit `src/app/services/mockData.ts`:
```typescript
export const mockUsers = [
  // Add your mock users here
];

export const mockBlocks = [
  // Add your mock blocks here
];
```

### Modifying API Responses
Update the MockAPI class methods:
```typescript
class MockAPI {
  async get(endpoint: string) {
    // Customize mock responses
  }
}
```

## 📞 Support

For technical support with the frontend-only setup:
- Email: it.BSMsupport@biust.ac.bw
- Check the mock data file for API patterns
- All backend references have been documented for easy replacement

---

## 🎉 Summary

**✅ FRONTEND-ONLY MODE ACTIVATED**
- All backend dependencies removed
- Mock data service implemented
- Ready for immediate development
- Easy backend integration path
- Zero database requirements

The system is now a **pure frontend application** that can be developed, tested, and deployed without any backend infrastructure. When you're ready to add a real backend, simply replace the single mock data file!
