import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

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
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <div className="admin-header">
                    <h1>Tickets</h1>
                    <div className="sorting-options">
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
                <div className="user-list-container">
                    <ul className="user-list">
                        {sortedUsers.map((user) => (
                            <li key={user.user_id} className="user-item">
                                <span>{user.name} ({user.license_plate})</span>
                                <button onClick={() => handleOpenPopup(user)}>Add Ticket</button>
                            </li>
                        ))}
                    </ul>
                </div>
                {showPopup && (
                    <div className="popup">
                        <h2>Create Ticket for {selectedUser.name}</h2>
                        <input
                            type="date"
                            value={ticketDetails.violationDate}
                            onChange={(e) =>
                                setTicketDetails({ ...ticketDetails, violationDate: e.target.value })
                            }
                        />
                        <input
                            type="number"
                            placeholder="Ticket Price"
                            value={ticketDetails.ticketPrice}
                            onChange={(e) =>
                                setTicketDetails({ ...ticketDetails, ticketPrice: e.target.value })
                            }
                        />
                        <textarea
                            placeholder="Ticket Details"
                            value={ticketDetails.ticketText}
                            onChange={(e) =>
                                setTicketDetails({ ...ticketDetails, ticketText: e.target.value })
                            }
                        />
                        <button onClick={handleClosePopup}>Cancel</button>
                        <button onClick={handleSubmit}>Submit</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTickets;