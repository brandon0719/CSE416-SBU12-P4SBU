import { createFeedback, getAllFeedback } from "../models/feedbackModel.js";

export const handleCreateFeedback = async (req, res) =>{
    const {userId, topic, details} = req.body;
    try {
        const feedback = await createFeedback(userId, topic, details);
        res.status(200).json({
            message: "Feedback successfully created",
            feedback: feedback,
        });
    } catch (error) {

    }
}

export const handleGetAllFeedback = async (req, res) => {
    try {
        const feedback = await getAllFeedback();
        res.status(200).json({
            message: "Feedback successfully fetched",
            feedback: feedback,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching feedback",
            error: error.message,
        });
    }
}
