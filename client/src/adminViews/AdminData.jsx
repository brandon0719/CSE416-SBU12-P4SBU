import React, { useState, useEffect } from "react";
import Modal from "react-modal";

import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

const AdminData = () => {
    const [activeTab, setActiveTab] = useState("feedback"); // "feedback" or "analysis"
    const [feedback, setFeedback] = useState([]); // Holds the feedback list
    const [selectedFeedback, setSelectedFeedback] = useState(null); // Holds the selected feedback details
    const [message, setMessage] = useState(""); // Holds the admin's message to the user
    const admin = ApiService.getSessionUser();

    useEffect(() => {
        if (activeTab === "feedback") {
            fetchFeedbackList(); // Fetch feedback when the feedback tab is active
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