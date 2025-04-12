import { updateUserProfile } from "../models/userModel.js"

// Profile Update
export const updateProfile = async (req, res) => {    
    // Destructure the profile fields from the request body.
    const { userId, userType, permitNumber, carModel, licensePlate } = req.body;
    console.log("Received profile update request:", req.body);

    try {
        const updatedUser = await updateUserProfile(userId, { userType, permitNumber, carModel, licensePlate });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};