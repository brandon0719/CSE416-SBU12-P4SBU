import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

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
    const [userAnalysisData, setUserAnalysisData] = useState(null);

    const [capacityChartType, setCapacityChartType] = useState("bar");
    const [revenueChartType, setRevenueChartType] = useState("bar");
    const [userAnalysisChartType, setUserAnalysisChartType] = useState("bar");

    const admin = ApiService.getSessionUser();

    useEffect(() => {
        if (activeTab === "feedback") {
            fetchFeedbackList(); // Fetch feedback when the feedback tab is active
        } else if (activeTab === "analysis") {
            fetchCapacityData(); // Fetch analysis data when the analysis tab is active
            fetchRevenueData();
            fetchUserAnalysisData();
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

    const fetchUserAnalysisData = async () => {
        try {
            const userAnalysis = await ApiService.fetchUserAnalysis();
            setUserAnalysisData(userAnalysis);
        } catch (error) {
            console.error("Failed to fetch user analysis data:", error);
        }
    };

    const renderChart = (data, labels, title, chartType) => {
        const chartData = {
            labels,
            datasets: [
                {
                    label: title,
                    data,
                    backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
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
                                                        {item.user_type}: ${item.reservation_revenue + item.ticket_revenue}
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
                                                .map((item) => item.reservation_revenue + item.ticket_revenue),
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
                                    <h3>User Analysis</h3>
                                    <button onClick={() => fetchUserAnalysisData()} className="recalculate-button">
                                        Recalculate
                                    </button>
                                    {userAnalysisData ? (
                                        <ul>
                                            {userAnalysisData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => (
                                                    <li key={item.user_type}>
                                                        {item.user_type}: {item.total_reservations} reservations,{" "}
                                                        {item.total_tickets} tickets
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p>Loading user analysis data...</p>
                                    )}
                                </div>
                                <div className="analysis-chart">
                                    <button
                                        onClick={() =>
                                            setUserAnalysisChartType(
                                                userAnalysisChartType === "bar" ? "pie" : "bar"
                                            )
                                        }
                                        className="toggle-chart-button"
                                    >
                                        {userAnalysisChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                    </button>
                                    {userAnalysisData &&
                                        renderChart(
                                            userAnalysisData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => item.total_reservations),
                                            userAnalysisData
                                                .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                .map((item) => item.user_type),
                                            "User Analysis (Reservations)",
                                            userAnalysisChartType
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