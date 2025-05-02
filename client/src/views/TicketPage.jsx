import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import CheckoutForm from "../components/CheckoutForm";
import "../stylesheets/TicketPage.css";

const TicketPage = () => {
    const [tickets, setTickets] = useState([]);
    const [paidTickets, setPaidTickets] = useState([]);
    const [selectedTickets, setSelectedTickets] = useState([]);

    // Stripe integration states:
    const [clientSecret, setClientSecret] = useState(null);
    const [pendingTickets, setPendingTickets] = useState([]);

    const [showAllPaidTickets, setShowAllPaidTickets] = useState(false);

    useEffect(() => {
        const user = ApiService.getSessionUser();
        if (!user) return;

        ApiService.getTickets(user.user_id)
            .then((data) => setTickets(data))
            .catch((err) => console.error(err));

        ApiService.getPaidTickets(user.user_id)
            .then((data) => setPaidTickets(data))
            .catch((err) => console.error(err));
    }, []);

    const handleTicketSelection = (ticketId) => {
        setSelectedTickets((prev) =>
            prev.includes(ticketId)
                ? prev.filter((id) => id !== ticketId)
                : [...prev, ticketId]
        );
    };

    // 1) Kick off payment intent instead of directly paying
    const handlePayTickets = async () => {
        if (selectedTickets.length === 0) {
            return alert("Please select at least one ticket to pay.");
        }

        // Compute total in cents
        const totalCents = tickets
            .filter((t) => selectedTickets.includes(t.ticket_id))
            .reduce((sum, t) => sum + Math.round(t.ticket_price * 100), 0);

        // Stash the IDs so we can finalize after payment
        setPendingTickets(selectedTickets);

        try {
            // 2) Create the PaymentIntent
            const secret = await ApiService.createPaymentIntent(totalCents);
            setClientSecret(secret);
        } catch (err) {
            console.error("Payment init failed:", err);
            alert("Could not start payment: " + (err.message || err));
        }
    };

    // 3) Toggle show more/less for paid tickets
    const toggleShowAllPaidTickets = () => {
        setShowAllPaidTickets((v) => !v);
    };

    return (
        <div className="ticketpage-container">
            <Header />
            <NavBar />

            <div className="ticket-page-content">
                <h1>Outstanding Tickets</h1>

                {tickets.length ? (
                    <ul className="ticket-list">
                        {tickets.map((ticket) => (
                            <li key={ticket.ticket_id} className="ticket-item">
                                <input
                                    type="checkbox"
                                    checked={selectedTickets.includes(
                                        ticket.ticket_id
                                    )}
                                    onChange={() =>
                                        handleTicketSelection(ticket.ticket_id)
                                    }
                                />
                                <div className="ticket-details">
                                    <p>
                                        <strong>Violation:</strong>{" "}
                                        {ticket.ticket_details}
                                    </p>
                                    <p>
                                        <strong>Amount:</strong> $
                                        {ticket.ticket_price}
                                    </p>
                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                            ticket.violation_date
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tickets available.</p>
                )}

                {tickets.length > 0 && (
                    <button
                        className="pay-tickets-button"
                        onClick={handlePayTickets}>
                        Pay Selected Tickets
                    </button>
                )}

                <h2>Paid Tickets</h2>
                {paidTickets.length ? (
                    <div className="paid-ticket-list-container">
                        <ul className="ticket-list">
                            {paidTickets
                                .slice(
                                    0,
                                    showAllPaidTickets ? paidTickets.length : 2
                                )
                                .map((ticket) => (
                                    <li
                                        key={ticket.ticket_id}
                                        className="ticket-item">
                                        <div className="ticket-details">
                                            <p>
                                                <strong>Violation:</strong>{" "}
                                                {ticket.ticket_details}
                                            </p>
                                            <p>
                                                <strong>Amount:</strong> $
                                                {ticket.ticket_price}
                                            </p>
                                            <p>
                                                <strong>Date:</strong>{" "}
                                                {new Date(
                                                    ticket.violation_date
                                                ).toLocaleDateString()}
                                            </p>
                                            <p>
                                                <strong>Paid On:</strong>{" "}
                                                {new Date(
                                                    ticket.paid_date
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                        {paidTickets.length > 2 && (
                            <button
                                className="show-more-button"
                                onClick={toggleShowAllPaidTickets}>
                                {showAllPaidTickets ? "Show Less" : "Show More"}
                            </button>
                        )}
                    </div>
                ) : (
                    <p>No paid tickets available.</p>
                )}
            </div>

            {/* 4) Stripe Checkout Modal */}
            {clientSecret && pendingTickets.length > 0 && (
                <>
                    <div className="modal-overlay" />
                    <div className="checkout-container">
                        <h4>Complete Payment</h4>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            onCancel={() => {
                                setClientSecret(null);
                                setPendingTickets([]);
                            }}
                            onSuccessfulPayment={async () => {
                                try {
                                    // 5) finalize via your tickets API
                                    await ApiService.payTickets(pendingTickets);
                                    alert("Tickets paid successfully!");

                                    // update state: remove paid from outstanding, refresh paid list
                                    setTickets((tks) =>
                                        tks.filter(
                                            (t) =>
                                                !pendingTickets.includes(
                                                    t.ticket_id
                                                )
                                        )
                                    );
                                    const user = ApiService.getSessionUser();
                                    const freshPaid =
                                        await ApiService.getPaidTickets(
                                            user.user_id
                                        );
                                    setPaidTickets(freshPaid);
                                } catch (err) {
                                    console.error(
                                        "Finalizing payment failed:",
                                        err
                                    );
                                    alert(
                                        "Error finalizing payment: " +
                                            err.message
                                    );
                                } finally {
                                    setClientSecret(null);
                                    setPendingTickets([]);
                                }
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default TicketPage;
