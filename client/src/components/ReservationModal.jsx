import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import ApiService from "../services/ApiService";
import "../stylesheets/HomePage.css";
import PopularHoursChart from "./PopularHoursChart";

const sessionUser = ApiService.getSessionUser();

const ReservationModal = ({
    reservationStart,
    reservationEnd,
    lotName,
    price,
    isOpen,
    numAvailableSpots,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState({
        name: sessionUser.name,
        email: sessionUser.email,
        lot: lotName,
        start: reservationStart,
        end: reservationEnd,
        numSpots: 1,
        explanation: "",
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            start: reservationStart,
            end: reservationEnd,
            lot: lotName,
        }));
    }, [reservationStart, reservationEnd, lotName]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // compute a total cost
    const totalCost = (price * formData.numSpots).toFixed(2);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={onClose}
                contentLabel="Create Reservation"
                className="modal-content"
                overlayClassName="modal-overlay">
                <div className="popup">
                    <div className="chart">
                        <PopularHoursChart
                            lot={formData.lot}
                            date={formData.start}
                        />
                    </div>

                    <div className="info">
                        <h2>Confirm Reservation</h2>
                        <form onSubmit={handleSubmit}>
                            <p>
                                Name: {formData.name} <br />
                                Email: {formData.email} <br />
                                Parking Lot: {formData.lot}
                                <br />
                                Number of Available Spots: {numAvailableSpots}
                                <br />
                                Reservation Start:{" "}
                                {reservationStart.toLocaleString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                                <br />
                                Reservation End:{" "}
                                {reservationEnd.toLocaleString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}{" "}
                                <br />
                                <strong>Price per spot:</strong>$
                                {parseFloat(price).toFixed(2)} <br />
                                <strong>Total Cost: </strong> ${totalCost}{" "}
                                <br />
                            </p>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Number of Spots</label>
                                    <input
                                        type="number"
                                        name="numSpots"
                                        value={formData.numSpots}
                                        onChange={handleInputChange}
                                        min="1"
                                        step="1"
                                        max={numAvailableSpots}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    Explanation (if number of spots is greater
                                    than 1)
                                </label>
                                <textarea
                                    name="explanation"
                                    value={formData.explanation}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="popup-actions">
                                <button type="button" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ReservationModal;
