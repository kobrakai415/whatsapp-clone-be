import jwt from "jsonwebtoken";

export const JWTAuthenticate = async (user) => {
  const accessToken = await generateJWT({ _id: user._id });
  return accessToken;
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
      console.log(process.env.JWT_SECRET);
        if (err) reject(err);
        resolve(token);
    })
  );
