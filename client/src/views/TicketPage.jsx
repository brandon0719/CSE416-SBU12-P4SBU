import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/TicketPage.css";

const TicketPage = () => {
    const [tickets, setTickets] = useState([]);
    const [paidTickets, setPaidTickets] = useState([]); // State for paid tickets
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [showAllPaidTickets, setShowAllPaidTickets] = useState(false); // State for "Show More"

    useEffect(() => {
        // Fetch tickets for the user
        const user = ApiService.getSessionUser();
        if (user) {
            ApiService.getTickets(user.user_id)
                .then((data) => setTickets(data))
                .catch((error) => console.error("Failed to fetch tickets:", error));

            // Fetch paid tickets for the user
            ApiService.getPaidTickets(user.user_id)
                .then((data) => setPaidTickets(data))
                .catch((error) => console.error("Failed to fetch paid tickets:", error));
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
                setTickets(tickets.filter((ticket) => !selectedTickets.includes(ticket.ticket_id)));
                setSelectedTickets([]);
                // Optionally, refresh paid tickets
                const user = ApiService.getSessionUser();
                ApiService.getPaidTickets(user.user_id)
                    .then((data) => setPaidTickets(data))
                    .catch((error) => console.error("Failed to refresh paid tickets:", error));
            })
            .catch((error) => console.error("Failed to pay tickets:", error));
    };

    const toggleShowAllPaidTickets = () => {
        setShowAllPaidTickets(!showAllPaidTickets);
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
                            <li key={ticket.ticket_id} className="ticket-item">
                                <input
                                    type="checkbox"
                                    checked={selectedTickets.includes(ticket.ticket_id)}
                                    onChange={() => handleTicketSelection(ticket.ticket_id)}
                                />
                                <div className="ticket-details">
                                    <p><strong>Violation:</strong> {ticket.ticket_details}</p>
                                    <p><strong>Amount:</strong> ${ticket.ticket_price}</p>
                                    <p><strong>Date:</strong> {new Date(ticket.violation_date).toLocaleDateString()}</p>
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

                <h2>Paid Tickets</h2>
                {paidTickets.length > 0 ? (
                    <div className="paid-ticket-list-container">
                        <ul className="ticket-list">
                            {paidTickets
                                .slice(0, showAllPaidTickets ? paidTickets.length : 2)
                                .map((ticket) => (
                                    <li key={ticket.ticket_id} className="ticket-item">
                                        <div className="ticket-details">
                                            <p><strong>Violation:</strong> {ticket.ticket_details}</p>
                                            <p><strong>Amount:</strong> ${ticket.ticket_price}</p>
                                            <p><strong>Date:</strong> {new Date(ticket.violation_date).toLocaleDateString()}</p>
                                            <p><strong>Paid On:</strong> {new Date(ticket.paid_date).toLocaleDateString()}</p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                        {paidTickets.length > 2 && (
                            <button className="show-more-button" onClick={toggleShowAllPaidTickets}>
                                {showAllPaidTickets ? "Show Less" : "Show More"}
                            </button>
                        )}
                    </div>
                ) : (
                    <p>No paid tickets available.</p>
                )}
            </div>
        </div>
    );
};

export default TicketPage;