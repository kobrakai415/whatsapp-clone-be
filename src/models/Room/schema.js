import mongoose from "mongoose"
import MessageSchema from "../Message/schema.js"
const { Schema } = mongoose

const RoomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    chatHistory: {
        type: [MessageSchema],
        required: true,
        default: []
    },
    members: [{ type: Schema.Types.ObjectId, ref: "user" }],
})

export default RoomSchema