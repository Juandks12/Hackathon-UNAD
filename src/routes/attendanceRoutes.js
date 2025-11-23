import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getCurrentStatus,
  getAllAttendance,
  updateAttendance,
  getGlobalReport,
} from "../controllers/attendanceController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para empleados (requieren autenticación)
router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/my-attendance", protect, getMyAttendance);
router.get("/current-status", protect, getCurrentStatus);

// Rutas para administradores (requieren autenticación y rol admin)
router.get("/all", protect, adminOnly, getAllAttendance);
router.put("/:id", protect, adminOnly, updateAttendance);
router.get("/report/global", protect, adminOnly, getGlobalReport);

export default router;

