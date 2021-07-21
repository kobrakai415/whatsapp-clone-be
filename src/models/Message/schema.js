import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },
        senderId: { type: String, required: true },
        content: { type: String, required: true },
        contentType: { type: String, required: true, enum: ["text", "picture", "video"] },
        timestamp: { type: Date, required: true }
    }
)

export default MessageSchema