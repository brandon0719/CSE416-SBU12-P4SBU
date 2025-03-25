import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

// Page components
import Login from "./views/Login";
import Register from "./views/Register";
import HomePage from "./views/HomePage";
import TicketPage from "./views/TicketPage";
import AboutUsPage from "./views/AboutUsPage";
import ProfilePage from "./views/ProfilePage";
import NotificationPage from "./views/NotificationPage";
import MessagePage from "./views/MessagePage";

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
            <Route path="/homepage" element={<HomePage />}/>
            <Route path="/ticketpage" element={<TicketPage />}/>
            <Route path="/aboutuspage" element={<AboutUsPage />}/>
            <Route path="/profilepage" element={<ProfilePage />}/>
            <Route path="/notificationpage" element={<NotificationPage />}/>
            <Route path="/messagepage" element={<MessagePage />}/>
            
            {/* Protected Route */}
            {/* <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            /> */}
        </Routes>
    );
}

export default App;
