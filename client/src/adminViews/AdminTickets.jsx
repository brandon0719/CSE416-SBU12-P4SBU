// client/src/views/AdminTickets.jsx

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import SearchBar from "../components/SearchBar";
import "../stylesheets/AdminTickets.css";

const AdminTickets = () => {
    const [users, setUsers] = useState([]);
    const [displayList, setDisplayList] = useState([]);
    const [sortCriteria, setSortCriteria] = useState("default");
    const [searchTerm, setSearchTerm] = useState("");

    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [ticketDetails, setTicketDetails] = useState({
        violationDate: "",
        ticketPrice: "",
        ticketText: "",
    });

    // 1) load users once
    useEffect(() => {
        ApiService.fetchAllUsers()
            .then((res) => {
                setUsers(res.users);
            })
            .catch(console.error);
    }, []);

    // 2) whenever users / searchTerm / sortCriteria change, recalc displayList
    useEffect(() => {
        // filter
        const filtered = users.filter((u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // sort
        let sorted = [...filtered];
        if (sortCriteria === "alphabetical") {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        setDisplayList(sorted);
    }, [users, searchTerm, sortCriteria]);

    const handleOpenPopup = (user) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedUser(null);
        setTicketDetails({
            violationDate: "",
            ticketPrice: "",
            ticketText: "",
        });
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
                {/* header with sort control */}
                <div className="admin-tickets-header">
                    <div className="admin-tickets-header-actions">
                        <div className="admin-tickets-sorting-options">
                            <label htmlFor="sort-criteria">Sort by:</label>
                            <select
                                id="sort-criteria"
                                value={sortCriteria}
                                onChange={(e) =>
                                    setSortCriteria(e.target.value)
                                }>
                                <option value="default">Default</option>
                                <option value="alphabetical">
                                    Alphabetical
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* search bar */}
                <SearchBar
                    placeholder="Search users by name…"
                    value={searchTerm}
                    onChange={setSearchTerm}
                />

                {/* user list */}
                <div className="admin-tickets-user-list-container">
                    <ul className="admin-tickets-user-list">
                        {displayList.map((user) => (
                            <li
                                key={user.user_id}
                                className="admin-tickets-user-item">
                                <span>
                                    <strong>{user.name}</strong> –{" "}
                                    {user.license_plate || (
                                        <span style={{ color: "red" }}>
                                            Missing Plate
                                        </span>
                                    )}
                                </span>
                                <button
                                    className="admin-tickets-add-ticket-button"
                                    onClick={() => handleOpenPopup(user)}>
                                    Add Ticket
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* popup */}
                {showPopup && selectedUser && (
                    <div className="admin-tickets-popup">
                        <h2>Create Ticket for {selectedUser.name}</h2>
                        <input
                            type="date"
                            value={ticketDetails.violationDate}
                            onChange={(e) =>
                                setTicketDetails((td) => ({
                                    ...td,
                                    violationDate: e.target.value,
                                }))
                            }
                            className="admin-tickets-popup-input"
                        />
                        <input
                            type="number"
                            placeholder="Ticket Price"
                            value={ticketDetails.ticketPrice}
                            onChange={(e) =>
                                setTicketDetails((td) => ({
                                    ...td,
                                    ticketPrice: e.target.value,
                                }))
                            }
                            className="admin-tickets-popup-input"
                        />
                        <textarea
                            placeholder="Ticket Details"
                            value={ticketDetails.ticketText}
                            onChange={(e) =>
                                setTicketDetails((td) => ({
                                    ...td,
                                    ticketText: e.target.value,
                                }))
                            }
                            className="admin-tickets-popup-textarea"
                        />
                        <div className="admin-tickets-popup-actions">
                            <button
                                onClick={handleClosePopup}
                                className="admin-tickets-popup-cancel-button">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="admin-tickets-popup-submit-button">
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTickets;
