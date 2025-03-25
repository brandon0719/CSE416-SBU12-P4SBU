import React from "react";
import "../stylesheets/Header.css"; // Import the CSS file
import logo from "../images/SBU logos/SBU-horz_2clr_rgb_72ppi.png";
import messageIcon from "../images/email.svg";
import notificationIcon from "../images/notification-bell.svg";
import dividerIcon from "../images/divider.svg";
import profileIcon from "../images/default-profile.png";

const Header = () => {
    return (
        <header className="header-container">
            <a href="/homepage" className="header-logo">
                <img src={logo} alt="Logo" />
            </a>
            <div className="header-icons">
                <a href="/messages" className="header-icon">
                    <img src={messageIcon} alt="Messages" />
                </a>
                <a href="/notifications" className="header-icon">
                    <img src={notificationIcon} alt="Notifications" />
                </a>
                <div className="header-divider">
                    <img src={dividerIcon} alt="Divider" />
                </div>
                <a href="/profile" className="header-profile">
                    <img src={profileIcon} alt="Profile" />
                    <span className="profile-name">John Doe</span>
                </a>
            </div>
        </header>
    );
};

export default Header;
