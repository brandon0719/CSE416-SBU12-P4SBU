import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

const UserManagementPopup = ({ type, user, onClose, refreshUsers }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (type === "delete" && user) {
            setFormData({ name: user.name, email: user.email });
        }
    }, [type, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (type === "add") {
                await ApiService.registerUser(formData.name, formData.email, formData.password);
            } else if (type === "delete") {
                await ApiService.deleteUser(user.user_id);
            }
            refreshUsers();
            onClose();
        } catch (error) {
            console.error(`Failed to ${type} user:`, error);
        }
    };

    return (
        <div className="popup">
            <h2>{type === "add" ? "Add User" : `Delete User: ${formData.name}`}</h2>
            {type === "add" ? (
                <>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </>
            ) : (
                <p>Are you sure you want to delete this user?</p>
            )}
            <div className="popup-actions">
                <button onClick={onClose}>Cancel</button>
                <button onClick={handleSubmit}>Confirm</button>
            </div>
        </div>
    );
};

export default UserManagementPopup;