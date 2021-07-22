import express from "express"
import RoomModel from "../models/Room/index.js"

const chatRouter = express.Router()

chatRouter.post('/room', async (req, res) => {
    const room = new RoomModel(req.body)
    await room.save()

    res.status(201).send(room)
})

chatRouter.get("/room/:title", async (req, res) => {
    const room = await RoomModel.findOne({ title: req.params.title })
    res.status(200).send({ chatHistory: room.chatHistory })
})


export default chatRouter