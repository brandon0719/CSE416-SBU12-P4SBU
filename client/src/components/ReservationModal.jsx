import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ApiService from "../services/ApiService";
import "../stylesheets/HomePage.css";
import PopularHoursChart from "./PopularHoursChart";

const ReservationModal = ({
    reservationStart,
    reservationEnd,
    lotName,
    isOpen,
    numAvailableSpots,
    onClose,
    onSubmit,
}) => {
    const initialForm = {
        name: "",
        email: "",
        lot: lotName || "",
        start: reservationStart || null,
        end: reservationEnd || null,
        numSpots: 1,
        explanation: "",
    };

    const [formData, setFormData] = useState(initialForm);

    // whenever the modal opens, seed name/email/lot/start/end from parent & session
    useEffect(() => {
        if (isOpen) {
            const user = ApiService.getSessionUser();
            setFormData({
                ...initialForm,
                name: user?.name || "",
                email: user?.email || "",
                lot: lotName,
                start: reservationStart,
                end: reservationEnd,
            });
        }
    }, [isOpen, lotName, reservationStart, reservationEnd]);

    // when it closes, wipe the form back to initial
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialForm);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => {
                onClose();
                // formData will reset automatically via the useEffect above
            }}
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
                            Name: {formData.name}
                            <br />
                            Email: {formData.email}
                            <br />
                            Parking Lot: {formData.lot}
                            <br />
                            Available Spots: {numAvailableSpots}
                            <br />
                            Start:{" "}
                            {formData.start?.toLocaleString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                            <br />
                            End:{" "}
                            {formData.end?.toLocaleString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </p>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Number of Spots</label>
                                <input
                                    type="number"
                                    name="numSpots"
                                    value={formData.numSpots}
                                    onChange={handleInputChange}
                                    min={1}
                                    max={numAvailableSpots}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Explanation (if greater than 1 spot)</label>
                            <textarea
                                name="explanation"
                                value={formData.explanation}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="popup-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    // no extra reset needed, effect will fire
                                }}>
                                Cancel
                            </button>
                            <button type="submit">Confirm</button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default ReservationModal;
