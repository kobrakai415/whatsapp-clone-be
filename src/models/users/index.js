import mongoose from "mongoose"
import userSchema from "./schema.js"

const UserModel = mongoose.model("user", userSchema)

export default UserModel