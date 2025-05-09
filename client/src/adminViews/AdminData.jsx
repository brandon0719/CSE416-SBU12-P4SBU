import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminData = () => {
    const [activeTab, setActiveTab] = useState("feedback"); // "feedback" or "analysis"
    const [feedback, setFeedback] = useState([]); // Holds the feedback list
    const [selectedFeedback, setSelectedFeedback] = useState(null); // Holds the selected feedback details
    const [message, setMessage] = useState(""); // Holds the admin's message to the user

    const [capacityData, setCapacityData] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [ticketData, setTicketData] = useState(null);
    const [reservationData, setReservationData] = useState(null);


    const [capacityChartType, setCapacityChartType] = useState("bar");
    const [revenueChartType, setRevenueChartType] = useState("bar");
    const [ticketChartType, setTicketChartType] = useState("bar");
    const [reservationChartType, setReservationChartType] = useState("bar");

    const admin = ApiService.getSessionUser();

    useEffect(() => {
        if (activeTab === "feedback") {
            fetchFeedbackList(); // Fetch feedback when the feedback tab is active
        } else if (activeTab === "analysis") {
            fetchCapacityData(); // Fetch analysis data when the analysis tab is active
            fetchRevenueData();
            fetchTicketData();
            fetchReservationData();
        }
    }, [activeTab]);


    // Fetch the list of feedback
    const fetchFeedbackList = async () => {
        try {
            const response = await ApiService.fetchFeedback();
            setFeedback(response); // Update the feedback state with the fetched data debugging
            console.log("Fetched feedback:", response); // Debugging line to check fetched data
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
        }
    };

    const fetchCapacityData = async () => {
        try {
            const capacity = await ApiService.fetchCapacityAnalysis();
            setCapacityData(capacity);
        } catch (error) {
            console.error("Failed to fetch capacity data:", error);
        }
    };

    const fetchRevenueData = async () => {
        try {
            const revenue = await ApiService.fetchRevenueAnalysis();
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
        <div className="admin-page-container">
            <Header />
            <AdminNav />
            <div className="admin-page-content">
                <div className="tabs">
                    <button
                        className={activeTab === "feedback" ? "active-tab" : ""}
                        onClick={() => setActiveTab("feedback")}
                    >
                        User Feedback
                    </button>
                    <button
                        className={activeTab === "analysis" ? "active-tab" : ""}
                        onClick={() => setActiveTab("analysis")}
                    >
                        Data Analysis
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === "feedback" && (
                        <div className="feedback-tab">
                            <ul className="feedback-list">
                                {feedback.map((item) => (
                                    <li key={item.feedback_id} className="feedback-item">
                                        <div className="feedback-row">
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
                                    className="feedback-modal"
                                    overlayClassName="modal-overlay"
                                    appElement={document.getElementById("root")}
                                >
                                    <div className="modal-content">
                                        <h2>Feedback Details</h2>
                                        <div className="feedback-details">
                                            <p><strong>Topic:</strong> {selectedFeedback.topic}</p>
                                            <p><strong>Details:</strong> {selectedFeedback.details}</p>
                                        </div>
                                        <textarea
                                            placeholder="Write a message to the user..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="message-textarea"
                                        />
                                        <div className="modal-actions">
                                            <button onClick={handleResolveFeedback}>Resolve</button>
                                            <button onClick={() => setSelectedFeedback(null)}>Close</button>
                                        </div>
                                    </div>
                                </Modal>
                            )}
                        </div>
                    )}
                    {activeTab === "analysis" && (
                        <div className="analysis-tab">
                            {/* Capacity Analysis */}
                            <div className="analysis-section">
                                <div className="analysis-text">
                                    <h3>Capacity Analysis</h3>
                                    <button onClick={() => fetchCapacityData()} className="recalculate-button">
                                        Recalculate
                                    </button>
                                    {capacityData ? (
                                        <ul>
                                            <li>Faculty: {capacityData.faculty_capacity}</li>
                                            <li>Commuter: {capacityData.commuter_capacity}</li>
                                            <li>Resident: {capacityData.resident_capacity}</li>
                                            <li>Visitor: {capacityData.visitor_capacity}</li>
                                        </ul>
                                    ) : (
                                        <p>Loading capacity data...</p>
                                    )}
                                </div>
                                <div className="analysis-chart">
                                    <button
                                        onClick={() =>
                                            setCapacityChartType(capacityChartType === "bar" ? "pie" : "bar")
                                        }
                                        className="toggle-chart-button"
                                    >
                                        {capacityChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                    </button>
                                    {capacityData &&
                                        renderChart(
                                            [
                                                capacityData.faculty_capacity,
                                                capacityData.commuter_capacity,
                                                capacityData.resident_capacity,
                                                capacityData.visitor_capacity,
                                            ],
                                            ["Faculty", "Commuter", "Resident", "Visitor"],
                                            "Capacity",
                                            capacityChartType
                                        )}
                                </div>
                            </div>
                            {/* Revenue Analysis */}
                            <div className="analysis-section">
                                <div className="analysis-text">
                                    <h3>Revenue Analysis</h3>
                                    <button onClick={() => fetchRevenueData()} className="recalculate-button">
                                        Recalculate
                                    </button>
                                    {revenueData ? (
                                        <ul>
                                            {revenueData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => (
                                                    <li key={item.user_type}>
                                                        {item.user_type}:
                                                        Reservation Revenue: ${parseFloat(item.reservation_revenue).toFixed(2)} <br />
                                                        Ticket Revenue: ${parseFloat(item.ticket_revenue).toFixed(2)}
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p>Loading revenue data...</p>
                                    )}
                                </div>
                                <div className="analysis-chart">
                                    <button
                                        onClick={() =>
                                            setRevenueChartType(revenueChartType === "bar" ? "pie" : "bar")
                                        }
                                        className="toggle-chart-button"
                                    >
                                        {revenueChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                    </button>
                                    {revenueData &&
                                        renderChart(
                                            revenueData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => parseFloat(item.reservation_revenue) + parseFloat(item.ticket_revenue)),
                                            revenueData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => item.user_type),
                                            "Revenue",
                                            revenueChartType
                                        )}
                                </div>
                            </div>

                            {/* User Analysis */}
                            <div className="analysis-section">
                                <div className="analysis-text">
                                    <h3>Ticket Analysis</h3>
                                    <button onClick={() => fetchTicketData()} className="recalculate-button">
                                        Recalculate
                                    </button>
                                    {ticketData ? (
                                        <ul>
                                            {ticketData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => (
                                                    <li key={item.user_type}>
                                                        {item.user_type}: {item.total_tickets} tickets

                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p>Loading ticket data...</p>
                                    )}
                                </div>
                                <div className="analysis-chart">
                                    <button
                                        onClick={() =>
                                            setTicketChartType(
                                                ticketChartType === "bar" ? "pie" : "bar"
                                            )
                                        }
                                        className="toggle-chart-button"
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
                                            "User Analysis (Reservations)",
                                            ticketChartType
                                        )}
                                </div>
                            </div>

                            {/* Reservation Analysis */}
                            <div className="analysis-section">
                                <div className="analysis-text">
                                    <h3>Reservation Analysis</h3>
                                    <button onClick={() => fetchReservationData()} className="recalculate-button">
                                        Recalculate
                                    </button>
                                    {reservationData ? (
                                        <ul>
                                            {reservationData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => (
                                                    <li key={item.user_type}>
                                                        {item.user_type}: {item.total_reservations} reservations
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p>Loading reservation data...</p>
                                    )}
                                </div>
                                <div className="analysis-chart">
                                    <button
                                        onClick={() =>
                                            setReservationChartType(
                                                reservationChartType === "bar" ? "pie" : "bar"
                                            )
                                        }
                                        className="toggle-chart-button"
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
                                            "Reservation Analysis",
                                            reservationChartType
                                        )}
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