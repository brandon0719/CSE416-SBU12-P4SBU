import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import UserManagementPopup from "../components/UserManagementPopup";
import "../stylesheets/AdminHome.css";

const AdminHome = () => {
    const [users, setUsers] = useState([]);
    const [popupType, setPopupType] = useState(null); // "add" or "delete"
    const [selectedUser, setSelectedUser] = useState(null);
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

    const openPopup = (type, user = null) => {
        setPopupType(type);
        setSelectedUser(user);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupType(null);
        setSelectedUser(null);
    };

    const refreshUsers = async () => {
        try {
            const response = await ApiService.fetchAllUsers();
            setUsers(response.users);
        } catch (error) {
            console.error("Failed to refresh users:", error);
        }
    };

    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <div className="admin-header">
                    <h1>Users</h1>
                    <button onClick={() => openPopup("add")}>Add</button>
                </div>
                <div className="user-list-container">
                    <ul className="user-list">
                        {users.map((user) => (
                            <li key={user.user_id} className="user-item">
                                <span>{user.name} ({user.email})</span>
                                <span>
                                    {user.is_approved ? (
                                        "Approved"
                                    ) : (
                                        <button className="approve-button" onClick={() => handleApprove(user.user_id)}>
                                            Approve
                                        </button>
                                    )}
                                    <button
                                        className="delete-button"
                                        onClick={() => openPopup("delete", user)}
                                    >
                                        Delete
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {showPopup && (
                <UserManagementPopup
                    type={popupType}
                    user={selectedUser}
                    onClose={closePopup}
                    refreshUsers={refreshUsers}
                />
            )}
        </div>
    );
};

export default AdminHome;