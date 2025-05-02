import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import ParkingManagementPopup from "../components/ParkingManagementPopup";
import "../stylesheets/AdminHome.css";

const AdminParking = () => {
    const [parkingLots, setParkingLots] = useState([]);
    const [sortedParkingLots, setSortedParkingLots] = useState([]); // State for sorted parking lots
    const [sortCriteria, setSortCriteria] = useState("default"); // Sorting criteria
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(null); // "add" or "edit"
    const [selectedLot, setSelectedLot] = useState(null);

    useEffect(() => {
        const fetchParkingLots = async () => {
            try {
                const response = await ApiService.fetchAllParkingLots();
                setParkingLots(response);
                setSortedParkingLots(response); // Initialize sorted parking lots
            } catch (error) {
                console.error("Failed to fetch parking lots:", error);
            }
        };
        fetchParkingLots();
    }, []);

    useEffect(() => {
        sortParkingLots(sortCriteria);
    }, [sortCriteria, parkingLots]);

    const sortParkingLots = (criteria) => {
        let sorted = [...parkingLots];
        if (criteria === "alphabetical") {
            sorted = sorted.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical order
        } else if (criteria === "totalSpaces") {
            sorted = sorted.sort((a, b) => b.total_spaces - a.total_spaces); // Total spaces descending
        }
        setSortedParkingLots(sorted);
    };

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
                    <h1>Parking Lots</h1>
                    <div className="admin-header-actions">
                        <div className="sorting-options">
                            <label htmlFor="sort-criteria">Sort by:</label>
                            <select
                                id="sort-criteria"
                                value={sortCriteria}
                                onChange={(e) => setSortCriteria(e.target.value)}
                            >
                                <option value="default">Default</option>
                                <option value="alphabetical">Alphabetical</option>
                                <option value="totalSpaces">Total Spaces</option>
                            </select>
                        </div>
                        <button onClick={() => openPopup("add")}>Add Parking Lot</button>
                    </div>
                </div>
                <div className="user-list-container">
                    <ul className="user-list">
                        {sortedParkingLots.map((lot) => (
                            <li key={lot.lotid} className="user-item">
                                <span>{lot.name} - Capacity: {lot.total_spaces}</span>
                                <span>
                                    <button className="approve-button" onClick={() => openPopup("edit", lot)}>Edit Lot</button>
                                    <button className="delete-button" onClick={() => handleDelete(lot.lotid)}>Remove Lot</button>
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