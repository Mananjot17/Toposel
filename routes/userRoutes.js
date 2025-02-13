import express from "express";
import { searchUser } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/search", protectRoute, searchUser);

export default router;
