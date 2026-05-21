import User from "./auth.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js";
import { redisClient } from "../../config/redis.js"

export const registerUser = asyncHandler(async (req ,res) => {
  const { name, email, password } = req.body;

  if(!name || !email || !password){
    throw new ApiError(400, "All Fields are required");
  }
  const existingUser = await User.findOne({ email });
  if(existingUser){
    throw new ApiError(409, "User already exists")
  }

  const hashedpassword = await bcrypt.hash(password,10);
  const user = await User.create({
    name,
    email,
    password : hashedpassword,
  });

  return res.status(201).json(
    new ApiResponse(201, user , "User registered successfully")
  );
});

// this is a login controller functions
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  };
  
  await redisClient.set(
    user._id.toString(),
    refreshToken,
    {
      EX: 7*24*60*60,
    }
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

// AccessToken Refresh karne ke liye from redis
export const refreshAccessToken = asyncHandler(async(req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if(!incomingRefreshToken){
    throw new ApiError(401, "Refresh token not found");
  }
  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const storedToken = await redisClient.get(decoded.userId);
  if(!storedToken){
    throw new ApiError(401, "Session expired");
  }
  if(!storedToken !== incomingRefreshToken){
    throw new ApiError(401, "Invalid refresh Token");
  }
  const newAccessToken = generateAccessToken(decoded.userId);

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .json({
      success : true,
      accessToken : newAccessToken,
      message : "Token refreshed",
    });
});

//  Current User API controller
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user : req.user,
      },
      "Current user Fetched"
    )
  );
});

// logout controller 
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // first we have to remove refresh Token from redis
  await redisClient.del(userId.toString());
  // claear karna padega all cookies
  const cookieOptions = {
    httpOnly : true,
    secure : false,
    sameSite : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(200, null, "Logout successfull")
    );
});
