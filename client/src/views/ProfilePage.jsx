import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/ProfilePage.css";
import profileIcon from "../images/default-profile.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Ensure this import is available

const ProfilePage = () => {
    // Existing state variables
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [sbuId, setSbuId] = useState("");
    const [address, setAddress] = useState("");
    const [userType, setUserType] = useState("");
    const [permitNumber, setPermitNumber] = useState("");
    const [carModel, setCarModel] = useState("");
    const [licensePlate, setLicensePlate] = useState("");

    // State for Reservation data
    const [reservations, setReservations] = useState([]);
    const [currentReservations, setCurrentReservations] = useState([]);
    const [pastReservations, setPastReservations] = useState([]);

    // New state for toggling editing content
    const [isToggled, setIsToggled] = useState(false);
    // New state for error messages
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const sessionUser = ApiService.getSessionUser();
        if (sessionUser) {
            setUser(sessionUser);
            setName(sessionUser.name || "");
            setSbuId(sessionUser.sbu_id || "");
            setAddress(sessionUser.address || "");
            setUserType(sessionUser.user_type || "");
            setPermitNumber(sessionUser.permit_number || "");
            setReservations(sessionUser.reservations || []);
            setCarModel(sessionUser.car_model || "");
            setLicensePlate(sessionUser.license_plate || "");
        }

        // After setting the user, fetch reservations for that user.
        ApiService.getUserReservations(sessionUser.user_id)
            .then((resData) => {
                setCurrentReservations(resData.currentReservations);
                setPastReservations(resData.pastReservations);
            })
            .catch((err) => console.error(err));
    }, []);

    // Compute effective toggle:
    // If profile isn't complete (is_profile_complete is false), we never apply the toggle (i.e. always visible)
    const effectiveToggle =
        user && user.is_profile_complete ? isToggled : false;

    const handleToggleClass = () => {
        setIsToggled((prev) => !prev);
    };

    // Utility function to show error message and then clear it after 3 seconds
    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => {
            setErrorMessage("");
        }, 3000); // 3000 ms = 3 seconds
    };

    const handleSave = async () => {
        // Client-side validations
        if (!name.trim()) {
            showError("Name is required.");
            return;
        }
        if (!sbuId.trim()) {
            showError("SBU ID is required.");
            return;
        }
        if (!address.trim()) {
            showError("Address is required.");
            return;
        }
        if (!userType) {
            showError("User type is required.");
            return;
        }
        if (!permitNumber.trim()) {
            showError("Permit number is required.");
            return;
        }
        if (!carModel.trim()) {
            showError("Car model is required.");
            return;
        }
        if (!licensePlate.trim()) {
            showError("License plate is required.");
            return;
        }
        // Regex validations (example patterns)
        const nameRegex = /^[A-Za-z\s.'-]{2,40}$/;
        if (!nameRegex.test(name)) {
            showError(
                "Please enter a valid name (2-40 letters, spaces and .'- allowed)."
            );
            return;
        }
        const addressRegex = /^[A-Za-z0-9\s,.'\-#]{5,100}$/;
        if (!addressRegex.test(address)) {
            showError(
                "Please enter a valid address (5-100 characters, allow numbers, letters, spaces and ,.'-#)."
            );
            return;
        }

        const licensePlateRegex = /^[A-Z0-9\-]{1,10}$/;
        if (!licensePlateRegex.test(licensePlate)) {
            showError(
                "License plate must be uppercase and may contain digits and hyphens (max 10 characters)."
            );
            return;
        }

        const sbuIdRegex = /^[0-9]{9}$/;
        if (!sbuIdRegex.test(sbuId)) {
            showError(
                "SBU ID must be 9 numbers."
            );
            return;
        }
        // Additional regex validations for SBU ID or license plate can be added here, as needed

        // New profile data to send to API
        const userId = user.user_id;
        const profileData = {
            userId,
            name,
            sbuId,
            address,
            userType,
            permitNumber,
            carModel,
            licensePlate,
            isProfileComplete: true,
        };

        try {
            const updatedResponse = await ApiService.updateProfile(profileData);
            const updatedUser = updatedResponse.user;

            // Update cookie with new user data
            Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });

            navigate("/homepage");
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            showError("Failed to update profile: " + (error.message || ""));
        }
    };

    const handleCancel = () => {
        // Reset fields to original values
        if (user) {
            setName(user.name || "");
            setSbuId(user.sbu_id || "");
            setAddress(user.address || "");
            setUserType(user.user_type || "");
            setPermitNumber(user.permit_number || "");
            setReservations(user.reservations || []);
            setCarModel(user.car_model || "");
            setLicensePlate(user.license_plate || "");
        }
        setIsToggled(true);
    };

    function capitalizeWords(str) {
        return str
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    return (
        <div className="profile-page-container">
            <Header />
            <NavBar />

            {/* User Information Section */}
            <div className="user-info">
                <h2>{user ? capitalizeWords(user.name) : "N/A"}</h2>
                <p>
                    <strong>SBU ID:</strong> {user ? user.sbu_id : "N/A"}
                </p>
                <p>
                    <strong>Address:</strong> {user ? user.address : "N/A"}
                </p>
            </div>

            {/* Toggle Edit Button */}
            <button
                onClick={handleToggleClass}
                disabled={user && !user.is_profile_complete}
                className="edit-information-btn">
                {isToggled ? "Edit Information" : "Hide Information"}
            </button>

            {/* Profile Edit Section */}
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
                        <h2>{user ? capitalizeWords(user.name) : "N/A"}</h2>
                    </div>
                </div>
                {/* Additional Fields */}
                <div className="profile-section">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>SBU ID:</label>
                    <input
                        type="text"
                        value={sbuId}
                        onChange={(e) => setSbuId(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>Address:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                {/* Existing Profile Fields */}
                <div className="profile-section">
                    <label>User Type:</label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}>
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
                {/* Display error message if exists */}
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                <div className="action-buttons">
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
            {/* Reservations Section */}
            <div className="reservations-section">
                <h2>Current Reservations</h2>
                {currentReservations.length > 0 ? (
                    <ul>
                        {currentReservations.map((res, index) => (
                            <li key={res.reservation_id}>
                                <strong>Lot:</strong> {res.lot_name} |{" "}
                                <strong>Start:</strong>{" "}
                                {new Date(res.start_time).toLocaleString()} |{" "}
                                <strong>End:</strong>{" "}
                                {new Date(res.end_time).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No current reservations.</p>
                )}
                <h2>Past Reservations</h2>
                {pastReservations.length > 0 ? (
                    <ul>
                        {pastReservations.map((res, index) => (
                            <li key={res.reservation_id}>
                                <strong>Lot:</strong> {res.lot_name} |{" "}
                                <strong>Start:</strong>{" "}
                                {new Date(res.start_time).toLocaleString()} |{" "}
                                <strong>End:</strong>{" "}
                                {new Date(res.end_time).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No past reservations.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;