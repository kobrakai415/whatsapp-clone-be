import cors from "cors"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import chatRouter from "./services/Chat.js"
import list from "express-list-endpoints"
import mongoose from "mongoose"
import RoomModel from "./models/Room/index.js"

const app = express();
app.use(cors())
app.use(express.json())

const server = createServer(app);
const io = new Server(server, { allowEIO3: true })

let onlineUsers = []


// Add "event listeners" on your socket when it's connecting
io.on("connection", socket => {
    console.log(`${socket.id} connected`)
    
    socket.on("setUsername", async ({ username, room }) => {
        onlineUsers.push({ username: username, userId: socket.id, room })

        //.emit - echoing back to itself
        socket.emit("loggedin")

        //.broadcast.emit - emitting to everyone else
        socket.broadcast.emit("newConnection")

        socket.join(socket.id)
        socket.join(room)
        
        const _room_ = await RoomModel.findOne({ name: room })
        if (!_room_) {
            try {
                const newRoom = new RoomModel({ name: room })
                await newRoom.save()
            } catch (error) {
                console.log(error)
            }
        }

        const _room = await RoomModel.findOne({ name: socket.id })
        if (!_room) {
            try {
                const newRoom = new RoomModel({ name: socket.id })
                await newRoom.save()
            } catch (error) {
                console.log(error)
            }
        }

        console.log(`${socket.id} connected and joined this/these room(s):`)
        console.log(socket.rooms)
        //io.sockets.emit - emitting to everybody in the known world
        //io.sockets.emit("newConnection")
    })

    socket.on("disconnect", () => {
        console.log("Disconnecting...")
        onlineUsers = onlineUsers.filter(user => user.id !== socket.id)
    })

    socket.on("sendMessage", async ({ message, room }) => {

        await RoomModel.findOneAndUpdate({ name: room }, {
            $push: { chatHistory: message }
        })

        socket.to(room).emit("message", message)
    })

    // socket.on("join-room", (room) => {
    //     socket.join(room)
    //     console.log(socket.rooms)
    // })

    console.log('-----------------------------')
})


app.get('/online-users', (req, res) => {
    res.status(200).send({ onlineUsers })
})

app.use('/', chatRouter)


const port = 3030

mongoose
    .connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true })
    .then(() => {
        console.log("Connected to mongo")
        // Listen using the httpServer -
        // listening with the express instance will start a new one!!
        server.listen(port, () => {
            console.table(list(app))
            console.log("Server listening on port " + port)
        })
    })