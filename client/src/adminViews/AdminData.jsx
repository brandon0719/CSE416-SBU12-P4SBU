import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import refreshIcon from "../images/refresh-icon.svg";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminData.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

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
    const [revenueSelectedMonth, setRevenueSelectedMonth] = useState(new Date().getMonth() + 1);


    // Holds the daily revenue data for the selected month
    const [dailyRevenueData, setDailyRevenueData] = useState([]);
    const [dailyTicketData, setDailyTicketData] = useState([]);
    const [dailyReservationData, setDailyReservationData] = useState([]);


    // Holds all the info for ticket and reservations
    const [ticketReservationType, setTicketReservationType] = useState("ticket");
    const [ticketReservationSelectedMonth, setTicketReservationSelectedMonth] = useState(new Date().getMonth() + 1); // For Ticket & Reservation Analysis

    // Holds the chart type for each analysis ex: pie or bar
    const [capacityChartType, setCapacityChartType] = useState("bar");
    const [revenueChartType, setRevenueChartType] = useState("bar");
    const [ticketReservationChartType, setTicketReservationChartType] = useState("bar");
    const [userChartType, setUserChartType] = useState("bar");

    const [userTypeCounts, setUserTypeCounts] = useState([]);
    const [dailyFeedbackCounts, setDailyFeedbackCounts] = useState([]);
    const [userAnalysisSelectedMonth, setUserAnalysisSelectedMonth] = useState(new Date().getMonth() + 1);

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
            fetchDailyRevenueData();
            fetchCapacityUsageData();
        }
    }, [activeTab]);

    useEffect(() => {
        fetchCapacityData();
        fetchCapacityUsageData();
    }, [selectedLot]);

    useEffect(() => {
        fetchRevenueData();
        fetchDailyRevenueData();
    }, [revenueType, revenueSelectedMonth]);

    useEffect(() => {
        if (ticketReservationType === "ticket") {
            fetchTicketData
            fetchDailyTicketData();
        } else {
            fetchReservationData();
            fetchDailyReservationData();
        }
    }, [ticketReservationType, ticketReservationSelectedMonth]);

    useEffect(() => {
        fetchUserTypeCounts();
        fetchDailyFeedbackCounts();
    }, [userAnalysisSelectedMonth]);

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
            const revenue = await ApiService.fetchRevenueAnalysis(revenueType, revenueSelectedMonth);
            console.log("Fetched revenue data:", revenue); // Debugging line
            setRevenueData(revenue);
        } catch (error) {
            console.error("Failed to fetch revenue data:", error);
        }
    };

    const fetchDailyRevenueData = async () => {
        try {
            const data = await ApiService.fetchDailyRevenueAnalysis(revenueType, revenueSelectedMonth);
            setDailyRevenueData(data);
        } catch (error) {
            console.error("Failed to fetch daily revenue data:", error);
        }
    };

    const fetchTicketData = async () => {
        try {
            const tickets = await ApiService.fetchTicketAnalysis(ticketReservationSelectedMonth);
            setTicketData(tickets);
        } catch (error) {
            console.error("Failed to fetch ticket analysis:", error);
        }
    };

    const fetchDailyTicketData = async () => {
        try {
            const tickets = await ApiService.fetchDailyTicketAnalysis(ticketReservationSelectedMonth);
            setDailyTicketData(tickets);
        } catch (error) {
            console.error("Failed to fetch daily ticket analysis:", error);
        }
    };

    const fetchReservationData = async () => {
        try {
            const reservations = await ApiService.fetchReservationAnalysis(ticketReservationSelectedMonth);
            setReservationData(reservations);
        } catch (error) {
            console.error("Failed to fetch reservation analysis:", error);
        }
    };

    const fetchDailyReservationData = async () => {
        try {
            const reservations = await ApiService.fetchDailyReservationAnalysis(ticketReservationSelectedMonth);
            setDailyReservationData(reservations);
        } catch (error) {
            console.error("Failed to fetch daily reservation analysis:", error);
        }
    };

    const fetchUserTypeCounts = async () => {
        try {
            const data = await ApiService.fetchUserTypeCounts();
            setUserTypeCounts(data);
        } catch (error) {
            console.error("Failed to fetch user type counts:", error);
        }
    };

    const fetchDailyFeedbackCounts = async () => {
        try {
            const data = await ApiService.fetchDailyFeedbackCounts(userAnalysisSelectedMonth);
            setDailyFeedbackCounts(data);
        } catch (error) {
            console.error("Failed to fetch daily feedback counts:", error);
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

    const renderLineChart = () => {
        if (!dailyRevenueData || dailyRevenueData.length === 0) {
            return <p>No daily revenue data available.</p>;
        }

        // Helper function to format a date as YYYY-MM-DD without any extra libraries
        const formatDate = (date) => {
            const d = new Date(date);
            const month = '' + (d.getMonth() + 1);
            const day = '' + d.getDate();
            return [month.padStart(2, '0'), day.padStart(2, '0')].join('-');
        };

        // Create a set of unique day labels from the raw data
        const uniqueDatesSet = new Set();
        dailyRevenueData.forEach(row => {
            uniqueDatesSet.add(formatDate(row.day));
        });
        const labels = Array.from(uniqueDatesSet).sort();

        // Group revenue data by user_type (using day string as key)
        const groupedData = {};
        dailyRevenueData.forEach(row => {
            const type = row.user_type;
            const dateKey = formatDate(row.day);
            const revenueValue =
                revenueType === "ticket"
                    ? parseFloat(row.ticket_revenue)
                    : revenueType === "reservation"
                        ? parseFloat(row.reservation_revenue)
                        : parseFloat(row.reservation_revenue) + parseFloat(row.ticket_revenue);
            if (!groupedData[type]) {
                groupedData[type] = {};
            }
            groupedData[type][dateKey] = (groupedData[type][dateKey] || 0) + revenueValue;
        });

        // Prepare datasets for the chart
        const datasets = Object.keys(groupedData).map(userType => {
            const dataArray = labels.map(day => groupedData[userType][day] || 0);
            let borderColor;
            switch (userType) {
                case "Commuter":
                    borderColor = "blue";
                    break;
                case "Faculty":
                    borderColor = "green";
                    break;
                case "Resident":
                    borderColor = "orange";
                    break;
                case "Visitor":
                    borderColor = "red";
                    break;
                default:
                    borderColor = "gray";
                    break;
            }
            return {
                label: userType,
                data: dataArray,
                borderColor: borderColor,
                backgroundColor: borderColor,
                fill: false,
                tension: 0.1,
            };
        });

        const chartData = {
            labels,
            datasets,
        };

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: { position: "top" },
            },
            scales: {
                x: {
                    title: {
                        display: false,
                        text: "Day",
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Revenue ($)",
                    },
                },
            },
        };

        return (
            <div className="line-chart-container">
                <Line key={`${revenueType}-${revenueSelectedMonth}`} data={chartData} options={chartOptions} />
            </div>
        );
    };

    const renderTRLineChart = () => {
        const data = ticketReservationType === "ticket" ? dailyTicketData : dailyReservationData;

        if (!data || data.length === 0) {
            return <p>No data available for the selected month.</p>;
        }

        // Helper function to format a date as YYYY-MM-DD
        const formatDate = (date) => {
            const d = new Date(date);
            const month = '' + (d.getMonth() + 1);
            const day = '' + d.getDate();
            const year = d.getFullYear();
            return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
        };

        // Create a set of unique day labels from the raw data
        const uniqueDatesSet = new Set();
        data.forEach(row => {
            uniqueDatesSet.add(formatDate(row.day));
        });
        const labels = Array.from(uniqueDatesSet).sort();

        // Group data by user_type (using day string as key)
        const groupedData = {};
        data.forEach(row => {
            const type = row.user_type;
            const dateKey = formatDate(row.day);
            const value = ticketReservationType === "ticket" ? row.total_tickets : row.total_reservations;
            if (!groupedData[type]) {
                groupedData[type] = {};
            }
            groupedData[type][dateKey] = (groupedData[type][dateKey] || 0) + value;
        });

        // Prepare datasets for the chart
        const datasets = Object.keys(groupedData).map(userType => {
            const dataArray = labels.map(day => groupedData[userType][day] || 0);
            let borderColor;
            switch (userType) {
                case "Commuter":
                    borderColor = "blue";
                    break;
                case "Faculty":
                    borderColor = "green";
                    break;
                case "Resident":
                    borderColor = "orange";
                    break;
                case "Visitor":
                    borderColor = "red";
                    break;
                default:
                    borderColor = "gray";
                    break;
            }
            return {
                label: userType,
                data: dataArray,
                borderColor: borderColor,
                backgroundColor: borderColor,
                fill: false,
                tension: 0.1,
            };
        });

        const chartData = {
            labels,
            datasets,
        };

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
            },
            scales: {
                x: {
                    title: {
                        display: false,
                        text: "Day",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: ticketReservationType === "ticket" ? "Tickets" : "Reservations",
                    },
                },
            },
        };

        return (
            <div className="line-chart-container">
                <Line key={`${ticketReservationType}-${ticketReservationSelectedMonth}`} data={chartData} options={chartOptions} />
            </div>
        );
    };

    const renderUFLineChart = () => {
        if (!dailyFeedbackCounts || dailyFeedbackCounts.length === 0) {
            return <p>No feedback data available for the selected month.</p>;
        }

        // Helper function to format a date as YYYY-MM-DD
        const formatDate = (date) => {
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${month}-${day}`;
        };

        // Format the day field for each feedback count
        const formattedData = dailyFeedbackCounts.map((item) => ({
            ...item,
            day: formatDate(item.day),
        }));

        return (
            <div className="line-chart-container">
                <Line
                    data={{
                        labels: formattedData.map((item) => item.day),
                        datasets: [
                            {
                                label: "Daily Feedbacks",
                                data: formattedData.map((item) => item.total_feedbacks),
                                borderColor: "blue",
                                backgroundColor: "blue",
                                fill: false,
                                tension: 0.1,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: "bottom" },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: false,
                                    text: "Day",
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Feedbacks",
                                },
                            },
                        },
                    }}
                />
            </div>
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

                                        {/* Selector for Month in Revenue Analysis */}
                                        <div className="admin-data-month-dropdown">
                                            {[...Array(12)].map((_, index) => (
                                                <div
                                                    key={index + 1}
                                                    className={`admin-data-lot-option ${revenueSelectedMonth === index + 1 ? "selected" : ""}`}
                                                    onClick={() => setRevenueSelectedMonth(index + 1)}
                                                >
                                                    {new Date(0, index).toLocaleString("default", { month: "long" })}
                                                </div>
                                            ))}
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
                                        {renderLineChart()}
                                    </div>
                                </div>
                            </div>

                            {/* Ticket & Reservation Analysis Section */}
                            <div className="admin-data-analysis-section">
                                <div className="admin-data-analysis-header">
                                    <h3>Ticket & Reservation Analysis</h3>
                                    <img
                                        src={refreshIcon}
                                        alt="Refresh"
                                        className="admin-data-refresh-icon"
                                        onClick={() => {
                                            fetchTicketData();
                                            fetchReservationData();
                                        }}
                                    />
                                </div>
                                <div className="admin-data-analysis-body">
                                    <div className="admin-data-analysis-text">
                                        {/* Selector for Ticket or Reservation */}
                                        <div className="admin-data-revenue-dropdown">
                                            <div
                                                className={`admin-data-lot-option ${ticketReservationType === "ticket" ? "selected" : ""}`}
                                                onClick={() => setTicketReservationType("ticket")}
                                            >
                                                Ticket
                                            </div>
                                            <div
                                                className={`admin-data-lot-option ${ticketReservationType === "reservation" ? "selected" : ""}`}
                                                onClick={() => setTicketReservationType("reservation")}
                                            >
                                                Reservation
                                            </div>
                                        </div>

                                        {/* Selector for Month */}
                                        <div className="admin-data-month-dropdown">
                                            {[...Array(12)].map((_, index) => (
                                                <div
                                                    key={index + 1}
                                                    className={`admin-data-lot-option ${ticketReservationSelectedMonth === index + 1 ? "selected" : ""}`}
                                                    onClick={() => setTicketReservationSelectedMonth(index + 1)}
                                                >
                                                    {new Date(0, index).toLocaleString("default", { month: "long" })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chart Section */}
                                    <div className="admin-data-analysis-chart">
                                        <button
                                            onClick={() =>
                                                setTicketReservationChartType(ticketReservationChartType === "bar" ? "pie" : "bar")
                                            }
                                            className="admin-data-toggle-chart-button"
                                        >
                                            {ticketReservationChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                        </button>
                                        {(ticketReservationType === "ticket" && ticketData) &&
                                            renderChart(
                                                ticketData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.total_tickets),
                                                ticketData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.user_type),
                                                "Tickets",
                                                ticketReservationChartType
                                            )}
                                        {(ticketReservationType === "reservation" && reservationData) &&
                                            renderChart(
                                                reservationData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.total_reservations),
                                                reservationData
                                                    .filter((item) => item.user_type && item.user_type.trim() !== "")
                                                    .map((item) => item.user_type),
                                                "Reservations",
                                                ticketReservationChartType
                                            )}
                                    </div>

                                    {/* Line Chart Section */}
                                    <div className="admin-data-analysis-unique-data">
                                        {renderTRLineChart()}
                                    </div>
                                </div>
                            </div>

                            {/* User/Feedback Analysis Section */}
                            <div className="admin-data-analysis-section">
                                <div className="admin-data-analysis-header">
                                    <h3>User Analysis</h3>
                                    <img
                                        src={refreshIcon}
                                        alt="Refresh"
                                        className="admin-data-refresh-icon"
                                        onClick={() => {
                                            fetchUserTypeCounts();
                                            fetchDailyFeedbackCounts();
                                        }}
                                    />
                                </div>
                                <div className="admin-data-analysis-body">
                                    {/* Analysis Text Section */}
                                    <div className="admin-data-analysis-text">
                                        <div className="admin-data-month-dropdown">
                                            {[...Array(12)].map((_, index) => (
                                                <div
                                                    key={index + 1}
                                                    className={`admin-data-lot-option ${userAnalysisSelectedMonth === index + 1 ? "selected" : ""}`}
                                                    onClick={() => setUserAnalysisSelectedMonth(index + 1)}
                                                >
                                                    {new Date(0, index).toLocaleString("default", { month: "long" })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Analysis Chart Section */}
                                    <div className="admin-data-analysis-chart">
                                        <button
                                            onClick={() =>
                                                setUserChartType(userChartType === "bar" ? "pie" : "bar")
                                            }
                                            className="admin-data-toggle-chart-button"
                                        >
                                            {userChartType === "bar" ? "Switch to Pie Chart" : "Switch to Bar Chart"}
                                        </button>
                                        {userTypeCounts &&
                                            renderChart(
                                                userTypeCounts.map((item) => item.total_users),
                                                userTypeCounts.map((item) => item.user_type),
                                                "Users",
                                                userChartType
                                            )}
                                    </div>

                                    {/* Unique Data Section */}
                                    <div className="admin-data-analysis-unique-data">
                                        {renderUFLineChart()}
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