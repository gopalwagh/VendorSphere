import User from "../modules/user/user.model.js";
import asyncHandler from "./asyncHandler.js";
import bcrypt from "bcryptjs";

export const createSuperAdmin = asyncHandler( async(req, res) => {
  const existing = await User.findOne({ role: "superAdmin"});

  if(existing) {
    console.log("SuperAdmin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);

  await User.create({
    name: "Super Admin",
    email: process.env.SUPERADMIN_EMAIL,
    password: hashedPassword,
    role: "superAdmin",
    sellerStatus: "approved"
  })  

  console.log("SuperAdmin created successfully");
}) 