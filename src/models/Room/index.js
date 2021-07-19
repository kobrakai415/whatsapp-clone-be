import mongoose from "mongoose"
import RoomSchema from "./schema.js"

export default mongoose.model("room", RoomSchema)