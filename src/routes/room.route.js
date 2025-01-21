import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { getRooms, getRoom } from "../controllers/room.controller.js";

const router = express.Router();

router.get("", protectRoute, getRooms);
router.get("/:roomId", protectRoute, getRoom);

export default router;