import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/ProfilePage.css";
import profileIcon from "../images/default-profile.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Ensure this import is available

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState("");
    const [permitNumber, setPermitNumber] = useState("");
    const [reservations, setReservations] = useState([]);
    const [carModel, setCarModel] = useState("");
    const [licensePlate, setLicensePlate] = useState("");

    // State for toggling the class on profile-page-content
    const [isToggled, setIsToggled] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const sessionUser = ApiService.getSessionUser();
        if (sessionUser) {
            setUser(sessionUser);
            setUserType(sessionUser.user_type || "");
            setPermitNumber(sessionUser.permit_number || "");
            setReservations(sessionUser.reservations || []);
            setCarModel(sessionUser.car_model || "");
            setLicensePlate(sessionUser.license_plate || "");
        }
    }, []);

    // Compute effective toggle:
    // If the profile is not complete (is_profile_complete === false), we never apply the toggle (always visible)
    const effectiveToggle =
        user && user.is_profile_complete ? isToggled : false;

    const handleToggleClass = () => {
        setIsToggled((prev) => !prev);
    };

    const handleSave = async () => {
        const userId = user.user_id;
        // New Data – note we pass the user_id for the API even though backend can also use token data.
        const profileData = {
            userId,
            userType,
            permitNumber,
            carModel,
            licensePlate,
            isProfileComplete: true,
        };
        try {
            const updatedResponse = await ApiService.updateProfile(profileData);
            const updatedUser = updatedResponse.user;

            // Update the user cookie with the new data so that subsequent getSessionUser() calls return new data
            Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });

            navigate("/homepage");
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update profile: " + (error.message || ""));
        }
    };

    const handleCancel = () => {
        // Reset changes as needed.
        alert("Changes canceled.");
    };

    return (
        <div className="profile-page-container">
            <Header />
            <NavBar />
            {/* Conditionally apply toggled-class only if effectiveToggle is true */}
            {/* Disable the toggle button if the profile isn't complete so the content is always visible */}
            <button
                onClick={handleToggleClass}
                disabled={user && !user.is_profile_complete}>
                {isToggled ? "Hide Information" : "Edit Information"}
            </button>
            <div
                className={`profile-page-content ${
                    effectiveToggle ? "toggled-class" : ""
                }`}>
                <h1>Profile Page</h1>
                <div className="profile-section profile-picture-section">
                    <div className="current-profile-picture">
                        <img
                            src={profileIcon} // Default image if none is set
                            alt="Default Profile"
                            className="profile-picture"
                        />
                    </div>
                </div>
                <div className="profile-section">
                    <label>User Type:</label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}>
                        <option value="">Select User Type</option>
                        {/* Use the values that match the database or your validation */}
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
                    <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>License Plate:</label>
                    <input
                        type="text"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                    />
                </div>
                {/* Uncomment if needed for password functionality */}
                {/* <div className="profile-section">
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
        </div> */}
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
                                Reserved on {res.day} from {res.startTime} to{" "}
                                {res.endTime}
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
