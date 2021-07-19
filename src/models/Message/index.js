import mongoose from "mongoose";
import MessageSchema from './schema.js'

export default mongoose.model("message", MessageSchema)