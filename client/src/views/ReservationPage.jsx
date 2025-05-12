import Header from "../components/Header";
import NavBar from "../components/NavBar";
import "../stylesheets/ReservationPage.css";
import ApiService from "../services/ApiService";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

const ReservationPage = () => {
    const [pending, setPending] = useState([]);
    const [current, setCurrent] = useState([]);
    const [past, setPast] = useState([]);
    const navigate = useNavigate();
    const dateOptions = {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    };

    useEffect(() => {
        const user = ApiService.getSessionUser();
        if (!user) return navigate("/login");

        ApiService.fetchPendingReservations()
            .then(({ reservations }) => {
                const myPending = reservations.filter(r => r.user_id === user.user_id);
                setPending(myPending);
                const pendingIds = new Set(myPending.map(r => r.reservation_id));
                return ApiService.getUserReservations(user.user_id);
            })
            .then(({ currentReservations, pastReservations }) => {
                setCurrent(currentReservations.filter(r => !pending.some(p => p.reservation_id === r.reservation_id)));
                setPast(pastReservations);
            })
            .catch(console.error);
    }, [navigate]);

    const renderList = list =>
        list.length ? (
            <ul className="reservations-list">
                {list.map(res => (
                    <li key={res.reservation_id} className="reservation-card">
                        <div className="reservation-row">
                            <span className="label">Lot:</span>
                            <span className="value">{res.lot_name}</span>
                        </div>
                        <div className="reservation-row">
                            <span className="label">Start:</span>
                            <span className="value">
                                {new Date(res.start_time).toLocaleString("en-US", dateOptions)}
                            </span>
                        </div>
                        <div className="reservation-row">
                            <span className="label">End:</span>
                            <span className="value">
                                {new Date(res.end_time).toLocaleString("en-US", dateOptions)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p>No reservations.</p>
        );

    return (
        <div className="reservation-page-container">
            <Header />
            <NavBar />

            <div className="reservation-page-content">
                <h2>Pending Reservations</h2>
                {renderList(pending)}

                <h2>Current Reservations</h2>
                {renderList(current)}

                <h2>Past Reservations</h2>
                {renderList(past)}
            </div>
        </div>
    );
};

export default ReservationPage;
