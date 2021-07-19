import express from "express";
import UserModel from "../models/users/index.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthenticate } from "../auth/tools.js";
import { JWTAuthMiddleware } from "../auth/jwtAuth.js";

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
      const accessToken = await JWTAuthenticate(user);
      res.send({ accessToken });
    } else {
      next(createError(401));
    }
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

usersRouter.get("/me", async (req, res, next) => {
  try {
    console.log(req.user);
    res.send(req.user);
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

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const myProfile = await UserModel.findByIdAndUpdate(req.user._id, req.body, { runValidators: true, new: true });
    res.send(myProfile);
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

usersRouter.post("/me/uploadAvatar", upload, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    user.avatar = req.file.path;
    await experience.save();
    res.send(req.file.path);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
