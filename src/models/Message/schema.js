import mongoose from "mongoose"

const MessageSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        sender: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            required: true
        }
    }
)

export default MessageSchema