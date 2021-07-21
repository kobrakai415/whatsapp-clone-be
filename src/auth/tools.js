import jwt from "jsonwebtoken";
import UserModel from "../models/users/index.js";

export const JWTAuthenticate = async (user) => {
  const accessToken = await generateJWT({ _id: user._id });
  const refreshToken = await generateRefreshJWT({ _id: user._id });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

const generateJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    })
  );

export const verifyToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
      if (err) reject(err);
      resolve(token);
    })
  );

const generateRefreshJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err);

      resolve(token);
    })
  );

const verifyRefreshToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) reject(err);

      resolve(decodedToken);
    })
  );

export const refreshTokens = async (actualRefreshToken) => {
  const content = await verifyRefreshToken(actualRefreshToken);

  const user = await UserModel.findById(content._id);

  if (!user) throw new Error("User not found");

  if (user.refreshToken === actualRefreshToken) {
    const newAccessToken = await generateJWT({ _id: user._id });

    const newRefreshToken = await generateRefreshJWT({ _id: user._id });

    user.refreshToken = newRefreshToken;

    await user.save();

    return { newAccessToken, newRefreshToken };
  } else {
    throw new Error("Refresh Token not valid!");
  }
};
