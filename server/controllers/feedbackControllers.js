import { createFeedback, getAllFeedback, getFeedbackList, getFeedbackDetails, resolveFeedback } from "../models/feedbackModel.js";
import { createMessage } from "../models/messageModel.js";

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

export const handleGetFeedbackList = async (req, res) => {
    try {
        const feedbackList = await getFeedbackList();
        res.status(200).json(feedbackList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const handleGetFeedbackDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const feedback = await getFeedbackDetails(id);
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const handleResolveFeedback = async (req, res) => {
    const { feedbackId, messageDetails, senderId, recipientId } = req.body;
    try {
        await resolveFeedback(feedbackId);
        await createMessage(senderId, recipientId, messageDetails);
        res.status(200).json({ message: "Feedback resolved and message sent." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const handleSendMessage = async (req, res) => {
    const { senderId, recipientId, messageDetails } = req.body;
    try {
        const message = await createMessage(senderId, recipientId, messageDetails);
        res.status(200).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};