import express from "express";
import {
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  getRecordsByUser,
} from "../controllers/admin.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(protect);
router.use(adminOnly);

// Gestión de usuarios
router.post("/users", createUser);
router.get("/users", listUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Ver fichajes por empleado
router.get("/users/:userId/attendance", getRecordsByUser);

export default router;

