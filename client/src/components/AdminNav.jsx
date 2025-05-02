import React from 'react';
import '../stylesheets/NavBar.css';

function NavBar() {
    return (
        <div className="navbar">
            <div className="navbar-links">
                <a href="/users">Users</a>
                <a href="/tickets">Tickets</a>
                <a href="/parking">Parking</a>
                <a href="/reservations">Reservations</a>
                <a href="/data-analysis">Data</a>
            </div>
            <div className="navbar-text">
                Administrator
            </div>
        </div>
    );a
}

export default NavBar;
