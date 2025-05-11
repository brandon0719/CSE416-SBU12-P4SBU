// client/src/adminViews/AdminHome.jsx

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import UserManagementPopup from "../components/UserManagementPopup";
import SearchBar from "../components/SearchBar";
import "../stylesheets/AdminHomeUnique.css";

const AdminHome = () => {
    const [users, setUsers] = useState([]);
    const [displayList, setDisplayList] = useState([]);
    const [sortCriteria, setSortCriteria] = useState("default");
    const [searchTerm, setSearchTerm] = useState("");

    // popups
    const [popupType, setPopupType] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // 1) Fetch on mount
    useEffect(() => {
        ApiService.fetchAllUsers()
            .then((res) => {
                setUsers(res.users);
            })
            .catch(console.error);
    }, []);

    // 2) Whenever users / searchTerm / sortCriteria change, recalc displayList
    useEffect(() => {
        // filter
        const filtered = users.filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // sort
        let sorted = [...filtered];
        if (sortCriteria === "approved") {
            sorted.sort((a, b) => b.is_approved - a.is_approved);
        } else if (sortCriteria === "unapproved") {
            sorted.sort((a, b) => a.is_approved - b.is_approved);
        } else if (sortCriteria === "alphabetical") {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        setDisplayList(sorted);
    }, [users, searchTerm, sortCriteria]);

    const handleApprove = async (userId) => {
        await ApiService.approveUser(userId);
        setUsers((us) =>
            us.map((u) =>
                u.user_id === userId ? { ...u, is_approved: true } : u
            )
        );
    };

    const openPopup = (type, user = null) => {
        setPopupType(type);
        setSelectedUser(user);
        setShowPopup(true);
    };
    const closePopup = () => setShowPopup(false);

    const openProfileModal = (user) => {
        setProfileData({ ...user });
        setShowProfileModal(true);
    };
    const closeProfileModal = () => {
        setShowProfileModal(false);
        setProfileData(null);
        setErrorMessage("");
    };

    const handleProfileChange = (field, value) =>
        setProfileData((pd) => ({ ...pd, [field]: value }));

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(""), 3000);
    };

    const handleSaveProfile = async () => {
        if (!profileData.name.trim()) return showError("Name required");
        if (!/^[0-9]{9}$/.test(profileData.sbu_id))
            return showError("SBU ID must be 9 digits");
        if (!profileData.user_type) return showError("User type is required");

        await ApiService.updateProfile({
            userId: profileData.user_id,
            name: profileData.name,
            sbuId: profileData.sbu_id,
            address: profileData.address,
            userType: profileData.user_type,
            permitNumber: profileData.permit_number,
            carModel: profileData.car_model,
            licensePlate: profileData.license_plate,
        });
        setUsers((us) =>
            us.map((u) => (u.user_id === profileData.user_id ? profileData : u))
        );
        alert("Profile updated!");
        closeProfileModal();
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
                                onChange={(e) =>
                                    setSortCriteria(e.target.value)
                                }>
                                <option value="default">Default</option>
                                <option value="approved">Approved</option>
                                <option value="unapproved">Unapproved</option>
                                <option value="alphabetical">
                                    Alphabetical
                                </option>
                            </select>
                        </div>
                        <button
                            className="admin-home-approve-button"
                            onClick={() => openPopup("add")}>
                            Add New User
                        </button>
                    </div>
                </div>

                {/* --- Search Bar --- */}
                <SearchBar
                    placeholder="Search users by name…"
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                {/* --- User List --- */}
                <div className="admin-home-user-list-container">
                    <ul className="admin-home-user-list">
                        {displayList.map((u) => (
                            <li
                                key={u.user_id}
                                className="admin-home-user-item">
                                <span>
                                    <strong>{u.name}</strong> – {u.email}
                                </span>
                                <div className="actions">
                                    {u.is_approved ? (
                                        <span className="admin-home-approved">
                                            Approved User
                                        </span>
                                    ) : (
                                        <button
                                            className="admin-home-approve-button"
                                            onClick={() =>
                                                handleApprove(u.user_id)
                                            }>
                                            Approve
                                        </button>
                                    )}
                                    <button
                                        className="admin-home-view-button"
                                        onClick={() => openProfileModal(u)}>
                                        View
                                    </button>
                                    <button
                                        className="admin-home-delete-button"
                                        onClick={() => openPopup("delete", u)}>
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* --- Add/Delete Popup --- */}
            {showPopup && (
                <UserManagementPopup
                    type={popupType}
                    user={selectedUser}
                    onClose={closePopup}
                    refreshUsers={() => {
                        ApiService.fetchAllUsers().then((r) =>
                            setUsers(r.users)
                        );
                    }}
                />
            )}

            {/* --- Profile Modal --- */}
            {showProfileModal && profileData && (
                <div className="admin-home-popup">
                    <h2>Edit Profile</h2>
                    {[
                        "name",
                        "email",
                        "sbu_id",
                        "address",
                        "user_type",
                        "permit_number",
                        "car_model",
                        "license_plate",
                    ].map((field) => (
                        <div key={field} className="admin-home-profile-section">
                            <label>{field.replace(/_/g, " ")}:</label>
                            {field === "user_type" ? (
                                <select
                                    value={profileData.user_type || ""}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            "user_type",
                                            e.target.value
                                        )
                                    }>
                                    <option value="">Select User Type</option>
                                    <option value="Commuter">Commuter</option>
                                    <option value="Resident">Resident</option>
                                    <option value="Visitor">Visitor</option>
                                    <option value="Faculty">Faculty</option>
                                </select>
                            ) : (
                                <input
                                    value={profileData[field] || ""}
                                    onChange={(e) =>
                                        handleProfileChange(
                                            field,
                                            e.target.value
                                        )
                                    }
                                />
                            )}
                        </div>
                    ))}
                    {errorMessage && (
                        <div className="admin-home-error-message">
                            {errorMessage}
                        </div>
                    )}
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