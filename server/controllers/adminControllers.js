import { getAllUsers, getUnapproved, removeUser, approve, findUserById } from "../models/userModel.js";

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

export const getUserById = async (req, res) => {
    const { id } = req.params;
    console.log("we using this userid to find user:", id);
    try {
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            user: user,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

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