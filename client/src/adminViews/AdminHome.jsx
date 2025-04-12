import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import UserManagementPopup from "../components/UserManagementPopup";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

const AdminHome = () => {
    const [users, setUsers] = useState([]);
    const [popupType, setPopupType] = useState(null); // "add" or "delete"
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await ApiService.fetchAllUsers();
                setUsers(response.users);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchUsers();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await ApiService.approveUser(userId);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.user_id === userId ? { ...user, is_approved: true } : user
                )
            );
        } catch (error) {
            console.error("Failed to approve user:", error);
        }
    };

    const openPopup = (type) => {
        setPopupType(type);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <div className="admin-actions">
                    <button onClick={() => openPopup("add")}>Add</button>
                    <button onClick={() => openPopup("delete")}>Delete</button>
                </div>
                <h1>Users</h1>
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user.user_id} className="user-item">
                            <span>{user.name} ({user.email})</span>
                            <span>
                                {user.is_approved ? (
                                    "Approved"
                                ) : (
                                    <button onClick={() => handleApprove(user.user_id)}>
                                        Approve
                                    </button>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            {showPopup && (
                <UserManagementPopup
                    type={popupType}
                    onClose={closePopup}
                    refreshUsers={() => {
                        // Re-fetch users after adding/deleting
                        ApiService.fetchAllUsers().then((response) => setUsers(response.users));
                    }}
                />
            )}
        </div>
    );
};

export default AdminHome;