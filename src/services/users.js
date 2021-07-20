import express from "express";
import UserModel from "../models/users/index.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { JWTAuthenticate, refreshTokens } from "../auth/tools.js";
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
      const { accessToken, refreshToken } = await JWTAuthenticate(user);

      res.cookie("accessToken", req.user.tokens.accessToken, { httpOnly: true });
      res.cookie("refreshToken", req.user.tokens.refreshToken, { httpOnly: true });
      res.send({ accessToken, refreshToken });
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

usersRouter.post("/me/setUsername", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    user.username = req.body.username;
    await user.save();
    res.send(user.username);
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
    res.send(user.status);
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

export default usersRouter;
