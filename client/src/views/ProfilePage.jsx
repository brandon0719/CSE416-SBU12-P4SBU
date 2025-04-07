import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/ProfilePage.css";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [userType, setUserType] = useState("");
    const [permitNumber, setPermitNumber] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        const sessionUser = ApiService.getSessionUser();
        if (sessionUser) {
            setUser(sessionUser);
            setUserType(sessionUser.userType || "");
            setPermitNumber(sessionUser.permitNumber || "");
            setReservations(sessionUser.reservations || []);
        }
    }, []);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
            setProfilePicture(file);
        } else {
            alert("Only .png or .jpg files are allowed.");
        }
    };

    const handleSave = () => {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        // Save logic here (e.g., call ApiService to update user info)
        alert("Profile updated successfully!");
    };

    const handleCancel = () => {
        // Reset changes
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        alert("Changes canceled.");
    };

    return (
        <div className="profile-page-container">
            <Header />
            <NavBar />
            <div className="profile-page-content">
                <h1>Profile Page</h1>
                <div className="profile-section">
                    <label>Profile Picture:</label>
                    <input type="file" accept=".png, .jpg" onChange={handleProfilePictureChange} />
                </div>
                <div className="profile-section">
                    <label>User Type:</label>
                    <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option value="">Select User Type</option>
                        <option value="Commuter">Commuter</option>
                        <option value="Resident">Resident</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Faculty">Faculty</option>
                    </select>
                </div>
                <div className="profile-section">
                    <label>Permit Number:</label>
                    <input
                        type="text"
                        value={permitNumber}
                        onChange={(e) => setPermitNumber(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>Car Model:</label>
                    <p>{user?.carModel || "Toyota Camry"}</p>
                </div>
                <div className="profile-section">
                    <label>License Plate:</label>
                    <p>{user?.licensePlate || "ABC-1234"}</p>
                </div>
                <div className="profile-section">
                    <label>Change Password:</label>
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                
                <div className="action-buttons">
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
            <div className="reservations-section">
                    <h2>Previous Reservations</h2>
                    <ul>
                        {reservations.length > 0 ? (
                            reservations.map((res, index) => (
                                <li key={index}>
                                    Reserved on {res.day} from {res.startTime} to {res.endTime}
                                </li>
                            ))
                        ) : (
                            <p>No reservations found.</p>
                        )}
                    </ul>
                </div>
        </div>
    );
};

export default ProfilePage;