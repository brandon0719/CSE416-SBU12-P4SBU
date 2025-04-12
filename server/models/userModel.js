import pool from "../config/db.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

export const getAllUsers = async () => {
    try {
        const { rows } = await pool.query("SELECT * FROM users");
        return rows;
    } catch (error) {
        console.error("Error fetching users:", error.message); 
        throw new Error(error.message);
    }
};

export const getUnapproved = async () => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE is_approved = false");
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const findUserByEmail = async (email) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

export const createUser = async (name, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const { rows } = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

export const removeUser = async (userId) => {
    try {
        await pool.query(
            "DELETE FROM users WHERE user_id = $1;",
            [userId]
        );
    } catch (error) {
        throw new Error(error.message);
    }
}

export const approve = async (userId) => {
    try {
        await pool.query(
            "UPDATE users SET is_approved = true WHERE user_id = $1",
            [userId]
        );
    } catch (error) {
        throw new Error(error.message);
    }
}

export const updateUserProfile = async (userId, profileData) => {
    const { userType, permitNumber, carModel, licensePlate } = profileData;
    try {
        const { rows } = await pool.query(
            `UPDATE users
            SET user_type = $1,
                permit_number = $2,
                car_model = $3,
                license_plate = $4,
                is_profile_complete = true
            WHERE user_id = $5
            RETURNING *;`,
            [userType, permitNumber, carModel, licensePlate, userId]
        );
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

