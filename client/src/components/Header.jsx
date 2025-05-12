import React, { useState, useEffect, useRef } from "react";
import "../stylesheets/Header.css"; // Import the CSS file
import logo from "../images/SBU logos/SBU-horz_2clr_rgb_72ppi.png";
import messageIcon from "../images/email.svg";
import notificationIcon from "../images/notification-bell.svg";
import dividerIcon from "../images/divider.svg";
import profileIcon from "../images/default-profile.png";

import ApiService from "../services/ApiService";

const Header = () => {
    // notification dropdown stuff
    const [notifications, setNotifications] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const dropdownRef = useRef(null);

    // message dropdown stuff
    const [messages, setMessages] = useState([]);
    const [isMessageDropdownOpen, setIsMessageDropdownOpen] = useState(false);
    const [showAllMessages, setShowAllMessages] = useState(false);
    const messageDropdownRef = useRef(null);

    // user info
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

    const toggleShowAllNotifications = () => {
        setShowAllNotifications(!showAllNotifications);
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const user = ApiService.getSessionUser();
                if (user && user.user_id) {
                    const messages = await ApiService.getMessages(user.user_id);
                    setMessages(messages);
                } else {
                    console.error("User ID is undefined");
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error.message);
            }
        };

        fetchMessages();
    }, []);

    const toggleMessageDropdown = () => {
        setIsMessageDropdownOpen(!isMessageDropdownOpen);
    };

    const toggleShowAllMessages = () => {
        setShowAllMessages(!showAllMessages);
    };

    const handleLogout = () => {
        ApiService.logout(); // Call the logout function
        window.location.pathname = "/login";
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (messageDropdownRef.current && !messageDropdownRef.current.contains(event.target)) {
                setIsMessageDropdownOpen(false); // Close the message dropdown
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false); // Close the notification dropdown
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef, messageDropdownRef]);

    return (
        <header className="header-container">
            <a href="/homepage" className="header-logo">
                <img src={logo} alt="Logo" />
            </a>
            <div className="header-icons">
                <div className="message-and-notfication-container">
                    <div className="header-icon message-container" ref={messageDropdownRef}>
                        <img
                            src={messageIcon}
                            alt="Messages"
                            onClick={toggleMessageDropdown}
                        />
                        {isMessageDropdownOpen && (
                            <div className="message-dropdown">
                                <hr style={{ border: "1px solid #eee", margin: "10px 0 0 0" }} />
                                {messages.length > 0 ? (
                                    <ul>
                                        {(showAllMessages ? messages : messages.slice(0, 3)).map((message) => (
                                            <li key={message.message_id}>
                                                <p>{message.message_details}</p>
                                                <span className="message-time">
                                                    {new Date(message.time_sent).toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No new messages</p>
                                )}
                                {messages.length > 3 && (
                                    <button
                                        className="show-all-button"
                                        onClick={toggleShowAllMessages}
                                    >
                                        {showAllMessages ? "Show Less" : "Show All"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="header-icon notification-container" ref={dropdownRef}>
                        <img
                            src={notificationIcon}
                            alt="Notifications"
                            onClick={toggleDropdown}
                        />
                        {isDropdownOpen && (
                            <div className="notification-dropdown">
                                {notifications.length > 0 ? (
                                    <ul>
                                        {(showAllNotifications
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
                                        onClick={toggleShowAllNotifications}
                                    >
                                        {showAllNotifications ? "Show Less" : "Show All"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="header-divider">
                    <img src={dividerIcon} alt="Divider" />
                </div>
                {user && user.is_admin ? (
                    // Non-clickable profile area for admin users
                    <div className="header-profile non-clickable">
                        <img src={profileIcon} alt="Profile" />
                        <span className="profile-name">{user.name}</span>
                    </div>
                ) : (
                    // Clickable profile area for regular users
                    <a href="/profilepage" className="header-profile">
                        <img src={profileIcon} alt="Profile" />
                        <span className="profile-name">{user ? user.name : "Guest"}</span>
                    </a>
                )}
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;