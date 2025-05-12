import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import "./App.css"; // Import the CSS file

// General components
import Login from "./views/Login";
import Register from "./views/Register";

// User components
import HomePage from "./views/HomePage";
import TicketPage from "./views/TicketPage";
import AboutUsPage from "./views/AboutUsPage";
import ProfilePage from "./views/ProfilePage";
import MessagePage from "./views/MessagePage";
import ContactUsPage from "./views/ContactUsPage";
import ReservationPage from "./views/ReservationPage";

// Admin components
import AdminHome from "./adminViews/AdminHome"; 
import AdminTickets from "./adminViews/AdminTickets";
import AdminParking from "./adminViews/AdminParking";
import AdminData from "./adminViews/AdminData";
import AdminReservations from "./adminViews/AdminReservations";

// Route protection components
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"; 

// Stripe components
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
    return (
        <Elements stripe={stripePromise}>
            <Routes>
                {/* When someone visits '/', redirect them to '/login' */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/homepage"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ticketpage"
                    element={
                        <ProtectedRoute>
                            <TicketPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/aboutuspage"
                    element={
                        <ProtectedRoute>
                            <AboutUsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profilepage"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/myreservations"
                    element={
                        <ProtectedRoute>
                            <ReservationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/messagepage"
                    element={
                        <ProtectedRoute>
                            <MessagePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/contactuspage"
                    element={
                        <ProtectedRoute>
                            <ContactUsPage />
                        </ProtectedRoute>
                    }
                />

                {/* split between user and admin navigation */}

                <Route
                    path="/users"
                    element={
                        <ProtectedAdminRoute>
                            <AdminHome />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/tickets"
                    element={
                        <ProtectedAdminRoute>
                            <AdminTickets />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/parking"
                    element={
                        <ProtectedAdminRoute>
                            <AdminParking />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/data-analysis"
                    element={
                        <ProtectedAdminRoute>
                            <AdminData />
                        </ProtectedAdminRoute>
                    }
                />
                <Route
                    path="/reservations"
                    element={
                        <ProtectedAdminRoute>
                            <AdminReservations />
                        </ProtectedAdminRoute>
                    }
                />
            </Routes>
        </Elements>
    );
}

export default App;
