import express from 'express';
import protect from '../../middleware/authMiddleware.js';
import { saveFcmToken, testNotification } from './notification.controller.js';

const router = express.Router();

router.post("/save-token", protect, saveFcmToken);
// test purpose route
router.get("/test", protect, testNotification);

export default router;