import { getAllUsers, getUnapproved, removeUser, approve } from "../models/userModel.js";

export const getUsers = async (req, res) => {
    try {
        const results = await getAllUsers();
        res.status(200).json({
            users: results,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUnapprovedUsers = async (req, res) => {
    try {
        const results = await getUnapproved();
        res.status(200).json({
            users: results,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const approveUser = async (req, res) => {
    const { userId } = req.body;
    try {
        await approve(userId);
        res.status(200).json({
            message: "User successfully approved",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.body;
    try {
        await removeUser(userId);
        res.status(200).json({
            message: "User successfully deleted",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};