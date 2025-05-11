import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminTickets.css";

const AdminTickets = () => {
    const [users, setUsers] = useState([]);
    const [sortedUsers, setSortedUsers] = useState([]); // State for sorted users
    const [sortCriteria, setSortCriteria] = useState("default"); // Sorting criteria
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [ticketDetails, setTicketDetails] = useState({
        violationDate: "",
        ticketPrice: "",
        ticketText: "",
    });

    useEffect(() => {
        const loadUsers = async () => {
            const data = await ApiService.fetchAllUsers();
            setUsers(data.users);
            setSortedUsers(data.users); // Initialize sorted users
        };
        loadUsers();
    }, []);

    useEffect(() => {
        sortUsers(sortCriteria);
    }, [sortCriteria, users]);

    const sortUsers = (criteria) => {
        let sorted = [...users];
        if (criteria === "alphabetical") {
            sorted = sorted.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order
        }
        setSortedUsers(sorted);
    };

    const handleOpenPopup = (user) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedUser(null);
        setTicketDetails({ violationDate: "", ticketPrice: "", ticketText: "" });
    };

    const handleSubmit = async () => {
        await ApiService.createTicket(
            selectedUser.user_id,
            ticketDetails.violationDate,
            ticketDetails.ticketPrice,
            ticketDetails.ticketText
        );
        handleClosePopup();
    };

    return (
        <div className="admin-tickets-container">
            <Header />
            <AdminNav />
            <div className="admin-tickets-content">
                <div className="admin-tickets-header">
                    <div className="admin-tickets-header-actions">
                        <div className="admin-tickets-sorting-options ">
                            <label htmlFor="sort-criteria">Sort by:</label>
                            <select
                                id="sort-criteria"
                                value={sortCriteria}
                                onChange={(e) => setSortCriteria(e.target.value)}
                            >
                                <option value="default">Default</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="admin-tickets-user-list-container">
                    <ul className="admin-tickets-user-list">
                        {sortedUsers.map((user) => (
                            <li key={user.user_id} className="admin-tickets-user-item">
                                <span>
                                    <strong>{user.name}</strong> - {user.license_plate ? (
                                        user.license_plate
                                    ) : (
                                        <span style={{ color: 'red' }}>Missing Plate</span>
                                    )}
                                </span>
                                <button onClick={() => handleOpenPopup(user)} className="admin-tickets-add-ticket-button">Add Ticket</button>
                            </li>
                        ))}
                    </ul>
                </div>
                {showPopup && (
                    <div className="admin-tickets-popup">
                        <h2>Create Ticket for {selectedUser.name}</h2>
                        <input
                            type="date"
                            value={ticketDetails.violationDate}
                            onChange={(e) =>
                                setTicketDetails({ ...ticketDetails, violationDate: e.target.value })
                            }
                            className="admin-tickets-popup-input"
                        />
                        <input
                            type="number"
                            placeholder="Ticket Price"
                            value={ticketDetails.ticketPrice}
                            onChange={(e) =>
                                setTicketDetails({ ...ticketDetails, ticketPrice: e.target.value })
                            }
                            className="admin-tickets-popup-input"
                        />
                        <textarea
                            placeholder="Ticket Details"
                            value={ticketDetails.ticketText}
                            onChange={(e) =>
                                setTicketDetails({ ...ticketDetails, ticketText: e.target.value })
                            }
                            className="admin-tickets-popup-textarea"
                        />
                        <div className="admin-tickets-popup-actions">
                            <button onClick={handleClosePopup} className="admin-tickets-popup-cancel-button">Cancel</button>
                            <button onClick={handleSubmit} className="admin-tickets-popup-submit-button">Submit</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTickets;