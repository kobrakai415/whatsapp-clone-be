import { createSocket } from "dgram";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(socket.id);
  console.log("server listens on port 5000");
  socket.emit("hello", "world", 22);
  socket.on("world", (arg) => {
    console.log(arg);
  });
});

httpServer.listen(5000);
