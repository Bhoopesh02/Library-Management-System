# Library Management System

A full-stack modern Library Management System built with Java Spring Boot (Backend), MongoDB (Database), and Vanilla HTML/CSS/JavaScript (Frontend). 

The UI features a customized Teal/Green theme applied to a sleek dashboard interface, complete with responsive sidebars, charts, and modern design elements.

## Features
* **Authentication**: JWT-based login and registration.
* **Role-Based Access**: 
  * **Admin**: Dashboard charts, full CRUD for Books/Users, manually Issue/Return books, Fines management.
  * **User**: Browse books, view personal checkout history, view personal fines, responsive dashboard.
* **Clean Architecture**: Backend separated into Controllers, Services, Repositories, and Models.
* **Modern UI**: Pure HTML/CSS without bulky frameworks, fully responsive, and includes a Dark/Light mode toggle.

## Technology Stack
* **Frontend**: React 18, Vite, CSS Modules, TanStack Query, Lucide Icons, Recharts.
* **Backend**: Java 17+, Spring Boot 3.2.x, Spring Security (JWT), Spring Data MongoDB.
* **Database**: MongoDB.

## Prerequisites
1. **Java Development Kit (JDK) 17 or higher**
2. **MongoDB** installed and running on `localhost:27017`
3. A static HTTP server for the frontend (e.g., VS Code Live Server, `npx serve`, or Python's `python -m http.server`)

## Setup & Running the Application

### 1. Database (MongoDB)
Ensure MongoDB is running locally. The backend is configured to automatically connect to `mongodb://localhost:27017/library_management`. It will create the database automatically on the first startup.

### 2. Backend (Spring Boot)
Open a terminal in the `backend` directory and run:

```bash
cd backend
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```
*(If on Windows and you don't have Maven installed, use `.\mvnw.cmd` instead).*

The backend REST API will start on `http://localhost:8080`.

**Admin Account Setup:**
For security reasons, admin accounts are no longer hardcoded. To create an admin account:
1. Ensure `app.admin.secret-key` is configured securely in your environment or `application.properties`.
2. Use the `/api/auth/register-admin` endpoint and provide the `adminSecret` that matches this key.

### 3. Frontend (React)
The frontend is a modern React application built with Vite and React Query. 
Open a terminal in the `frontend-react` directory:

```bash
cd frontend-react
npm install
npm run dev
```
Then navigate to `http://localhost:5173` (or the port Vite provides) in your browser.

To build for production:
```bash
npm run build
```

## Testing Checklist
- [x] Register an admin via `/api/auth/register-admin` and login.
- [x] Create a new book from the Admin Dashboard -> Manage Books.
- [x] Create a new User via the registration page (or Admin -> Manage Users).
- [x] Issue the created book to the user.
- [x] Login as the user and verify the book is in "My Books".
- [x] Return the book from the Admin Dashboard.
- [x] Verify Dark Mode functionality.
