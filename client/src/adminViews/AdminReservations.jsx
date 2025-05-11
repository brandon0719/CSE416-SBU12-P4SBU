// client/src/adminViews/AdminReservations.jsx

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminReservations.css";

const AdminReservations = () => {
    const [pendingReservations, setPendingReservations] = useState([]);
    const [completedReservations, setCompletedReservations] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const [sortKey, setSortKey] = useState("start"); // or "lot"

    useEffect(() => {
        loadPending();
        loadCompleted();
    }, []);

    const loadPending = async () => {
        try {
            const { reservations = [] } =
                await ApiService.fetchPendingReservations();
            const now = new Date();
            const keep = [];

            for (const r of reservations) {
                const end = new Date(r.end_time);

                if (r.num_spots === 1) {
                    // auto-approve singles
                    try {
                        await ApiService.approveReservation(r.reservation_id);
                    } catch (e) {
                        /* swallow */
                    }
                } else if (end < now) {
                    // auto-reject expired group
                    try {
                        await ApiService.rejectReservation(r.reservation_id);
                    } catch (e) {
                        /* swallow */
                    }
                } else {
                    keep.push(r);
                }
            }

            setPendingReservations(keep);
            // refresh completed to pick up any auto approvals
            loadCompleted();
        } catch (err) {
            console.error("Failed to fetch pending reservations:", err);
            alert("Error loading pending reservations");
        }
    };

    const loadCompleted = async () => {
        try {
            const { reservations = [] } =
                await ApiService.fetchCompletedReservations();
            setCompletedReservations(reservations);
        } catch (err) {
            console.error("Failed to fetch completed reservations:", err);
            alert("Error loading completed reservations");
        }
    };

    const handleApprove = async (reservationId) => {
        if (!window.confirm("Approve this group reservation?")) return;
        try {
            await ApiService.approveReservation(reservationId);
            setPendingReservations((prev) =>
                prev.filter((r) => r.reservation_id !== reservationId)
            );
            loadCompleted();
        } catch (err) {
            console.error("Approval failed:", err);
            alert("Approval failed: " + (err.error || err.message));
        }
    };

    // sort pending according to sortKey
    const sortedPending = [...pendingReservations].sort((a, b) => {
        if (sortKey === "lot") {
            return a.lot_name.localeCompare(b.lot_name);
        }
        // default: by start date
        return new Date(a.start_time) - new Date(b.start_time);
    });

    return (
        <div className="admin-reservations-container">
            <Header />
            <AdminNav />

            <div className="admin-reservations-content">
                {/* Sorting control */}
                <div className="admin-reservations-header">
                    <h1>Pending Group Reservations</h1>
                    <div>
                        <label>Sort by:&nbsp;</label>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value)}>
                            <option value="start">Earliest Start</option>
                            <option value="lot">Lot Name</option>
                        </select>
                    </div>
                </div>

                <div className="admin-reservations-list-container">
                    {sortedPending.length === 0 ? (
                        <p>No pending group reservations.</p>
                    ) : (
                        <ul className="admin-reservations-list">
                            {sortedPending.map((r) => (
                                <li
                                    key={r.reservation_id}
                                    className="reservation-item">
                                    <p>
                                        <strong>User:</strong> {r.user_id}
                                    </p>
                                    <p>
                                        <strong>Lot:</strong> {r.lot_name},{" "}
                                        <strong>Spots:</strong> {r.num_spots}
                                    </p>
                                    <p>
                                        <strong>From:</strong>{" "}
                                        {new Date(
                                            r.start_time
                                        ).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>To:</strong>{" "}
                                        {new Date(r.end_time).toLocaleString()}
                                    </p>
                                    {r.explanation && (
                                        <p>
                                            <strong>Explanation:</strong>{" "}
                                            {r.explanation}
                                        </p>
                                    )}
                                    <button
                                        className="approve-btn"
                                        onClick={() =>
                                            handleApprove(r.reservation_id)
                                        }>
                                        Approve
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="show-completed-toggle">
                    <button onClick={() => setShowCompleted((v) => !v)}>
                        {showCompleted ? "Hide" : "Show"} Completed Reservations
                    </button>
                </div>

                {showCompleted && (
                    <div className="completed-reservations">
                        <div className="admin-reservations-header">
                            <h2>Completed Reservations</h2>
                        </div>
                        <div className="admin-reservations-list-container">
                            {completedReservations.length === 0 ? (
                                <p>No completed reservations.</p>
                            ) : (
                                <ul className="admin-reservations-list">
                                    {completedReservations.map((r) => (
                                        <li
                                            key={r.reservation_id}
                                            className="reservation-item">
                                            <p>
                                                <strong>ID:</strong>{" "}
                                                {r.reservation_id}
                                            </p>
                                            <p>
                                                <strong>User:</strong>{" "}
                                                {r.user_id}
                                            </p>
                                            <p>
                                                <strong>Lot:</strong>{" "}
                                                {r.lot_name},{" "}
                                                <strong>Spots:</strong>{" "}
                                                {r.num_spots}
                                            </p>
                                            <p>
                                                <strong>From:</strong>{" "}
                                                {new Date(
                                                    r.start_time
                                                ).toLocaleString()}
                                            </p>
                                            <p>
                                                <strong>To:</strong>{" "}
                                                {new Date(
                                                    r.end_time
                                                ).toLocaleString()}
                                            </p>
                                            {r.explanation && (
                                                <p>
                                                    <strong>
                                                        Explanation:
                                                    </strong>{" "}
                                                    {r.explanation}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReservations;
