// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getSessionUser } from "../services/ApiService"; // adjust path as needed

const ProtectedRoute = ({ children }) => {
    const user = getSessionUser();

    // If no user is found in the cookies, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
