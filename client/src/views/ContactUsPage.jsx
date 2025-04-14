import React, { useState } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import ApiService from "../services/ApiService";
import "../stylesheets/ContactUsPage.css";

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = ApiService.getSessionUser();
            if (!user) {
                alert("You must be logged in to submit feedback.");
                return;
            }

            await ApiService.createFeedback(user.user_id, formData.subject, formData.message);
            alert("Your message has been submitted. Thank you!");
            setFormData({ subject: "", message: "" });
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            alert("Failed to submit feedback. Please try again later.");
        }
    };

    return (
        <div className="contact-page-container">
            <Header />
            <NavBar />
            <div className="contact-page-content">
                <h1>Contact Us</h1>
                <p>We'd love to hear from you! Please fill out the form below to get in touch.</p>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subject">Subject:</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Enter the subject"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message:</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Enter your message"
                            rows="5"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="submit-button">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default ContactUsPage;