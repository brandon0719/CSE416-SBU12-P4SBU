import { getMessagesByRecipientId, createMessage } from "../models/messageModel.js";

export const handleGetMessages = async (req, res) => {
    try {
        const messages = await getMessagesByRecipientId(req.params.userId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const handleSendMessage = async (req, res) => {
    const { senderId, recipientId, messageDetails } = req.body;
    try {
        const message = await createMessage(senderId, recipientId, messageDetails);
        res.status(200).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};