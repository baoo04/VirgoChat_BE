import express from "express";
import passport from "passport";

import { signup, login, logout, updateProfile, getProfile, loginGoogle } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/google", loginGoogle);

router.get("/profile", protectRoute, getProfile);

router.put("/profile/update", protectRoute, updateProfile);

export default router;
