import { createFeedback } from "../models/feedbackModel.js";

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