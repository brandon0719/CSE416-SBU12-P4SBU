// client/src/components/AdminNavBar.jsx
import React from 'react';
import '../stylesheets/NavBar.css';

const adminLinks = [
    { to: '/users', label: 'Users' },
    { to: '/tickets', label: 'Tickets' },
    { to: '/parking', label: 'Parking' },
    { to: '/reservations', label: 'Reservations' },
    { to: '/data-analysis', label: 'Data' },
];

export default function AdminNavBar() {
    const currentPath = window.location.pathname;

    return (
        <div className="navbar">
            <div className="navbar-links">
                {adminLinks.map(({ to, label }) => (
                    <a
                        key={to}
                        href={to}
                        className={currentPath === to ? 'active' : ''}
                    >
                        {label}
                    </a>
                ))}
            </div>
            <div className="navbar-text">Administrator</div>
        </div>
    );
}
