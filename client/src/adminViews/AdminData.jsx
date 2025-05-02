import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

const AdminData = () => {
    const [activeTab, setActiveTab] = useState("feedback"); // "feedback" or "analysis"
    const [feedback, setFeedback] = useState([]);

    useEffect(() => {
        if (activeTab === "feedback") {
            fetchFeedback();
        }
    }, [activeTab]);

    const fetchFeedback = async () => {
        try {
            const response = await ApiService.fetchFeedback();
            setFeedback(response.feedback);
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
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
                            {feedback.length > 0 ? (
                                <ul className="feedback-list">
                                    {feedback.map((item) => (
                                        <li key={item.feedback_id} className="feedback-item">
                                            <p><strong>Topic:</strong> {item.topic}</p>
                                            <p><strong>Details:</strong> {item.details}</p>
                                            <p><strong>Submitted By:</strong> {item.user_id}</p>
                                            <p><strong>Date:</strong> {new Date(item.creation_date).toLocaleString()}</p>
                                            <p><strong>Resolved:</strong> {item.resolved ? "Yes" : "No"}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No feedback available.</p>
                            )}
                        </div>
                    )}
                    {activeTab === "analysis" && (
                        <div className="analysis-tab">
                            <h2>Data Analysis</h2>
                            <p>This section will include data analysis tools and visualizations.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminData;