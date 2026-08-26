import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { AdminLogin } from './pages/auth/AdminLogin';
import { Register } from './pages/auth/Register';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { ManageBooks } from './pages/admin/ManageBooks';
import { ManageUsers } from './pages/admin/ManageUsers';
import { Transactions } from './pages/admin/Transactions';
import { ManageFines } from './pages/admin/ManageFines';
import { BrowseBooks } from './pages/user/BrowseBooks';
import { MyBooks } from './pages/user/MyBooks';
import { MyFines } from './pages/user/MyFines';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};



function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/books" 
        element={
          <ProtectedRoute>
            <BrowseBooks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-books" 
        element={
          <ProtectedRoute>
            <MyBooks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fines" 
        element={
          <ProtectedRoute>
            <MyFines />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/books" 
        element={
          <ProtectedRoute requireAdmin>
            <ManageBooks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requireAdmin>
            <ManageUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/transactions" 
        element={
          <ProtectedRoute requireAdmin>
            <Transactions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/fines" 
        element={
          <ProtectedRoute requireAdmin>
            <ManageFines />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
