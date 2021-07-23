import express from "express"
import RoomModel from "../models/Room/index.js"
import UserModel from "../models/users/index.js"
import { JWTAuthMiddleware } from "../auth/jwtAuth.js";
import { sockets } from "../server.js";

const chatRouter = express.Router()

chatRouter.get("/room/history/:id", async (req, res) => {
    const room = await RoomModel.findById(req.params.id)
    res.status(200).send({ chatHistory: room.chatHistory })
})

// POST 
// /users/me/chat/:otheruserId

/**
 * const myId = req.user._id.toString()
 * 
 * const userId = req.params.userId
 * 
 * const newRoom = new Roommodel({})
 * 
 * sockets[myId].join(newroom._id)
 * sockets[userId].join(newroom._id)
 * 
 * 
 */

chatRouter.get("/room/user/:id", JWTAuthMiddleware, async (req, res) => {


    const room = await RoomModel.findOne({ $and: [{ members: req.params.id }, { members: req.user._id }] }).populate("members")


    if (room !== null) {
        res.status(200).send(room)
    } else {
        const emptyRoom = {
            members: [req.params.id, req.user._id]
        }
        const _room = new RoomModel(emptyRoom)
        await _room.save()
        const _room_ = await RoomModel.findOne({ $and: [{ members: req.params.id }, { members: req.user._id }] }).populate("members")
        
        console.log('--------------------')
        console.log('sockets:', sockets)
        console.log('req.params.id:', req.params.id)
        console.log('req.user._id:', req.user._id)
        
        sockets[req.params.id].join(_room_._id.toString())
        sockets[req.user._id].join(_room_._id.toString())
        console.log('--------------------')

        res.status(200).send(_room_)

    }

})

export default chatRouter