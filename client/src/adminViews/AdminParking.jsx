import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import ParkingManagementPopup from "../components/ParkingManagementPopup";
import "../stylesheets/AdminHome.css";

const AdminParking = () => {
    const [parkingLots, setParkingLots] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(null); // "add" or "edit"
    const [selectedLot, setSelectedLot] = useState(null);

    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                const response = await ApiService.fetchAllParkingLots();
                setParkingLots(response);
            } catch (error) {
                console.error("Failed to fetch parking lots:", error);
            }
        };
        fetchParkingLots();
    }, []);

    const openPopup = (type, lot = null) => {
        setPopupType(type);
        setSelectedLot(lot);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupType(null);
        setSelectedLot(null);
    };

    const handleDelete = async (lotId) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this parking lot?");
        if (!confirmDelete) return; // Exit if the admin cancels the confirmation
    
        try {
            await ApiService.deleteParkingLot(lotId);
            setParkingLots((prevLots) => prevLots.filter((lot) => lot.lotid !== lotId));
        } catch (error) {
            console.error("Failed to delete parking lot:", error);
        }
    };

    return (
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <div className="admin-header">
                    <h1>PARKING-LOT PAGE</h1>
                    <button onClick={() => openPopup("add")}>Add Parking Lot</button>
                </div>
                <div className="user-list-container">
                    <ul className="user-list">
                        {parkingLots.map((lot) => (
                            <li key={lot.lotid} className="user-item">
                                <span>{lot.name} - Capacity: {lot.total_spaces}</span>
                                <span>
                                    <button onClick={() => openPopup("edit", lot)}>Edit</button>
                                    <button onClick={() => handleDelete(lot.lotid)}>Remove</button>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                {showPopup && (
                    <ParkingManagementPopup
                        type={popupType}
                        lot={selectedLot}
                        onClose={closePopup}
                        refreshParkingLots={() => {
                            ApiService.fetchAllParkingLots().then(setParkingLots);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminParking;