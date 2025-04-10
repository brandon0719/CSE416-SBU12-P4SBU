// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getSessionUser } from "../services/ApiService"; // adjust path as needed
import HomePage from "../views/HomePage";

const ProtectedRoute = ({ children }) => {
    const user = getSessionUser();

    // If no user is found in the cookies, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If the user is not an admin, redirect to the home page
    if (!user.is_admin) {
        return <Navigate to="/homepage" replace />;
    }

    return children;
};

export default ProtectedRoute;
