import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminParkingPop.css";

const ParkingManagementPopup = ({ type, lot, onClose, refreshParkingLots }) => {
    const [formData, setFormData] = useState({
        campus: "",
        name: "",
        total_spaces: "",
        faculty_staff_spots: "",
        commuter_premium_spots: "",
        metered_spots: "",
        commuter_spots: "",
        resident_spots: "",
        geom: "",
        details: "",
        rate: "",
    });

    useEffect(() => {
        if (type === "edit" && lot) {
            setFormData({
                campus: lot.campus || "",
                name: lot.name || "",
                total_spaces: lot.total_spaces || "",
                faculty_staff_spots: lot.faculty_staff_spots || "",
                commuter_premium_spots: lot.commuter_premium_spots || "",
                metered_spots: lot.metered_spots || "",
                commuter_spots: lot.commuter_spots || "",
                resident_spots: lot.resident_spots || "",
                geom: lot.geom || "",
                details: lot.details || "",
                rate: lot.rate || "",
            });
        }
    }, [type, lot]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        if (!formData.campus || !formData.name || !formData.total_spaces) {
            alert("Please fill out all required fields: Campus, Name, and Total Spaces.");
            return;
        }

        const sanitizedData = {
            ...formData,
            faculty_staff_spots: formData.faculty_staff_spots || null,
            commuter_premium_spots: formData.commuter_premium_spots || null,
            metered_spots: formData.metered_spots || null,
            commuter_spots: formData.commuter_spots || null,
            resident_spots: formData.resident_spots || null,
            geom: formData.geom || null,
            details: formData.details || null,
            rate: formData.rate || null,
        };

        console.log("Submitting form data:", formData); // Log the form data
        try {
            if (type === "add") {
                await ApiService.addParkingLot(sanitizedData);
            } else if (type === "edit") {
                await ApiService.editParkingLot(lot.lotid, sanitizedData);
            }
            refreshParkingLots();
            onClose();
        } catch (error) {
            console.error(`Failed to ${type} parking lot:`, error);
        }
    };

    return (
        <div className="parking-popup popup">
            <form className="popup-form">
                <h2>{type === "add" ? "Add Parking Lot" : "Edit Parking Lot"}</h2>
                <div className="form-columns">
                    <div className="form-column">
                        <label>
                            Campus (Required):
                            <input
                                type="text"
                                name="campus"
                                placeholder="Campus"
                                value={formData.campus}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Name (Required):
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Total Spaces (Required):
                            <input
                                type="number"
                                name="total_spaces"
                                placeholder="Total Spaces"
                                value={formData.total_spaces}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Faculty/Staff Spots:
                            <input
                                type="number"
                                name="faculty_staff_spots"
                                placeholder="Faculty/Staff Spots"
                                value={formData.faculty_staff_spots}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Commuter Premium Spots:
                            <input
                                type="number"
                                name="commuter_premium_spots"
                                placeholder="Commuter Premium Spots"
                                value={formData.commuter_premium_spots}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div className="form-column">
                        <label>
                            Metered Spots:
                            <input
                                type="number"
                                name="metered_spots"
                                placeholder="Metered Spots"
                                value={formData.metered_spots}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Commuter Spots:
                            <input
                                type="number"
                                name="commuter_spots"
                                placeholder="Commuter Spots"
                                value={formData.commuter_spots}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Resident Spots:
                            <input
                                type="number"
                                name="resident_spots"
                                placeholder="Resident Spots"
                                value={formData.resident_spots}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Geometry (GeoJSON):
                            <textarea
                                name="geom"
                                placeholder="Geometry (GeoJSON)"
                                value={formData.geom}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Details:
                            <textarea
                                name="details"
                                placeholder="Details"
                                value={formData.details}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Rate ($/hr):
                            <input
                                type="number"
                                name="rate"
                                placeholder="Rate ($/hr)"
                                value={formData.rate}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                </div>
                <div className="popup-actions">
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ParkingManagementPopup;