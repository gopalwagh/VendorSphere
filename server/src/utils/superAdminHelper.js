import User from "../modules/user/user.model.js";
import asyncHandler from "./asyncHandler.js";
import bcrypt from "bcryptjs";
import { SUPER_ADMIN_ROLE } from "./roleUtils.js";

export const createSuperAdmin = asyncHandler( async(req, res) => {
  const existing = await User.findOne({ role: SUPER_ADMIN_ROLE});

  if(existing) {
    console.log("SuperAdmin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);

  await User.create({
    name: "Super Admin",
    email: process.env.SUPERADMIN_EMAIL,
    password: hashedPassword,
    role: SUPER_ADMIN_ROLE,
    sellerStatus: "approved"
  })  

  console.log("SuperAdmin created successfully");
}) 
