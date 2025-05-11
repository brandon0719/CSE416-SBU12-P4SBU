import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import UserManagementPopup from "../components/UserManagementPopup";
// Change CSS import to new file
import "../stylesheets/AdminHomeUnique.css";

const AdminHome = () => {
    const [users, setUsers] = useState([]);
    const [sortedUsers, setSortedUsers] = useState([]);
    const [sortCriteria, setSortCriteria] = useState("default");
    const [popupType, setPopupType] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await ApiService.fetchAllUsers();
                setUsers(response.users);
                setSortedUsers(response.users);
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
            sorted = sorted.sort((a, b) => b.is_approved - a.is_approved);
        } else if (criteria === "unapproved") {
            sorted = sorted.sort((a, b) => a.is_approved - b.is_approved);
        } else if (criteria === "alphabetical") {
            sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        setSortedUsers(sorted);
    };

    const openProfileModal = (user) => {
        setProfileData({ ...user });
        setShowProfileModal(true);
    };

    const closeProfileModal = () => {
        setShowProfileModal(false);
        setProfileData(null);
        setErrorMessage("");
    };

    const handleProfileChange = (field, value) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(""), 3000);
    };

    const handleSaveProfile = async () => {
        try {
            if (!profileData.name.trim()) return showError("Name is required.");
            if (!/^[0-9]{9}$/.test(profileData.sbu_id))
                return showError("SBU ID must be 9 digits.");
            if (!profileData.user_type) return showError("User type is required.");

            const updateData = {
                userId: profileData.user_id,
                name: profileData.name,
                sbuId: profileData.sbu_id,
                address: profileData.address,
                userType: profileData.user_type,
                permitNumber: profileData.permit_number,
                carModel: profileData.car_model,
                licensePlate: profileData.license_plate,
            };
            await ApiService.updateProfile(updateData);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.user_id === profileData.user_id ? profileData : user
                )
            );
            alert("Profile updated successfully!");
            closeProfileModal();
        } catch (error) {
            setErrorMessage("Failed to update profile: " + (error.message || ""));
        }
    };

    return (
        <div className="admin-home-container">
            <Header />
            <AdminNav />
            <div className="admin-home-content">
                <div className="admin-home-header">
                    <div className="admin-home-header-actions">
                        <div className="admin-home-sorting-options">
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
                        <button className="admin-home-approve-button" onClick={() => openPopup("add")}>
                            Add New User
                        </button>
                    </div>
                </div>
                <div className="admin-home-user-list-container">
                    <ul className="admin-home-user-list">
                        {sortedUsers.map((user) => (
                            <li key={user.user_id} className="admin-home-user-item">
                                <span>
                                    <strong>
                                        {user.name} {" "}
                                    </strong>
                                     - {user.email}
                                </span>
                                <div className="actions">
                                    {user.is_approved ? (
                                        <span className="admin-home-approved">Approved User</span>
                                    ) : (
                                        <button
                                            className="admin-home-approve-button"
                                            onClick={() => handleApprove(user.user_id)}
                                        >
                                            Approve User
                                        </button>
                                    )}
                                    <button
                                        className="admin-home-view-button"
                                        onClick={() => openProfileModal(user)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="admin-home-delete-button"
                                        onClick={() => openPopup("delete", user)}
                                    >
                                        Delete User
                                    </button>
                                </div>
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
            {showProfileModal && profileData && (
                <div className="admin-home-popup">
                    <h2>Edit Profile</h2>
                    <div className="admin-home-profile-section">
                        <label>Name:</label>
                        <input
                            value={profileData.name}
                            onChange={(e) => handleProfileChange("name", e.target.value)}
                        />
                    </div>
                    <div className="admin-home-profile-section">
                        <label>Email:</label>
                        <input
                            value={profileData.email}
                            onChange={(e) => handleProfileChange("email", e.target.value)}
                        />
                    </div>
                    <div className="admin-home-profile-section">
                        <label>SBU ID:</label>
                        <input
                            value={profileData.sbu_id || ""}
                            onChange={(e) => handleProfileChange("sbu_id", e.target.value)}
                        />
                    </div>
                    <div className="admin-home-profile-section">
                        <label>Address:</label>
                        <input
                            value={profileData.address || ""}
                            onChange={(e) => handleProfileChange("address", e.target.value)}
                        />
                    </div>
                    <div className="admin-home-profile-section">
                        <label>User Type:</label>
                        <select
                            value={profileData.user_type || ""}
                            onChange={(e) => handleProfileChange("user_type", e.target.value)}
                        >
                            <option value="">Select User Type</option>
                            <option value="Commuter">Commuter</option>
                            <option value="Resident">Resident</option>
                            <option value="Visitor">Visitor</option>
                            <option value="Faculty">Faculty</option>
                        </select>
                    </div>
                    <div className="admin-home-profile-section">
                        <label>Permit Number:</label>
                        <input
                            value={profileData.permit_number || ""}
                            onChange={(e) => handleProfileChange("permit_number", e.target.value)}
                        />
                    </div>
                    <div className="admin-home-profile-section">
                        <label>Car Model:</label>
                        <input
                            value={profileData.car_model || ""}
                            onChange={(e) => handleProfileChange("car_model", e.target.value)}
                        />
                    </div>
                    <div className="admin-home-profile-section">
                        <label>License Plate:</label>
                        <input
                            value={profileData.license_plate || ""}
                            onChange={(e) => handleProfileChange("license_plate", e.target.value)}
                        />
                    </div>
                    {errorMessage && <div className="admin-home-error-message">{errorMessage}</div>}
                    <div className="admin-home-popup-actions">
                        <button onClick={closeProfileModal}>Cancel</button>
                        <button onClick={handleSaveProfile}>Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHome;