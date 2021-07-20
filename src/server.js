import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import { createServer } from "http";
import { Server } from "socket.io";
import usersRouter from "./services/users.js";
import { unAuthorizedHandler, notFoundErrorHandler, badRequestErrorHandler, forbiddenErrorHandler, catchAllErrorHandler } from "./errorHandlers.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const server = createServer(app);
const io = new Server(server, { allowEIO3: true });

app.use("/users", usersRouter);

app.use(unAuthorizedHandler);
app.use(notFoundErrorHandler);
app.use(badRequestErrorHandler);
app.use(forbiddenErrorHandler);
app.use(catchAllErrorHandler);

const port = process.env.PORT;

mongoose.connect(process.env.MONGO_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to mongo");
  server.listen(port, () => {
    console.table(listEndpoints(app));
    console.log("Server listening on port " + port);
  });
});
