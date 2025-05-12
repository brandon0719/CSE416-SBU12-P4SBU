import React, { useEffect, useState } from 'react';
import '../stylesheets/NavBar.css';
import ApiService from '../services/ApiService';

const links = [
    { to: '/homepage', label: 'P4SBU' },
    { to: "/myreservations", label: "My Reservations" },
    { to: '/ticketpage', label: 'Tickets/Fines' },
    { to: '/aboutuspage', label: 'About Us' },
    { to: '/contactuspage', label: 'Contact Us' },
];

function NavBar() {
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const user = ApiService.getSessionUser();
        setUserType(user?.user_type || '');
    }, []);

    const currentPath = window.location.pathname;

    return (
        <div className="navbar">
            <div className="navbar-links">
                {links.map(({ to, label }) => (
                    <a
                        key={to}
                        href={to}
                        className={currentPath === to ? 'active' : ''}
                    >
                        {label}
                    </a>
                ))}
            </div>
            <div className="navbar-text">{userType}</div>
        </div>
    );
}

export default NavBar;
