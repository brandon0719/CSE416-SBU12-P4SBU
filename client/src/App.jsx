import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

// Page components
import Login from "./views/Login";
import Register from "./views/Register";
import Dashboard from "./views/Dashboard";

// Protected route wrapper
import ProtectedRoute from "./views/ProtectedRoute";

function App() {
    return (
        <Routes>
            {/* When someone visits '/', redirect them to '/login' */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Route */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;
