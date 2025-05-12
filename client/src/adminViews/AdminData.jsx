import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import refreshIcon from "../images/refresh-icon.svg";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminData.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminData = () => {
    const [activeTab, setActiveTab] = useState("feedback"); // "feedback" or "analysis"
    const [feedback, setFeedback] = useState([]); // Holds the feedback list
    const [selectedFeedback, setSelectedFeedback] = useState(null); // Holds the selected feedback details
    const [message, setMessage] = useState(""); // Holds the admin's message to the user

    // data for each type of analysis
    const [capacityData, setCapacityData] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [ticketData, setTicketData] = useState(null);
    const [reservationData, setReservationData] = useState(null);

    // Holds the selected lot for filtering capacity analysis
    const [selectedLot, setSelectedLot] = useState("All");
    const [lots, setLots] = useState([]);

    // Holds the selected month and revenue type for filtering revenue
    const [revenueType, setRevenueType] = useState("total"); // Default to "total"
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month

    // Holds the chart type for each analysis ex: pie or bar
    const [capacityChartType, setCapacityChartType] = useState("bar");
    const [revenueChartType, setRevenueChartType] = useState("bar");
    const [ticketChartType, setTicketChartType] = useState("bar");
    const [reservationChartType, setReservationChartType] = useState("bar");

    // Holds the data for all the corresponding special graphs
    const [capacityUsageData, setCapacityUsageData] = useState(null);

    const admin = ApiService.getSessionUser(); // Get the admin user from session

    useEffect(() => {
        if (activeTab === "feedback") {
            fetchFeedbackList(); // Fetch feedback when the feedback tab is active
        } else if (activeTab === "analysis") {
            fetchLots();
            fetchCapacityData(); // Fetch analysis data when the analysis tab is active
            fetchRevenueData();
            fetchTicketData();
            fetchReservationData();
            fetchCapacityUsageData();
        }
    }, [activeTab]);

    useEffect(() => {
        fetchCapacityData();
        fetchCapacityUsageData();
    }, [selectedLot]);

    useEffect(() => {
        fetchRevenueData();
    }, [revenueType, selectedMonth]);

    // Fetch the list of feedback
    const fetchFeedbackList = async () => {
        try {
            const response = await ApiService.fetchFeedback();
            setFeedback(response); // Update the feedback state with the fetched data debugging
            // console.log("Fetched feedback:", response); 
            // Debugging line to check fetched data
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
        }
    };

    const fetchLots = async () => {
        try {
            const lots = await ApiService.fetchAllParkingLots();
            setLots(lots);
        } catch (error) {
            console.error("Failed to fetch lots:", error);
        }
    };

    // Fetch the capacity data
    const fetchCapacityData = async () => {
        try {
            const capacity = await ApiService.fetchCapacityAnalysis(selectedLot);
            setCapacityData(capacity);
        } catch (error) {
            console.error("Failed to fetch capacity data:", error);
        }
    };

    const fetchCapacityUsageData = async () => {
        try {
            const usage = await ApiService.fetchCapacityUsage(selectedLot);
            // console.log("Fetched capacity usage data:", usage); // Debugging line
            setCapacityUsageData(usage);
        } catch (error) {
            console.error("Failed to fetch capacity usage data:", error);
        }
    };

    const fetchRevenueData = async () => {
        try {
            const revenue = await ApiService.fetchRevenueAnalysis(revenueType, selectedMonth);
            console.log("Fetched revenue data:", revenue); // Debugging line
            setRevenueData(revenue);
        } catch (error) {
            console.error("Failed to fetch revenue data:", error);
        }
    };

    const fetchTicketData = async () => {
        try {
            const tickets = await ApiService.fetchTicketAnalysis();
            setTicketData(tickets);
        } catch (error) {
            console.error("Failed to fetch ticket analysis:", error);
        }
    };

    const fetchReservationData = async () => {
        try {
            const reservations = await ApiService.fetchReservationAnalysis();
            setReservationData(reservations);
        } catch (error) {
            console.error("Failed to fetch reservation analysis:", error);
        }
    };

    const renderProgressBar = (used, total, label) => {
        const percentage = ((used / total) * 100).toFixed(2);
        if (total === 0) {
            return (
                <div className="admin-data-progress-bar-container">
                    <div className="progress-bar-label">
                        {label}: none
                    </div>
                    <div className="admin-data-progress-bar">
                        <div
                            className="admin-data-progress-bar-fill"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            );
        }
        return (
            <div className="admin-data-progress-bar-container">
                <div className="progress-bar-label">
                    {label}: {used}/{total} ({percentage}%)
                </div>
                <div className="admin-data-progress-bar">
                    <div
                        className="admin-data-progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    const renderChart = (data, labels, title, chartType) => {
        const numericData = data.map(Number); // Ensure data is numeric
        console.log("Numeric Data for", title, "chart:", numericData);

        const chartData = {
            labels,
            datasets: [
                {
                    label: title,
                    data: numericData,
                    backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        if (total === 0) return "0.0%"; // Handle cases where total is 0
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    color: "#fff",
                    font: {
                        weight: "bold",
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            if (total === 0) return `${context.label}: 0 (0.0%)`;
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        },
                    },
                },
            },
        };

        return chartType === "bar" ? (
            <Bar data={chartData} options={options} />
        ) : (
            <Pie data={chartData} options={options} />
        );
    };

    // Fetch details of a specific feedback item
    const handleViewFeedback = async (feedbackId) => {
        try {
            const response = await ApiService.getFeedbackDetails(feedbackId);
            // console.log("Fetched feedback details:", response);
            // Debugging line to check fetched data
            setSelectedFeedback(response); // Update the selected feedback state
        } catch (error) {
            console.error("Failed to fetch feedback details:", error);
        }
    };

    // Resolve a feedback item and send a message to the user
    const handleResolveFeedback = async () => {
        try {
            await ApiService.resolveFeedback(selectedFeedback.feedback_id, message, admin.user_id, selectedFeedback.user_id);
            setSelectedFeedback(null); // Close the modal
            fetchFeedbackList(); // Refresh the feedback list
        } catch (error) {
            console.error("Failed to resolve feedback:", error);
        }
    };

    return (
        <div className="admin-data-container">
            <Header />
            <AdminNav />
            <div className="admin-data-content">
                <div className="admin-data-tabs">
                    <button
                        className={activeTab === "feedback" ? "admin-data-active-tab" : ""}
                        onClick={() => setActiveTab("feedback")}
                    >
                        User Feedback
                    </button>
                    <button
                        className={activeTab === "analysis" ? "admin-data-active-tab" : ""}
                        onClick={() => setActiveTab("analysis")}
                    >
                        Data Analysis
                    </button>
                </div>
                <div className="admin-data-tab-content">
                    {activeTab === "feedback" && (
                        <div className="admin-data-feedback-tab">
                            <ul className="admin-data-feedback-list">
                                {feedback.map((item) => (
                                    <li key={item.feedback_id} className="admin-data-feedback-item">
                                        <div className="admin-data-feedback-row">
                                            <p><strong>Topic:</strong> {item.topic}</p>
                                            <p><strong>Submitted By:</strong> {item.name}, {item.user_type}</p>
                                            <p><strong>Date:</strong> {new Date(item.creation_date).toLocaleString()}</p>
                                            <p><strong>Resolved:</strong> {item.resolved ? "Yes" : "No"}</p>
                                            <button onClick={() => handleViewFeedback(item.feedback_id)}>View</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {selectedFeedback && (
                                <Modal
                                    isOpen={!!selectedFeedback}
                                    onRequestClose={() => setSelectedFeedback(null)}
                                    className="admin-data-popup"
                                    overlayClassName="admin-data-modal-overlay"
                                    appElement={document.getElementById("root")}
                                >
                                    <div className="admin-data-feedback-modal">
                                        <h2>Feedback Details</h2>
                                        <div className="admin-data-feedback-details">
                                            <p><strong>Topic:</strong> {selectedFeedback.topic}</p>
                                            <p><strong>Submitted on:</strong> {new Date(selectedFeedback.creation_date).toLocaleString()}</p>
                                            <p><strong>Submitted By:</strong> {selectedFeedback.name}</p>
                                            <p><strong>Details:</strong> {selectedFeedback.details}</p>
                                        </div>
                                        <textarea
                                            placeholder="Write a message to the user..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="admin-data-message-textarea"
                                        />
                                        <div className="admin-data-modal-actions">
                                            <button onClick={handleResolveFeedback}>Resolve</button>
                                            <button onClick={() => setSelectedFeedback(null)}>Close</button>
                                        </div>
                                    </div>
                                </Modal>
                            )}
                        </div>
                    )}
                    {activeTab === "analysis" && (
                        <div className="admin-data-analysis-tab">
                            {/* Capacity Analysis */}
                            <div className="admin-data-analysis-section">
                                <div className="admin-data-analysis-header">
                                    <h3>Capacity Analysis</h3>
                                    <img
                                        src={refreshIcon}
                                        alt="Refresh"
                                        className="admin-data-refresh-icon"
                                        onClick={() => {
                                            fetchCapacityData();
                                            fetchCapacityUsageData();
                                        }}
                                    />
                                </div>
                                <div className="admin-data-analysis-body">
                                    <div className="admin-data-analysis-text">
                                        <div className="admin-data-lot-dropdown">
                                            <div
                                                className={`admin-data-lot-option ${selectedLot === "All" ? "selected" : ""
                                                    }`}
                                                onClick={() => setSelectedLot("All")}
                                            >
                                                All Parking Lots
                                            </div>
                                            {lots.map((lot) => (
                                                <div
                                                    key={lot.lotid}
                                                    className={`admin-data-lot-option ${selectedLot === lot.name ? "selected" : ""
                                                        }`}
                                                    onClick={() => setSelectedLot(lot.name)}
                                                >
                                                    {lot.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="admin-data-analysis-chart">
                                        <button
                                            onClick={() =>
                                                setCapacityChartType(capacityChartType === "bar" ? "pie" : "bar")
                                            }
                                            className="admin-data-toggle-chart-button"
                                        >
                                            {capacityChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                        </button>
                                        {capacityData &&
                                            renderChart(
                                                [
                                                    capacityData.commuter_capacity,
                                                    capacityData.faculty_capacity,
                                                    capacityData.resident_capacity,
                                                    capacityData.visitor_capacity,
                                                ],
                                                ["Commuter", "Faculty", "Resident", "Visitor"],
                                                "Capacity",
                                                capacityChartType
                                            )}
                                    </div>
                                    <div className="admin-data-analysis-unique-data">
                                        {capacityUsageData ? (
                                            <div className="admin-data-progress-bars">
                                                {renderProgressBar(
                                                    capacityUsageData.commuter_used,
                                                    capacityData.commuter_capacity,
                                                    "Commuter"
                                                )}
                                                {renderProgressBar(
                                                    capacityUsageData.faculty_used,
                                                    capacityData.faculty_capacity,
                                                    "Faculty"
                                                )}
                                                {renderProgressBar(
                                                    capacityUsageData.resident_used,
                                                    capacityData.resident_capacity,
                                                    "Resident"
                                                )}
                                                {renderProgressBar(
                                                    capacityUsageData.visitor_used,
                                                    capacityData.visitor_capacity,
                                                    "Visitor"
                                                )}
                                            </div>
                                        ) : (
                                            <p>Loading usage data...</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Analysis */}
                            <div className="admin-data-analysis-section">
                                <div className="admin-data-analysis-header">
                                    <h3>Revenue Analysis</h3>
                                    <img
                                        src={refreshIcon}
                                        alt="Refresh"
                                        className="admin-data-refresh-icon"
                                        onClick={() => fetchRevenueData()}
                                    />
                                </div>
                                <div className="admin-data-analysis-body">
                                    <div className="admin-data-analysis-text">

                                        <div className="admin-data-revenue-dropdown">
                                            <div
                                                className={`admin-data-lot-option ${revenueType === "total" ? "selected" : ""}`}
                                                onClick={() => setRevenueType("total")}
                                            >
                                                Total Revenue
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${revenueType === "ticket" ? "selected" : ""}`}
                                                onClick={() => setRevenueType("ticket")}
                                            >
                                                Ticket Revenue
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${revenueType === "reservation" ? "selected" : ""}`}
                                                onClick={() => setRevenueType("reservation")}
                                            >
                                                Reservation Revenue
                                            </div>
                                        </div>

                                        <div className="admin-data-month-dropdown">
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 1 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(1)}
                                            >
                                                January
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 2 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(2)}
                                            >
                                                February
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 3 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(3)}
                                            >
                                                March
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 4 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(4)}
                                            >
                                                April
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 5 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(5)}
                                            >
                                                May
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 6 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(6)}
                                            >
                                                June
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 7 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(7)}
                                            >
                                                July
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 8 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(8)}
                                            >
                                                August
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 9 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(9)}
                                            >
                                                September
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 10 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(10)}
                                            >
                                                October
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 11 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(11)}
                                            >
                                                November
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${selectedMonth === 12 ? "selected" : ""}`}
                                                onClick={() => setSelectedMonth(12)}
                                            >
                                                December
                                            </div>
                                        </div>

                                    </div>
                                    <div className="admin-data-analysis-chart">
                                        <button
                                            onClick={() =>
                                                setRevenueChartType(revenueChartType === "bar" ? "pie" : "bar")
                                            }
                                            className="admin-data-toggle-chart-button"
                                        >
                                            {revenueChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                        </button>
                                        {revenueData &&
                                            renderChart(
                                                revenueData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => (item.revenue)),
                                                revenueData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.user_type),
                                                "Revenue",
                                                revenueChartType
                                            )}
                                    </div>
                                    <div className="admin-data-analysis-unique-data">
                                        <p>Placeholder for Revenue Analysis unique data</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Analysis */}
                            <div className="admin-data-analysis-section">
                                <div className="admin-data-analysis-header">
                                    <h3>Ticket Analysis</h3>
                                    <img
                                        src={refreshIcon}
                                        alt="Refresh"
                                        className="admin-data-refresh-icon"
                                        onClick={() => fetchTicketData()}
                                    />
                                </div>
                                <div className="admin-data-analysis-body">
                                    <div className="admin-data-analysis-text">
                                        {ticketData ? (
                                            <ul>
                                                {ticketData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => (
                                                        <li key={item.user_type}>
                                                            {item.user_type}: {item.total_tickets}
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p>Loading ticket data...</p>
                                        )}
                                    </div>
                                    <div className="admin-data-analysis-chart">
                                        <button
                                            onClick={() =>
                                                setTicketChartType(ticketChartType === "bar" ? "pie" : "bar")
                                            }
                                            className="admin-data-toggle-chart-button"
                                        >
                                            {ticketChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                        </button>
                                        {ticketData &&
                                            renderChart(
                                                ticketData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.total_tickets),
                                                ticketData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.user_type),
                                                "Tickets",
                                                ticketChartType
                                            )}
                                    </div>
                                    <div className="admin-data-analysis-unique-data">
                                        <p>Placeholder for Ticket Analysis unique data</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reservation Analysis */}
                            <div className="admin-data-analysis-section">
                                <div className="admin-data-analysis-header">
                                    <h3>Reservation Analysis</h3>
                                    <img
                                        src={refreshIcon}
                                        alt="Refresh"
                                        className="admin-data-refresh-icon"
                                        onClick={() => fetchReservationData()}
                                    />
                                </div>
                                <div className="admin-data-analysis-body">
                                    <div className="admin-data-analysis-text">
                                        {reservationData ? (
                                            <ul>
                                                {reservationData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => (
                                                        <li key={item.user_type}>
                                                            {item.user_type}: {item.total_reservations}
                                                        </li>
                                                    ))}
                                            </ul>
                                        ) : (
                                            <p>Loading reservation data...</p>
                                        )}
                                    </div>
                                    <div className="admin-data-analysis-chart">
                                        <button
                                            onClick={() =>
                                                setReservationChartType(reservationChartType === "bar" ? "pie" : "bar")
                                            }
                                            className="admin-data-toggle-chart-button"
                                        >
                                            {reservationChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                        </button>
                                        {reservationData &&
                                            renderChart(
                                                reservationData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.total_reservations),
                                                reservationData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.user_type),
                                                "Reservations",
                                                reservationChartType
                                            )}
                                    </div>
                                    <div className="admin-data-analysis-unique-data">
                                        <p>Placeholder for Reservation Analysis unique data</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminData;