import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/TicketPage.css";

const TicketPage = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTickets, setSelectedTickets] = useState([]);

    useEffect(() => {
        // Fetch tickets for the user
        const user = ApiService.getSessionUser();
        if (user) {
            ApiService.getTickets(user.id)
                .then((data) => setTickets(data))
                .catch((error) => console.error("Failed to fetch tickets:", error));
        }
    }, []);

    const handleTicketSelection = (ticketId) => {
        if (selectedTickets.includes(ticketId)) {
            setSelectedTickets(selectedTickets.filter((id) => id !== ticketId));
        } else {
            setSelectedTickets([...selectedTickets, ticketId]);
        }
    };

    const handlePayTickets = () => {
        if (selectedTickets.length === 0) {
            alert("Please select at least one ticket to pay.");
            return;
        }
        // Call API to pay for selected tickets
        ApiService.payTickets(selectedTickets)
            .then(() => {
                alert("Tickets paid successfully!");
                setTickets(tickets.filter((ticket) => !selectedTickets.includes(ticket.id)));
                setSelectedTickets([]);
            })
            .catch((error) => console.error("Failed to pay tickets:", error));
    };

    return (
        <div className="ticketpage-container">
            <Header />
            <NavBar />
            <div className="ticket-page-content">
                <h1>Tickets</h1>
                {tickets.length > 0 ? (
                    <ul className="ticket-list">
                        {tickets.map((ticket) => (
                            <li key={ticket.id} className="ticket-item">
                                <input
                                    type="checkbox"
                                    checked={selectedTickets.includes(ticket.id)}
                                    onChange={() => handleTicketSelection(ticket.id)}
                                />
                                <div className="ticket-details">
                                    <p><strong>Violation:</strong> {ticket.violation}</p>
                                    <p><strong>Amount:</strong> ${ticket.amount}</p>
                                    <p><strong>Date:</strong> {ticket.date}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tickets available.</p>
                )}
                {tickets.length > 0 && (
                    <button className="pay-tickets-button" onClick={handlePayTickets}>
                        Pay Selected Tickets
                    </button>
                )}
            </div>
        </div>
    );
};

export default TicketPage;