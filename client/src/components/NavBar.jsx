import React from 'react';
import '../stylesheets/NavBar.css';

function NavBar() {
    return (
        <div className="navbar">
            <div className="navbar-links">
                <a href="#p4sbu">P4SBU</a>
                <a href="#tickets-fines">Tickets/Fines</a>
                <a href="#about-us">About Us</a>
                <a href="#contact-us">Contact Us</a>
            </div>
            <div className="navbar-text">
                Resident Student
            </div>
        </div>
    );
}

export default NavBar;
