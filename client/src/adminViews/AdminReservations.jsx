import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminReservations.css";

const AdminReservations = () => {
    const [pendingReservations, setPendingReservations] = useState([]);
    const [completedReservations, setCompletedReservations] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);

    useEffect(() => {
        fetchPending();
        fetchCompleted();
    }, []);

    const fetchPending = async () => {
        try {
            const data = await ApiService.fetchPendingReservations();
            setPendingReservations(data.reservations || []);
        } catch (error) {
            console.error("Failed to fetch pending reservations:", error);
            alert("Error loading pending reservations");
        }
    };

    const fetchCompleted = async () => {
        try {
            const data = await ApiService.fetchCompletedReservations();
            setCompletedReservations(data.reservations || []);
            // console.log("DATA: ", data)
            // console.log("reservations : ", data.reservations)
        } catch (error) {
            console.error("Failed to fetch completed reservations:", error);
            alert("Error loading completed reservations");
        }
    };

    const handleApprove = async (reservationId) => {
        if (!window.confirm("Approve this reservation?")) return;
        try {
            await ApiService.approveReservation(reservationId);
            alert("✅ Reservation approved");
            // remove from pending list
            setPendingReservations((prev) =>
                prev.filter((r) => r.reservation_id !== reservationId)
            );
            // optionally add to completed
            const approved = pendingReservations.find(
                (r) => r.reservation_id === reservationId
            );
            setCompletedReservations((prev) =>
                approved ? [...prev, approved] : prev
            );
        } catch (error) {
            console.error("Failed to approve reservation:", error);
            alert("Approval failed: " + (error.error || error.message));
        }
    };

    return (
        <div className="admin-reservations-container">
            <Header />
            <AdminNav />

            <div className="admin-reservations-content">
                <h1>Pending Reservations</h1>

                {pendingReservations.length === 0 ? (
                    <p>No pending reservations.</p>
                ) : (
                    <ul className="reservation-list">
                        {pendingReservations.map((resv) => (
                            <li
                                key={resv.reservation_id}
                                className="reservation-item">
                                <p>
                                    <strong>ID:</strong> {resv.reservation_id}
                                </p>
                                <p>
                                    <strong>User:</strong> {resv.user_id}
                                </p>
                                <p>
                                    <strong>Lot:</strong> {resv.lot_name}
                                </p>
                                <p>
                                    <strong>Spots:</strong> {resv.num_spots}
                                </p>
                                <p>
                                    <strong>From:</strong>{" "}
                                    {new Date(resv.start_time).toLocaleString()}
                                </p>
                                <p>
                                    <strong>To:</strong>{" "}
                                    {new Date(resv.end_time).toLocaleString()}
                                </p>
                                {resv.explanation && (
                                    <p>
                                        <strong>Explanation:</strong>{" "}
                                        {resv.explanation}
                                    </p>
                                )}
                                <button
                                    className="approve-btn"
                                    onClick={() =>
                                        handleApprove(resv.reservation_id)
                                    }>
                                    Approve
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Toggle for Completed Reservations */}
                <div className="show-completed-toggle">
                    <button onClick={() => setShowCompleted((v) => !v)}>
                        {showCompleted ? "Hide" : "Show"} Completed Reservations
                    </button>
                </div>

                {showCompleted && (
                    <div className="completed-reservations">
                        <h2>Completed Reservations</h2>
                        {completedReservations.length === 0 ? (
                            <p>No completed reservations.</p>
                        ) : (
                            <ul className="reservation-list">
                                {completedReservations.map((resv) => (
                                    <li
                                        key={resv.reservation_id}
                                        className="reservation-item">
                                        <p>
                                            <strong>ID:</strong>{" "}
                                            {resv.reservation_id}
                                        </p>
                                        <p>
                                            <strong>User:</strong>{" "}
                                            {resv.user_id}
                                        </p>
                                        <p>
                                            <strong>Lot:</strong>{" "}
                                            {resv.lot_name}
                                        </p>
                                        <p>
                                            <strong>Spots:</strong>{" "}
                                            {resv.num_spots}
                                        </p>
                                        <p>
                                            <strong>From:</strong>{" "}
                                            {new Date(
                                                resv.start_time
                                            ).toLocaleString()}
                                        </p>
                                        <p>
                                            <strong>To:</strong>{" "}
                                            {new Date(
                                                resv.end_time
                                            ).toLocaleString()}
                                        </p>
                                        {resv.explanation && (
                                            <p>
                                                <strong>Explanation:</strong>{" "}
                                                {resv.explanation}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReservations;
