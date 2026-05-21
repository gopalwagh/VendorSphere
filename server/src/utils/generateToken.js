import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn : process.env.JWT_EXPIRES_IN,
    }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};
