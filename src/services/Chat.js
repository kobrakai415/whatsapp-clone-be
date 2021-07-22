import express from "express"
import RoomModel from "../models/Room/index.js"
import UserModel from "../models/users/index.js"
import { JWTAuthMiddleware } from "../auth/jwtAuth.js";

const chatRouter = express.Router()

// chatRouter.post('/room', async (req, res) => {
//     const room = new RoomModel(req.body)
//     await room.save()

//     res.status(201).send(room)
// })

chatRouter.get("/room/history/:title", async (req, res) => {
    const room = await RoomModel.findOne({ title: req.params.title })
    res.status(200).send({ chatHistory: room.chatHistory })
})

chatRouter.get("/room/user/:id", JWTAuthMiddleware, async (req, res) => {

    console.log('req.params.id:', req.params.id)
    console.log('req.user._id:', req.user._id)

    const room = await RoomModel.findOne({ $and: [{ members: req.params.id }, { members: req.user._id }] }).populate("members")
    console.log('room:', room)

    if (room !== null) {
        res.status(200).send(room)
    } else {
        const emptyRoom = {

            members: [req.params.id, req.user._id]
        }
        const _room = new RoomModel(emptyRoom)
        await _room.save()

        const _room_ = await RoomModel.findOne({ $and: [{ members: req.params.id }, { members: req.user._id }] }).populate("members")
        console.log('------------------')
        console.log('_room_:', _room_)
        console.log('------------------')
        res.status(200).send(_room_)
    }

})

export default chatRouter