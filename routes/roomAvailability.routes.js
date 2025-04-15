import express from "express";
import { checkRoomAvailability } from "../controllers/roomAvailability.controller.js";

const router = express.Router();

router.post("/availability", checkRoomAvailability);

export default router;
