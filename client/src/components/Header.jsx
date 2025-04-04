import React, { useState, useEffect, useRef } from "react";
import "../stylesheets/Header.css"; // Import the CSS file
import logo from "../images/SBU logos/SBU-horz_2clr_rgb_72ppi.png";
import messageIcon from "../images/email.svg";
import notificationIcon from "../images/notification-bell.svg";
import dividerIcon from "../images/divider.svg";
import profileIcon from "../images/default-profile.png";

import ApiService from "../services/ApiService";

const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const dropdownRef = useRef(null);

    const user = ApiService.getSessionUser();

    useEffect(() => {
        ApiService.getNotifications()
            .then((data) => {
                setNotifications(data); // Update state with mock notifications
            })
            .catch((error) => {
                console.error("Failed to fetch notifications:", error.message);
            });
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleShowAll = () => {
        setShowAll(!showAll);
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false); // Close the dropdown
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    return (
        <header className="header-container">
            <a href="/homepage" className="header-logo">
                <img src={logo} alt="Logo" />
            </a>
            <div className="header-icons">
                <a href="/messagepage" className="header-icon messageIcon">
                    <img src={messageIcon} alt="Messages" />
                </a>
                <div className="header-icon notification-container"ref={dropdownRef}>
                    <img
                        src={notificationIcon}
                        alt="Notifications"
                        onClick={toggleDropdown}
                    />
                    {isDropdownOpen && (
                        <div className="notification-dropdown">
                            {notifications.length > 0 ? (
                                <ul>
                                    {(showAll
                                        ? notifications
                                        : notifications.slice(0, 5)
                                    ).map((notification, index) => (
                                        <li key={index}>
                                            <a href={notification.link}>
                                                {notification.message}
                                            </a>
                                            <span className="notification-time">
                                                {notification.time}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No new notifications</p>
                            )}
                            {notifications.length > 5 && (
                                <button
                                    className="show-all-button"
                                    onClick={toggleShowAll}
                                >
                                    {showAll ? "Show Less" : "Show All"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="header-divider">
                    <img src={dividerIcon} alt="Divider" />
                </div>
                <a href="/profilepage" className="header-profile">
                    <img src={profileIcon} alt="Profile" />
                    <span className="profile-name">
                        {user ? user.name : "Guest"}
                    </span>
                </a>
                <button className="logout-button" onClick={ApiService.logout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
