import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },
        text: { type: String, required: true },
        type: { type: String, required: true, enum: ["text", "picture", "video"] },
        timestamp: { type: Date, required: true }
    }
)

export default MessageSchema