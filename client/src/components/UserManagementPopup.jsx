import React, { useState } from "react";
import ApiService from "../services/ApiService";
import "../stylesheets/AdminHome.css";

const UserManagementPopup = ({ type, onClose, refreshUsers }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        userId: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (type === "add") {
                await ApiService.registerUser(formData.name, formData.email, formData.password);
            } else if (type === "delete") {
                await ApiService.deleteUser(formData.userId);
            }
            refreshUsers();
            onClose();
        } catch (error) {
            console.error(`Failed to ${type} user:`, error);
        }
    };

    return (
        <div className="popup">
            <h2>{type === "add" ? "Add User" : "Delete User"}</h2>
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
                <input
                    type="text"
                    name="userId"
                    placeholder="User ID"
                    value={formData.userId}
                    onChange={handleInputChange}
                />
            )}
            <div className="popup-actions">
                <button onClick={onClose}>Cancel</button>
                <button onClick={handleSubmit}>Confirm</button>
            </div>
        </div>
    );
};

export default UserManagementPopup;