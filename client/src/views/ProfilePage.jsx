// client/src/views/ProfilePage.jsx

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/ProfilePage.css";
import profileIcon from "../images/default-profile.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProfilePage = () => {
    // Profile fields & edit toggle
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [sbuId, setSbuId] = useState("");
    const [address, setAddress] = useState("");
    const [userType, setUserType] = useState("");
    const [permitNumber, setPermitNumber] = useState("");
    const [carModel, setCarModel] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [isToggled, setIsToggled] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Reservation data: pending, current (approved), past
    const [pendingReservations, setPendingReservations] = useState([]);
    const [currentReservations, setCurrentReservations] = useState([]);
    const [pastReservations, setPastReservations] = useState([]);

    const navigate = useNavigate();
    const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };

    useEffect(() => {
        const sessionUser = ApiService.getSessionUser();
        if (!sessionUser) return;

        setUser(sessionUser);
        setName(sessionUser.name || "");
        setSbuId(sessionUser.sbu_id || "");
        setAddress(sessionUser.address || "");
        setUserType(sessionUser.user_type || "");
        setPermitNumber(sessionUser.permit_number || "");
        setCarModel(sessionUser.car_model || "");
        setLicensePlate(sessionUser.license_plate || "");
        // Show form if profile not complete
        setIsToggled(!sessionUser.is_profile_complete);

        // 1) Fetch pending first
        ApiService.fetchPendingReservations()
            .then(({ reservations: pending }) => {
                // only keep this user's pending reservations
                const userPending = pending.filter(
                    (r) => r.user_id === sessionUser.user_id
                );
                setPendingReservations(userPending);
                const pendingIds = new Set(
                    userPending.map((r) => r.reservation_id)
                );

                // 2) Now fetch current & past
                return ApiService.getUserReservations(sessionUser.user_id).then(
                    ({ currentReservations, pastReservations }) => {
                        // filter out any current that is still pending
                        const filteredCurrent = currentReservations.filter(
                            (r) => !pendingIds.has(r.reservation_id)
                        );
                        setCurrentReservations(filteredCurrent);
                        setPastReservations(pastReservations);
                    }
                );
            })
            .catch((err) => console.error(err));
    }, []);

    const handleToggleClass = () => {
        setIsToggled((prev) => !prev);
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(""), 3000);
    };

    const handleSave = async () => {
        if (!name.trim()) return showError("Name is required.");
        if (!/^[0-9]{9}$/.test(sbuId))
            return showError("SBU ID must be 9 numbers.");
        if (!address.trim()) return showError("Address is required.");
        if (!userType) return showError("User type is required.");
        if (!permitNumber.trim())
            return showError("Permit number is required.");
        if (!carModel.trim()) return showError("Car model is required.");
        if (!/^[A-Z0-9\\-]{1,10}$/.test(licensePlate))
            return showError("Invalid license plate.");

        const profileData = {
            userId: user.user_id,
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
            Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
            alert("Profile updated successfully!");
            setIsToggled(false);
            navigate("/homepage");
        } catch (err) {
            showError("Failed to update profile: " + (err.message || ""));
        }
    };

    const handleCancel = () => {
        if (!user) return;
        setName(user.name);
        setSbuId(user.sbu_id);
        setAddress(user.address);
        setUserType(user.user_type);
        setPermitNumber(user.permit_number);
        setCarModel(user.car_model);
        setLicensePlate(user.license_plate);
        setIsToggled(false);
        setErrorMessage("");
    };

    return (
        <div className="profile-page-container">
            <Header />
            <NavBar />

            {/* User Info */}
            <div className="user-info">
                <h2>{user ? user.name : "N/A"}</h2>
                <p>
                    <strong>SBU ID:</strong> {user ? user.sbu_id : "N/A"}
                </p>
                <p>
                    <strong>Address:</strong> {user ? user.address : "N/A"}
                </p>
            </div>

            {/* Edit Toggle */}
            <button
                onClick={handleToggleClass}
                className="edit-information-btn"
                disabled={!user?.is_profile_complete}>
                {isToggled ? "Cancel Edit" : "Edit Information"}
            </button>

            {/* Profile Edit Section */}
            <div
                className={`profile-page-content ${
                    isToggled ? "" : "toggled-class"
                }`}>
                <h1>Profile Page</h1>
                <div className="profile-section profile-picture-section">
                    <div className="current-profile-picture">
                        <img
                            src={profileIcon}
                            alt="Profile"
                            className="profile-picture"
                        />
                        <h2>{user ? user.name : "N/A"}</h2>
                    </div>
                </div>
                <div className="profile-section">
                    <label>Name:</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>SBU ID:</label>
                    <input
                        value={sbuId}
                        onChange={(e) => setSbuId(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>Address:</label>
                    <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
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
                        value={permitNumber}
                        onChange={(e) => setPermitNumber(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>Car Model:</label>
                    <input
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                    />
                </div>
                <div className="profile-section">
                    <label>License Plate:</label>
                    <input
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                    />
                </div>
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                <div className="action-buttons">
                    <button
                        onClick={handleCancel}
                        className="cancel-btn"
                        disabled={!user?.is_profile_complete}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="save-btn">
                        Save
                    </button>
                </div>
            </div>

            {/* Reservations Section */}
            <div className="reservations-section">
                {/* Pending */}
                <h2>Pending Reservations</h2>
                {pendingReservations.length > 0 ? (
                    <ul className="reservations-list">
                        {pendingReservations.map((res) => (
                            <li
                                key={res.reservation_id}
                                className="reservation-card">
                                <div className="reservation-row">
                                    <span className="label">Lot:</span>
                                    <span className="value">
                                        {res.lot_name}
                                    </span>
                                </div>
                                <div className="reservation-row">
                                    <span className="label">Start:</span>
                                    <span className="value">
                                        {new Date(
                                            res.start_time
                                        ).toLocaleString("en-US", dateOptions)}
                                    </span>
                                </div>
                                <div className="reservation-row">
                                    <span className="label">End:</span>
                                    <span className="value">
                                        {new Date(res.end_time).toLocaleString(
                                            "en-US",
                                            dateOptions
                                        )}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No pending reservations.</p>
                )}

                {/* Current */}
                <h2>Current Reservations</h2>
                {currentReservations.length > 0 ? (
                    <ul className="reservations-list">
                        {currentReservations.map((res) => (
                            <li
                                key={res.reservation_id}
                                className="reservation-card">
                                <div className="reservation-row">
                                    <span className="label">Lot:</span>
                                    <span className="value">
                                        {res.lot_name}
                                    </span>
                                </div>
                                <div className="reservation-row">
                                    <span className="label">Start:</span>
                                    <span className="value">
                                        {new Date(
                                            res.start_time
                                        ).toLocaleString("en-US", dateOptions)}
                                    </span>
                                </div>
                                <div className="reservation-row">
                                    <span className="label">End:</span>
                                    <span className="value">
                                        {new Date(res.end_time).toLocaleString(
                                            "en-US",
                                            dateOptions
                                        )}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No current reservations.</p>
                )}

                {/* Past */}
                <h2>Past Reservations</h2>
                {pastReservations.length > 0 ? (
                    <ul className="reservations-list">
                        {pastReservations.map((res) => (
                            <li
                                key={res.reservation_id}
                                className="reservation-card">
                                <div className="reservation-row">
                                    <span className="label">Lot:</span>
                                    <span className="value">
                                        {res.lot_name}
                                    </span>
                                </div>
                                <div className="reservation-row">
                                    <span className="label">Start:</span>
                                    <span className="value">
                                        {new Date(
                                            res.start_time
                                        ).toLocaleString("en-US", dateOptions)}
                                    </span>
                                </div>
                                <div className="reservation-row">
                                    <span className="label">End:</span>
                                    <span className="value">
                                        {new Date(res.end_time).toLocaleString(
                                            "en-US",
                                            dateOptions
                                        )}
                                    </span>
                                </div>
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
