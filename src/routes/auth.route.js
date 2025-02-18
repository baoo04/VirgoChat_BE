import express from "express";

import {
  signup,
  sendOTPSignUp,
  sendOTPResetPassword,
  login,
  logout,
  loginGoogle,
  loginFaceId,
  updateAvatar,
  updateFaceId,
  updateInfo,
  updatePassword,
  verifyOTPSignUp,
  verifyOTPResetPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signup/send-otp", sendOTPSignUp);
router.post("/signup/verify-otp", verifyOTPSignUp);
router.post("/login", login);
router.post("/logout", logout);

router.put("/reset-password/", resetPassword);
router.post("/reset-password/send-otp", sendOTPResetPassword);
router.post("/reset-password/verify-otp", verifyOTPResetPassword);

router.post("/login/google", loginGoogle);
router.post("/login/face-id", loginFaceId);

router.put("/update/avatar", protectRoute, updateAvatar);
router.put("/update/info", protectRoute, updateInfo);
router.put("/update/face-id", protectRoute, updateFaceId);
router.put("/update/password", protectRoute, updatePassword);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return a token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 */

export default router;
