import express from "express";
import { createUser, listUsers } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Crear usuario (solo admin)
router.post("/", protect, adminOnly, createUser);

// Listar usuarios (solo admin)
router.get("/", protect, adminOnly, listUsers);

export default router;
