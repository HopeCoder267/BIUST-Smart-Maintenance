# 🔐 BIUST Smart Maintenance System - Login Credentials

## 📋 Complete Login Guide

This document contains all login credentials for testing the BIUST Smart Maintenance System. All data is stored in the single mock data file (`src/app/services/mockData.ts`) for easy replacement with real backend data.

---

## 🏠 **PUBLIC LOGIN** (Residents/Students)

### 🎯 **How to Login as Resident**
1. Go to: http://localhost:5175/
2. Select your **Block**
3. Enter your **Room Number**
4. Enter your **Digital Key**
5. Click "Login"

### 📚 **Available Resident Accounts**

#### **Block A** (Mixed Gender)
| Room | Digital Key | Student Name | Student ID | Level |
|------|-------------|--------------|------------|-------|
| 101 | `ALICE101` | Alice Johnson | ST2024001 | Year 2 Computer Science |
| 102 | `BOB102` | Bob Smith | ST2024002 | Year 3 Engineering |
| 103 | `CAROL103` | Carol White | ST2024003 | Year 1 Business |
| 104 | `DAVID104` | David Brown | ST2024004 | Year 4 Medicine |

#### **Block B** (Female)
| Room | Digital Key | Student Name | Student ID | Level |
|------|-------------|--------------|------------|-------|
| 201 | `EMMA201` | Emma Davis | ST2024005 | Year 2 Nursing |
| 202 | `FRANK202` | Frank Wilson | ST2024006 | Year 3 Pharmacy |
| 203 | `GRACE203` | Grace Martinez | ST2024007 | Year 1 Architecture |

#### **Block C** (Male)
| Room | Digital Key | Student Name | Student ID | Level |
|------|-------------|--------------|------------|-------|
| 301 | `HENRY301` | Henry Taylor | ST2024008 | Year 2 ICT |
| 302 | `IVY302` | Ivy Anderson | ST2024009 | Year 4 Education |
| 303 | `JACK303` | Jack Thomas | ST2024010 | Year 3 Agriculture |

#### **Block D** (Mixed Gender - Under Maintenance)
| Room | Digital Key | Student Name | Student ID | Level |
|------|-------------|--------------|------------|-------|
| 401 | `KATE401` | Kate Jackson | ST2024011 | Year 2 Environmental Science |
| 402 | `LIAM402` | Liam White | ST2024012 | Year 1 Geology |

---

## 🏢 **PRIVATE LOGIN** (Staff & Administration)

### 🎯 **How to Login as Staff**
1. Go to: http://localhost:5175/private
2. Enter your **Email**
3. Enter your **Password**
4. Click "Login"

### 👥 **Available Staff Accounts**

#### **🔴 ADMIN ROLE** - Full System Access
| Email | Password | Name | Department | Phone |
|-------|----------|------|------------|-------|
| `admin@biust.ac.bw` | `admin123` | System Administrator | IT Department | +267 123 456 789 |

**Access**: All system features, user management, full control

---

#### **🟠 COORDINATOR ROLE** - Maintenance System Access
| Email | Password | Name | Department | Phone |
|-------|----------|------|------------|-------|
| `coordinator@biust.ac.bw` | `coord123` | Michael Coordinator | Maintenance Department | +267 234 567 890 |
| `maintenance.lead@biust.ac.bw` | `lead123` | Sarah Maintenance Lead | Maintenance Department | +267 345 678 901 |

**Access**: All maintenance features, finance module, analytics, staff management

---

#### **🟡 OPERATOR ROLE** - Ticket Management
| Email | Password | Name | Department | Phone |
|-------|----------|------|------------|-------|
| `operator@biust.ac.bw` | `oper123` | Jane Operator | Operations | +267 456 789 012 |
| `dispatcher@biust.ac.bw` | `dispatch123` | Robert Dispatcher | Operations | +267 567 890 123 |

**Access**: Ticket assignment, priority setting, technician dispatch, reporting

---

#### **🟢 TECHNICIAN ROLE** - Field Work
| Email | Password | Name | Department | Specialization | Phone |
|-------|----------|------|------------|----------------|-------|
| `technician@biust.ac.bw` | `tech123` | David Technician | Maintenance | Electrical | +267 678 901 234 |
| `plumber@biust.ac.bw` | `plumb123` | James Plumber | Maintenance | Plumbing | +267 789 012 345 |
| `carpenter@biust.ac.bw` | `carp123` | Peter Carpenter | Maintenance | Carpentry | +267 890 123 456 |

**Access**: Assigned jobs, job cards, work completion, material tracking

---

#### **🔵 CAMPUS ASSISTANT ROLE** - Campus Reporting
| Email | Password | Name | Department | Phone |
|-------|----------|------|------------|-------|
| `assistant@biust.ac.bw` | `assist123` | Emma Campus Assistant | Student Affairs | +267 901 234 567 |
| `hall.monitor@biust.ac.bw` | `hall123` | Oliver Hall Monitor | Student Affairs | +267 012 345 678 |

**Access**: Campus-wide reporting, view all open tickets, submit reports

---

#### **🟣 FINANCE ROLE** - Budget Management
| Email | Password | Name | Department | Phone |
|-------|----------|------|------------|-------|
| `finance@biust.ac.bw` | `fin123` | Finance Officer | Finance Department | +267 123 456 789 |
| `budget@biust.ac.bw` | `budget123` | Budget Manager | Finance Department | +267 234 567 890 |

**Access**: Budget management, expense approval, financial reporting

---

## 🎭 **Role-Based Access Control (RBAC)**

### **Permission Matrix**

| Feature | Admin | Coordinator | Operator | Technician | Campus Assistant | Finance |
|---------|-------|-------------|----------|------------|------------------|---------|
| **System Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **All Tickets View** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Ticket Assignment** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Priority Setting** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Job Cards** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Work Completion** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Block Management** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Inventory Management** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Budget Management** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Financial Reports** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Analytics Dashboard** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Submit Reports** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 🎯 **Quick Test Scenarios**

### **Scenario 1: Student Reports Issue**
1. **Login**: Block A → Room 101 → Digital Key: `ALICE101`
2. **Action**: Submit maintenance ticket
3. **Expected**: Ticket created, visible in dashboard

### **Scenario 2: Operator Assigns Technician**
1. **Login**: `operator@biust.ac.bw` / `oper123`
2. **Action**: View open tickets, assign to technician
3. **Expected**: Ticket updated, technician notified

### **Scenario 3: Technician Completes Work**
1. **Login**: `technician@biust.ac.bw` / `tech123`
2. **Action**: View assigned jobs, complete work
3. **Expected**: Job card updated, ticket status changed

### **Scenario 4: Coordinator Views Analytics**
1. **Login**: `coordinator@biust.ac.bw` / `coord123`
2. **Action**: View dashboard analytics, manage budget
3. **Expected**: Full system access, financial data visible

### **Scenario 5: Finance Officer Approves Expenses**
1. **Login**: `finance@biust.ac.bw` / `fin123`
2. **Action**: Review expenses, approve/reject
3. **Expected**: Budget management access, financial controls

---

## 📱 **Sample Tickets Available**

| Ticket ID | Title | Priority | Status | Location | Assigned To |
|-----------|-------|----------|---------|----------|-------------|
| TKT-2024-001 | Broken Light Fixture | Medium | Open | Block A, Room 101 | David Technician |
| TKT-2024-002 | Leaking Bathroom Faucet | High | In Progress | Block A, Room 102 | James Plumber |
| TKT-2024-003 | Broken Window Lock | Critical | Completed | Block A, Room 103 | Peter Carpenter |
| TKT-2024-004 | AC Not Working | High | Open | Block B, Room 201 | Unassigned |
| TKT-2024-005 | Water Leak in Ceiling | Critical | In Progress | Block C, Room 302 | James Plumber |
| TKT-2024-006 | Broken Door Handle | Medium | Open | Block D, Room 401 | Unassigned |

---

## 🔧 **Technical Notes**

### **Mock Data Location**
- **File**: `src/app/services/mockData.ts`
- **Purpose**: Single file containing all sample data
- **Replacement**: Delete this file and create real API service for production

### **Authentication Flow**
1. **Public Login**: Block + Room + Digital Key → JWT Token
2. **Private Login**: Email + Password → JWT Token
3. **Token Storage**: localStorage
4. **Role Verification**: JWT payload contains user role

### **Data Persistence**
- **Zustand Store**: Client-side state management
- **Mock API**: Simulates backend with delays
- **Local Storage**: Persistent user sessions

---

## 🚀 **Getting Started**

1. **Start Application**: `npm run dev`
2. **Access URL**: http://localhost:5175/
3. **Choose Login Type**: Public (Resident) or Private (Staff)
4. **Use Credentials**: Select from the tables above
5. **Explore Features**: Test role-specific functionality

---

## 📞 **Support**

For technical support or questions about the login system:
- **Email**: it.BSMsupport@biust.ac.bw
- **Documentation**: Check `README-FRONTEND-ONLY.md`
- **Mock Data**: All credentials in `src/app/services/mockData.ts`

---

**🎉 Happy Testing!** 

All login credentials are functional and provide access to the complete BIUST Smart Maintenance System features according to role-based permissions.
