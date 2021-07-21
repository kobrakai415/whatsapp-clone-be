import createError from "http-errors";
import UserModel from "../models/users/index.js";
import {verifyToken} from "./tools.js"

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(401, "Please provide token in the authorization header!"));
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");

      const content = await verifyToken(token);

      const user = await UserModel.findById(content._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(404, "user not found!"));
      }
    } catch (error) {
      next(createError(401, "Token not valid!"));
    }
  }
};
