import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import UserManagementPopup from "../components/UserManagementPopup";
import "../stylesheets/AdminHome.css";

const AdminHome = () => {
    const [users, setUsers] = useState([]);
    const [sortedUsers, setSortedUsers] = useState([]); // State for sorted users
    const [sortCriteria, setSortCriteria] = useState("default"); // Sorting criteria
    const [popupType, setPopupType] = useState(null); // "add" or "delete"
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await ApiService.fetchAllUsers();
                setUsers(response.users);
                setSortedUsers(response.users); // Initialize sorted users
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        sortUsers(sortCriteria);
    }, [sortCriteria, users]);

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

    const sortUsers = (criteria) => {
        let sorted = [...users];
        if (criteria === "approved") {
            sorted = sorted.sort((a, b) => b.is_approved - a.is_approved); // Approved first
        } else if (criteria === "unapproved") {
            sorted = sorted.sort((a, b) => a.is_approved - b.is_approved); // Unapproved first
        } else if (criteria === "alphabetical") {
            sorted = sorted.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order
        }
        setSortedUsers(sorted);
    };

    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <div className="admin-header">
                    <div className ="admin-header-actions">
                        <div className="sorting-options">
                            <label htmlFor="sort-criteria">Sort by:</label>
                            <select
                                id="sort-criteria"
                                value={sortCriteria}
                                onChange={(e) => setSortCriteria(e.target.value)}
                            >
                                <option value="default">Default</option>
                                <option value="approved">Approved</option>
                                <option value="unapproved">Unapproved</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>
                        <button className="approve-button" onClick={() => openPopup("add")}>
                            Add New User
                        </button>
                    </div>
                </div>
                <div className="user-list-container">
                    <ul className="user-list">
                        {sortedUsers.map((user) => (
                            <li key={user.user_id} className="user-item">
                                <span>
                                    {user.name} ({user.email})
                                </span>
                                <span>
                                    {user.is_approved ? (
                                        "Approved User"
                                    ) : (
                                        <button
                                            className="approve-button"
                                            onClick={() => handleApprove(user.user_id)}
                                        >
                                            Approve User
                                        </button>
                                    )}
                                    <button
                                        className="delete-button"
                                        onClick={() => openPopup("delete", user)}
                                    >
                                        Delete User
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