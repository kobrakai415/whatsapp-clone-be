import express from "express"
import RoomModel from "../models/Room/index.js"
import UserModel from "../models/users/index.js"
import { JWTAuthMiddleware } from "../auth/jwtAuth.js";

const chatRouter = express.Router()

chatRouter.post('/room', async (req, res) => {
    const room = new RoomModel(req.body)
    await room.save()

    res.status(201).send(room)
})

chatRouter.get("/room/history/:title", async (req, res) => {
    const room = await RoomModel.findOne({ title: req.params.title })
    res.status(200).send({ chatHistory: room.chatHistory })
})

chatRouter.get("/room/user/:title", JWTAuthMiddleware, async (req, res) => {
    console.log('req.params.title:', req.params.title)
    console.log('-----------------')
    const user = UserModel.find({ username: req.params.title })
    const room = await RoomModel.findOne({ title: req.params.title })
    if (room) {
        res.status(200).send({ chatHistory: room.chatHistory })
    } else {
        const emptyRoom = {
            title: req.params.title,
            members: [user._id, req.user._id]
        }
        const room = new RoomModel(emptyRoom)
        await room.save()
        res.status(200).send({ chatHistory: room.chatHistory, title: room.title })
    }

})

export default chatRouter