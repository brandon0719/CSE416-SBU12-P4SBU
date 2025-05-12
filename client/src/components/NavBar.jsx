import React, { useEffect, useState } from 'react';
import '../stylesheets/NavBar.css';
import ApiService from '../services/ApiService';

function NavBar() {
    const [userType, setUserType] = useState('');

    useEffect(() => {
        const fetchUserType = async () => {
            try {
                const user = await ApiService.getSessionUser();
                setUserType(user.user_type || '');
            } catch (error) {
                console.error("Error fetching user type:", error);
            }
        };

        fetchUserType();
    }, []);

    return (
        <div className="navbar">
            <div className="navbar-links">
                <a href="/homepage">P4SBU</a>
                <a href="/ticketpage">Tickets/Fines</a>
                <a href="/aboutuspage">About Us</a>
                <a href="/contactuspage">Contact Us</a>
            </div>
            <div className="navbar-text">
                {userType}
            </div>
        </div>
    );
}

export default NavBar;
