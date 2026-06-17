import express from "express";
import protect from "../../middleware/authMiddleware.js"
import { 
  registerUser, 
  loginUser, 
  refreshAccessToken, 
  getCurrentUser, 
  logoutUser, 
  updateUserProfile 
} from "./auth.Controller.js"


const router =  express.Router();

router.get("/me", protect, getCurrentUser);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutUser);
router.patch("/update-profile", protect, updateUserProfile);

export default router;