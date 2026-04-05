# BIUST Smart Maintenance System (BSM)

A comprehensive **Computerised Maintenance Management System (CMMS)** for BIUST University, designed to streamline maintenance operations across campus residences.

## 🏗️ System Architecture

The BSM system is divided into two main sides:

### 1. **Public Reporting Side**
- **Users**: Students and Staff
- **Authentication**: Block → Room → Digital Key
- **Features**:
  - Submit maintenance reports
  - Track ticket progress through 9-stage timeline
  - View room-specific notifications
  - Schedule technician visits
  - Duplicate prevention (one pending issue per room)

### 2. **Private Operations Side**
- **Users**: Campus Assistants, Operators, Technicians, Coordinators
- **Authentication**: JWT-based with Role-Based Access Control (RBAC)
- **Layout**: IDE-style workspace with:
  - Top toolbar (search, alerts, settings)
  - Left sidebar (navigation)
  - Central content area
  - Optional right sidebar and bottom panel

---

## 👥 User Roles & Permissions

| Role | Submit Report | View Tickets | Assign Tasks | Manage Inventory | View Analytics | Finance Access |
|------|---------------|--------------|--------------|------------------|----------------|----------------|
| **Student** | ✅ | Own only | ❌ | ❌ | ❌ | ❌ |
| **Staff** | ✅ | Own only | ❌ | ❌ | ❌ | ❌ |
| **Campus Assistant** | ✅ (campus-wide) | All open | ❌ | ❌ | ❌ | ❌ |
| **Operator** | ❌ | All | ✅ | Read | Limited | ❌ |
| **Technician** | ❌ | Assigned | ❌ | Update usage | ❌ | ❌ |
| **Coordinator** | ✅ | All | ✅ | Full | Full | ✅ (PIN-locked) |

---

## 🎯 Key Features

### 📊 **Progress Timeline (9 Stages)**
Each maintenance ticket progresses through these stages:
1. **Report Submitted** - Initial submission by resident
2. **Operator Review** - Reviewed by operations team
3. **Sourcing Funds** - Budget allocation
4. **Sourcing Materials** - Material procurement
5. **Technician Assigned** - Job assigned to technician
6. **Scheduled Visit** - Visit appointment scheduled
7. **Work In Progress** - Repair work underway
8. **Completed** - Work completed
9. **Closed** - Verified and closed

### 🏢 **Block & Area Management**
- **Initial Setup**: Upload CSV at semester start to auto-create blocks and rooms
- **Dynamic Management**: Add blocks mid-semester, assign students
- **Editing & Archiving**: Rename, merge, or archive blocks with full audit trail
- **Digital Keys**: Reset each semester for security

### 📦 **Inventory Management**
- Track materials and supplies
- Auto-update when job cards consume materials
- Low stock alerts
- Filtering and search capabilities
- Supplier information

### 💰 **Finance Dashboard (Coordinator Only, PIN-Locked)**
- **Budget Summary**: Total, allocated, remaining, burn rate
- **Spending Trends**: Line graphs with filters
- **Project Costs**: Planned vs. actual comparison
- **Forecasting**: Overbudget risk analysis
- **Procurement Tracker**: Supplier orders linked to job cards
- **Budget Management**: Create/edit budgets, transfer funds, log expenses
- **Compliance & Reporting**: Audit logs, data export (CSV/PDF)

### 🔔 **Notifications**
- **Coordinator Control**: Target specific blocks/areas or "Select All"
- **Resident Filtering**: Only see alerts relevant to their block
- **Types**: Ticket updates, assignments, schedules, alerts, low inventory, budget alerts

### 📈 **Analytics & Reporting**
- Dashboard with key metrics
- Tickets by category, priority, status
- Average resolution time
- Financial metrics
- Export capabilities (CSV/PDF)

---

## 🔐 Authentication

### **Public Side**
```
1. Select Block (e.g., Block A)
2. Select Room (e.g., Room 101)
3. Enter Digital Key (e.g., KEY123)
```

**Demo Credentials:**
- Block A, Room 101, Key: `KEY123`
- Block A, Room 102, Key: `KEY456`
- Block B, Room 201, Key: `KEY789`

### **Private Side**
```
Email + Password (JWT Authentication)
```

**Demo Accounts (Temporary Recovery Credentials):**
- **Coordinator**: `coordinator@biust.ac.bw` / `coord123` (Name: Kagiso Rapula)
- **Operator**: `operator@biust.ac.bw` / `oper123` (Name: Bonolo Korong)
- **Technician**: `technician@biust.ac.bw` / `tech123` (Name: Kagiso)
- **Campus Assistant**: `assistant@biust.ac.bw` / `assist123` (Name: Karabo Rapelang)

**Finance PIN** (Coordinators only): `1234`

---

## 🛠️ Technical Stack

### **Frontend**
- ⚛️ **React 18.3.1** - UI framework
- 🎨 **Tailwind CSS v4** - Styling
- 🧭 **React Router 7** - Navigation (Data mode)
- 📊 **Recharts** - Charts and graphs
- 🔄 **React Query** - Data fetching
- 🗂️ **Zustand** - State management
- 📝 **React Hook Form** - Form handling
- 🎯 **TypeScript** - Type safety
- 🔔 **Sonner** - Toast notifications
- 🎭 **Radix UI** - Accessible components

### **Database** (Backend - Not Implemented)
- PostgreSQL (pgAdmin)
- Migration to Prisma planned

---

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI component library (shadcn)
│   │   ├── ProgressTimeline.tsx
│   │   └── figma/
│   ├── layouts/            # Layout wrappers
│   │   ├── PublicLayout.tsx
│   │   └── PrivateLayout.tsx
│   ├── pages/              # Page components
│   │   ├── public/         # Public side pages
│   │   │   ├── PublicLogin.tsx
│   │   │   ├── ResidentDashboard.tsx
│   │   │   └── TicketDetails.tsx
│   │   ├── private/        # Private side pages
│   │   │   ├── PrivateLogin.tsx
│   │   │   ├── OperatorDashboard.tsx
│   │   │   ├── TechnicianDashboard.tsx
│   │   │   ├── CampusAssistantDashboard.tsx
│   │   │   ├── CoordinatorDashboard.tsx
│   │   │   ├── FinanceDashboard.tsx
│   │   │   ├── InventoryPage.tsx
│   │   │   └── BlockManagement.tsx
│   │   └── NotFound.tsx
│   ├── store/              # State management
│   │   └── authStore.ts    # Authentication store (Zustand)
│   ├── services/           # API services
│   │   └── mockData.ts     # Mock data for demo
│   ├── types/              # TypeScript types
│   │   └── index.ts        # All type definitions
│   ├── routes.tsx          # Router configuration
│   └── App.tsx             # App entry point
├── styles/
│   ├── index.css
│   ├── tailwind.css
│   ├── theme.css
│   └── fonts.css
└── imports/                # Imported assets
```

---

## 🚀 Getting Started

### **Access the Application**

1. **Public Side (Students/Staff)**:
   - Navigate to `/` (root)
   - Select your block and room
   - Enter digital key
   
2. **Private Side (Operations Staff)**:
   - Navigate to `/private`
   - Login with email and password
   - Access role-specific dashboard

### **Key Workflows**

#### **Submit a Maintenance Report (Student)**
1. Login via public side
2. Click "Submit New Report"
3. Fill in title, category, and description
4. Submit (prevents duplicates if pending issue exists)
5. Track progress through 9-stage timeline

#### **Assign Technician (Operator)**
1. Login as operator
2. View all tickets in dashboard
3. Click "Assign" on a ticket
4. Select technician based on specialty
5. Technician receives assignment

#### **Complete Job (Technician)**
1. Login as technician
2. View assigned jobs
3. Click "Complete Job"
4. Fill digital job card (PPCF form)
5. Upload photos, add materials used
6. Mark as completed

#### **Access Finance Module (Coordinator)**
1. Login as coordinator
2. Navigate to Finance
3. Enter PIN (1234)
4. View budget, spending trends, project costs
5. Log expenses, track procurement

#### **Manage Blocks (Coordinator)**
1. Navigate to "Blocks & Areas"
2. Upload CSV to import students (semester start)
3. Add new blocks mid-semester
4. Edit or archive blocks as needed

---

## 🎨 Design System

### **Color Palette**

**Public Side**:
- Primary: Blue (bg-blue-600)
- Success: Green (bg-green-500)
- Warning: Amber (bg-amber-500)
- Error: Red (bg-red-500)

**Private Side (IDE Theme)**:
- Background: Slate-900
- Surface: Slate-800
- Border: Slate-700
- Text: White / Slate-300

### **Components**

All UI components are built with **Radix UI** and **Tailwind CSS**, ensuring:
- ♿ Accessibility (WCAG 2.1 AA)
- 📱 Responsiveness
- 🎯 Consistency
- ⚡ Performance

---

## 🔒 Security Features

### **Authentication**
- ✅ JWT-based authentication for staff
- ✅ Digital key system for residents (reset each semester)
- ✅ RBAC (Role-Based Access Control)
- ✅ Finance module PIN lock (additional security layer)

### **Privacy**
- ✅ Students/staff can only view their own tickets
- ✅ Internal notes hidden from residents
- ✅ Sensitive financial data restricted to coordinators
- ✅ Audit logs for all system changes

### **Validation**
- ✅ Form validation on all inputs
- ✅ Duplicate ticket prevention
- ✅ Input sanitization (XSS protection)
- ✅ Rate limiting (planned for production)

---

## 📱 Responsive Design

The system is fully responsive and works on:
- 🖥️ **Desktop** (1920x1080+) - Full IDE experience
- 💻 **Laptop** (1366x768+) - Optimized layout
- 📱 **Tablet** (768px+) - Adapted interface
- 📲 **Mobile** (375px+) - Essential features for technicians

---

## 🧪 Testing

### **Unit Tests** (Planned)
- Form validation
- Progress timeline logic
- Dashboard calculations
- Inventory management

### **Integration Tests** (Planned)
- API calls
- Authentication flow
- File uploads
- Data export

### **Coverage Target**: ≥70% by Week 3

---

## 📊 Analytics & Reports

### **Available Metrics**
- Total tickets (by status, priority, category)
- Average resolution time
- Budget utilization
- Inventory levels
- Technician workload
- Occupancy rates

### **Export Formats**
- CSV (for data analysis)
- PDF (for reports)

---

## 🔄 State Management

### **Zustand Stores**
- **authStore**: User authentication, roles, permissions
- **Future**: ticketStore, inventoryStore, notificationStore

### **React Query**
- Data fetching and caching
- Automatic refetching
- Optimistic updates

---

## 🛣️ Roadmap

### **Phase 1: Core Features** ✅
- Public and private authentication
- Ticket management
- Progress timeline
- Role-based dashboards

### **Phase 2: Advanced Features** (In Progress)
- Finance module
- Inventory management
- Block management
- Analytics

### **Phase 3: Backend Integration** (Planned)
- PostgreSQL database
- Prisma ORM
- REST/GraphQL API
- File storage (AWS S3)

### **Phase 4: Enhancement** (Planned)
- Real-time notifications (WebSocket)
- Mobile app (React Native)
- Preventive maintenance scheduler
- Asset tracking with QR codes
- Disaster response mode

---

## 👨‍💻 Development

### **Code Style**
- ✅ Comprehensive comments on all files
- ✅ JSDoc for functions and components
- ✅ TypeScript strict mode
- ✅ Consistent naming conventions

### **Comments Policy**
Every file includes:
- 📝 File-level description
- 📝 Function/method documentation
- 📝 Complex logic explanation
- 📝 Type definitions with descriptions

---

## 📞 Support

For technical support or inquiries:
- 📧 **Email**: support@biust.ac.bw
- 🌐 **IT Support**: it.support@biust.ac.bw

---

## 📄 License

© 2024 BIUST University. All rights reserved.

---

## 🙏 Acknowledgments

Built with modern web technologies to serve the BIUST University community.

**System Version**: 1.0.0  
**Last Updated**: March 28, 2024
