import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";


const AdminTickets = () => {
    const [users, setUsers] = useState([]);
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
            console.log("Fetched users:", data); 
            console.log("Fetched users data:", typeof data);
            setUsers(data.users);
        };
        loadUsers();
    }, []);

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
        console.log("Selected user:", selectedUser);
        console.log("selecteduser ID:", selectedUser.user_id);
        console.log("Ticket details:", ticketDetails);
        console.log("Ticket violation date:", ticketDetails.violationDate);

        await ApiService.createTicket(
            selectedUser.user_id,
            ticketDetails.violationDate,
            ticketDetails.ticketPrice,
            ticketDetails.ticketText,
        );

        handleClosePopup();
    };

    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <h1>TICKETS PAGE</h1>
                <ul>
                    {users.map((user) => (
                        <li key={user.user_id}>
                            {user.name} ({user.license_plate})
                            <button onClick={() => handleOpenPopup(user)}>Add Ticket</button>
                        </li>
                    ))}
                </ul>
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
                            value={ticketDetails.ticketDetails}
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