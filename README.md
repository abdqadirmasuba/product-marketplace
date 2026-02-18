# Product Marketplace - Role-Based Product Management System

A full-stack web application for managing products with role-based access control, approval workflows, and an AI-powered chatbot assistant.

## 📋 Table of Contents
- [What I Implemented](#what-i-implemented)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Key Features](#key-features)
- [Setup Instructions](#setup-instructions)
- [How to Run the Project](#how-to-run-the-project)
- [Demo Accounts](#demo-accounts)
- [Tech Decisions & Assumptions](#tech-decisions--assumptions)
- [Known Limitations](#known-limitations)
- [Project Structure](#project-structure)

---

## 🎯 What I Implemented

### ✅ Completed Features

#### Backend (Django REST Framework)
- **Authentication & Authorization**
  - JWT authentication with HttpOnly cookies
  - Custom user model with role-based permissions
  - Token refresh mechanism with automatic rotation and blacklisting
  - Secure logout with token cleanup

- **User Management (Admin Only)**
  - Create, read, update, and delete users within a business
  - Role assignment (Admin, Approver, Editor, Viewer)
  - Role hierarchy enforcement
  - User activation/deactivation

- **Product Management**
  - CRUD operations with role-based access control
  - Product status workflow: Draft → Pending Approval → Approved
  - Submit, approve, and reject actions
  - Only approved products visible on public endpoints
  - Business scoping (users only see products in their business)

- **Public API**
  - Unauthenticated access to approved products
  - Search and price filtering capabilities

#### Frontend (Next.js + React)
- **Authentication Flow**
  - Login page with demo account quick-fill buttons
  - Protected routes with AuthGuard component
  - Guest-only routes (login redirects authenticated users)
  - Automatic token refresh on 401 responses
  - Silent authentication check on app load

- **Dashboard**
  - Stats overview (total, approved, pending, draft products)
  - Recent products list
  - Role permissions summary
  - Quick action links

- **Product Management (Internal)**
  - Full product listing with status filters and search
  - Inline workflow actions (submit, approve, reject, delete)
  - Create and edit product forms
  - Product detail view with audit trail
  - Role-aware UI (buttons shown/hidden based on permissions)

- **User Management (Admin Only)**
  - User table with role management
  - Create user modal with validation
  - Inline role editing via dropdown
  - User activation toggle and deletion

- **Public Store**
  - Product browsing without authentication
  - Search by name
  - Price range filtering (min/max)
  - Product detail pages

- **UI/UX Features**
  - Dark/Light/System theme switching
  - Responsive mobile-first design
  - Toast notifications for actions
  - Loading states and error handling
  - Smooth animations and transitions

#### AI Chatbot (Partial Implementation)
- Backend endpoints created (`/api/chat/`)
- Database models for chat history
- OpenAI integration setup
- Frontend chat widget component designed
- **Status**: Structure complete, but encountering integration issues with OpenAI API calls

---

## 🛠 Tech Stack & Architecture

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Authentication**: djangorestframework-simplejwt (JWT in HttpOnly cookies)
- **Database**: SQLite (for simplicity and portability)
- **API Documentation**: RESTful API design
- **CORS**: django-cors-headers for cross-origin requests

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (pure utility classes)
- **State Management**: Redux Toolkit + Redux Persist
- **HTTP Client**: Axios (with interceptors)
- **Icons**: lucide-react
- **Theming**: next-themes

### Design Philosophy
- **Security-first**: HttpOnly cookies prevent XSS token theft
- **Type-safe**: Full TypeScript coverage
- **Responsive**: Mobile-first Tailwind approach
- **Accessible**: Semantic HTML and ARIA labels
- **DRY**: Reusable components and API services

---

## 🌟 Key Features

### Role Hierarchy
The system implements a strict role hierarchy where higher roles inherit all permissions from lower roles:

| Role | Create/Edit | Submit | Approve/Reject | Delete | Manage Users |
|------|:-----------:|:------:|:--------------:|:------:|:------------:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Approver** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Editor** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Viewer** | ❌ | ❌ | ❌ | ❌ | ❌ |

### Product Workflow
```
DRAFT → (submit) → PENDING_APPROVAL → (approve) → APPROVED
                                    ↘ (reject)  → DRAFT
```
- Only **approved** products are visible to the public
- Approved products are **locked** from editing (preserves audit trail)

---

## 📦 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
   cd backend
```

2. **Create and activate virtual environment**
```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
```

3. **Install dependencies**
```bash
   pip install -r requirements.txt
```

4. **Create environment file**
   
   Create a `.env` file in the `backend` directory:
```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   
   # Optional: For AI chatbot (if you want to test it)
   OPENAI_API_KEY=sk-proj-your-key-here
```

5. **Run migrations**
```bash
   python manage.py makemigrations
   python manage.py migrate
```

6. **Seed demo data**
```bash
   python seed.py
```
   
   This creates:
   - **Business**: Acme Corp
   - **Users**: 4 demo users (one per role)
   - **Products**: 3 sample products in different statuses

### Frontend Setup

1. **Navigate to frontend directory**
```bash
   cd frontend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Create environment file**
   
   Create a `.env.local` file in the `frontend` directory:
```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 How to Run the Project

### 1. Start the Backend (Port 8000)
```bash
cd backend
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**Backend is now running!** ✅

### 2. Start the Frontend (Port 3000)

In a **new terminal window**:
```bash
cd frontend
npm run dev
```

You should see:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
```

**Frontend is now running!** ✅

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be redirected to the public product store. Click **"Sign In"** to access the dashboard.

---

## 👥 Demo Accounts

After running `seed.py`, these demo accounts are available:

| Email | Password | Role | Capabilities |
|-------|----------|------|--------------|
| `admin@acme.com` | `password123` | **Admin** | Full access - manage users, approve, edit, delete |
| `approver@acme.com` | `password123` | **Approver** | Create/edit products + approve/reject |
| `editor@acme.com` | `password123` | **Editor** | Create/edit products + submit for approval |
| `viewer@acme.com` | `password123` | **Viewer** | Read-only access to internal product list |

**💡 Quick Login Tip**: On the login page, click any of the demo account buttons to auto-fill credentials!

---

## 🤔 Tech Decisions & Assumptions

### Authentication Strategy
**Decision**: Store JWT tokens in HttpOnly cookies instead of localStorage

**Rationale**:
- **Security**: HttpOnly cookies are inaccessible to JavaScript, preventing XSS attacks
- **Automatic transmission**: Cookies are sent with every request automatically
- **Token rotation**: Implemented refresh token rotation with blacklisting for enhanced security

### Single Business Assumption
**Assumption**: The system is designed for **one business** per deployment

**Rationale**:
- Simplifies the initial implementation
- Meets the take-home assignment requirements
- Reduces complexity in user management and product filtering

**Future Enhancement**: The data model supports multiple businesses - only minor changes needed:
- Add business selection on user creation
- Filter products by selected business in admin panel
- Add business switcher for super-admins

### Database Choice
**Decision**: SQLite for development

**Rationale**:
- **Portability**: No separate database server required
- **Simplicity**: Zero configuration needed
- **Perfect for demo**: Easy to reset and re-seed

**Production Note**: For production deployment, migrate to PostgreSQL (minimal code changes required).

### No Image Upload
**Decision**: Products do not support image uploads

**Rationale**:
- Focus on core functionality (roles, permissions, workflow)
- Reduces complexity in storage and file handling
- Can be added as a future enhancement using Django's `ImageField` and a storage backend

### Frontend State Management
**Decision**: Redux Toolkit + Redux Persist

**Rationale**:
- **Predictable state**: Centralized auth state management
- **Persistence**: User data persists across browser refreshes
- **DevTools**: Excellent debugging experience
- **Scalability**: Easy to add more slices as app grows

---

## ⚠️ Known Limitations

### 1. AI Chatbot (Partial Implementation)
**Status**: Backend structure complete, frontend UI designed, but OpenAI integration has unresolved issues

**What's Done**:
- ✅ Database models (`ChatMessage`)
- ✅ API endpoints (`/api/chat/`, `/api/chat/history/`)
- ✅ Chat widget UI component
- ✅ Message persistence logic

**What's Pending**:
- ❌ OpenAI API integration causing connection errors
- ❌ Product context not being sent correctly

**Workaround**: All code is present and can be debugged/fixed with more time. The architecture is sound.

### 2. File Uploads
**Limitation**: Products do not support image uploads

**Impact**: Products are represented with placeholder icons

**Future Fix**: Add `ImageField` to `Product` model and integrate with cloud storage (AWS S3, Cloudinary, etc.)

### 3. Email Notifications
**Limitation**: No email notifications for workflow events (e.g., product approval)

**Impact**: Users must manually check product status

**Future Fix**: Integrate Django email backend with Celery for async email sending

### 4. Pagination
**Limitation**: Product and user lists load all records at once

**Impact**: Performance may degrade with 1000+ records

**Future Fix**: Add DRF's `PageNumberPagination` to list endpoints

### 5. Search Optimization
**Limitation**: Product search uses basic `LIKE` queries

**Impact**: Not optimized for large datasets

**Future Fix**: Implement full-text search with PostgreSQL or Elasticsearch

### 6. Mobile Sidebar
**Limitation**: Sidebar is always visible on desktop, no mobile hamburger menu

**Impact**: Sidebar overlaps content on small screens

**Future Fix**: Add responsive sidebar toggle for mobile devices

---

## 📁 Project Structure
```
product-marketplace/
├── backend/
│   ├── core/                    # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                   # Auth, Business, User models
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── permissions.py
│   │   ├── authentication.py   # Cookie JWT auth
│   │   ├── views/
│   │   │   ├── auth_views.py   # Login, logout, refresh
│   │   │   └── user_views.py   # User CRUD (Admin)
│   │   ├── urls/
│   │   └── admin.py
│   ├── products/                # Product models + API
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py            # Internal CRUD + workflow
│   │   ├── public_views.py     # Public API
│   │   ├── urls.py
│   │   ├── public_urls.py
│   │   └── admin.py
│   ├── chat/                    # AI chatbot (partial)
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── manage.py
│   ├── seed.py                  # Demo data seeder
│   ├── requirements.txt
│   ├── .env                     # Environment variables
│   └── db.sqlite3               # SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── redux.ts
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance + interceptor
│   │   │   └── services.ts      # API functions
│   │   ├── store/
│   │   │   ├── index.ts         # Redux store config
│   │   │   └── slices/
│   │   │       └── authSlice.ts
│   │   └── types/
│   │       └── index.ts
│
├── .gitignore
└── README.md
```

---

## 🧪 Testing the Application

### 1. Test Public Store (No Auth Required)
- Navigate to `http://localhost:3000/products`
- ✅ Should see approved products only
- ✅ Search and filter by price should work
- ✅ Click a product to view details

### 2. Test Authentication
- Click **"Sign In"** button
- Click any demo account button (e.g., "Admin")
- ✅ Should auto-fill email and password
- ✅ Click "Sign in" to log in
- ✅ Should redirect to dashboard

### 3. Test Dashboard (All Roles)
- ✅ Should see stats cards with product counts
- ✅ Should see recent products list
- ✅ Should see role permission summary
- ✅ Quick action links should work

### 4. Test Product Management

**As Editor** (`editor@acme.com`):
- ✅ Click "New Product" to create a draft
- ✅ Submit draft for approval
- ❌ Should NOT see "Approve" button (Editor can't approve)

**As Approver** (`approver@acme.com`):
- ✅ Should see "Approve" and "Reject" buttons on pending products
- ✅ Approve a pending product
- ✅ Product should move to "Approved" status

**As Admin** (`admin@acme.com`):
- ✅ Should see "Delete" button on all products
- ✅ Should see "Users" link in sidebar
- ✅ Delete button should work

**As Viewer** (`viewer@acme.com`):
- ✅ Should see all products but NO action buttons
- ❌ Should NOT see "New Product" button
- ❌ Should NOT see "Users" link in sidebar

### 5. Test User Management (Admin Only)
- Log in as `admin@acme.com`
- Click **"Users"** in sidebar
- ✅ Should see user table with 4 demo users
- ✅ Click "Add User" to create a new user
- ✅ Change a user's role via dropdown
- ✅ Toggle user active status
- ✅ Delete a user (not yourself)

### 6. Test Theme Switching
- ✅ Toggle between Light, System, and Dark themes in sidebar
- ✅ Theme should persist on page refresh

---

## 🎓 What I Learned

This project was an excellent opportunity to:
- Implement **complex role-based access control** with hierarchical permissions
- Build a **secure authentication system** using HttpOnly cookies
- Create a **complete approval workflow** with state transitions
- Design a **responsive, accessible UI** with Tailwind CSS
- Work with **Redux** for global state management
- Implement **automatic token refresh** with Axios interceptors
- Structure a **full-stack TypeScript application** with proper separation of concerns

---

## 🚧 Future Enhancements

If I had more time, I would add:
1. ✨ **Complete AI chatbot** - Fix OpenAI integration issues
2. 📸 **Product images** - Add image upload and display
3. 📧 **Email notifications** - Notify users of workflow events
4. 📄 **Pagination** - Add pagination to all list views
5. 🔍 **Advanced search** - Full-text search with filters
6. 📱 **Mobile sidebar** - Hamburger menu for mobile devices
7. 📊 **Analytics dashboard** - Charts for product metrics
8. 🌍 **Multi-business support** - Allow switching between businesses
9. 🔐 **2FA** - Two-factor authentication for admins
10. 🧪 **Unit tests** - Test coverage for critical paths

---

## 📝 Final Notes

This project demonstrates my ability to:
- ✅ Design and implement RESTful APIs with Django REST Framework
- ✅ Build modern, responsive UIs with Next.js and Tailwind CSS
- ✅ Implement secure authentication with JWT and HttpOnly cookies
- ✅ Work with complex permission systems and role hierarchies
- ✅ Manage state with Redux and persist data properly
- ✅ Structure large codebases with clear separation of concerns
- ✅ Write clean, maintainable, production-ready code

Thank you for reviewing my submission. I'm excited about the opportunity to discuss the technical decisions and architecture choices in more detail!

---

## 📧 Contact

For any questions or clarifications, please reach out via email.

---

**Built with ❤️ using Django + Next.js**