import express from "express";
import UserModel from "../models/users/index.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthenticate, refreshTokens } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/jwtAuth.js";
import createError from "http-errors";
import RoomModel from "../models/Room/index.js"

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const response = await newUser.save();
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    if (user) {
      const { accessToken, refreshToken } = await JWTAuthenticate(user);

      // res.cookie("accessToken", req.user.tokens.accessToken, { httpOnly: true });
      // res.cookie("refreshToken", req.user.tokens.refreshToken, { httpOnly: true });
      res.send({ accessToken, refreshToken, username: user.username });
    } else {
      next(createError(401));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { newAccessToken, newRefreshToken } = await refreshTokens(req.cookies.actualRefreshToken);
    res.send({ newAccessToken, newRefreshToken });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const response = await UserModel.find();
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    // console.log(req.user);
    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.get("/search/:query", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const regex = new RegExp(req.params.query, "i")
    // console.log(regex)
    const users = await UserModel.find({ username: { $regex: regex } })

    // console.log(req.params.query)
    // console.log(users)
    const otherUsers = users.filter((user) => user._id.toString() !== req.user._id.toString());

    res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await req.user.deleteOne();
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/me/setUsername", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    user.username = req.body.username;
    await user.save();
    console.log(user);
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.put("/me/status", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    user.status = req.body.status;
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Whatsapp",
  },
});

const upload = multer({ storage: cloudinaryStorage }).single("avatar");

usersRouter.post("/me/uploadAvatar", upload, JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    user.avatar = req.file.path;
    await user.save();
    res.send(user.avatar);
  } catch (error) {
    next(error);
  }
});


// GET /me/chats

// const chatRooms = await RoomModel.find({ members: req.user._id }, { select: [ NO CHAT HISTORY ] })

usersRouter.get("/me/chats", JWTAuthMiddleware, async (req, res) => {
  console.log('req.user._id:', req.user._id)
  const rooms = await RoomModel.find({ members: req.user._id }).populate("members")
  res.status(200).send(rooms)
})
// console.log('rooms:', rooms)
// const myChats = rooms.filter((item) => (item.members.includes(req.user._id)))
// const chats = []
// myChats.forEach((item) => (chats.push({ "title": item.title })))

export default usersRouter;
