import express from "express";
import User from "../models/users.js";
import { generateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const loginAttempts = {};
const MAX_ATTEMPTS = 3;

// --- Crear admin si no existe (una sola vez) ---
router.post("/setup-admin", async (_req, res) => {
  try {
    const exists = await User.findOne({ username: "admin" });
    if (exists) return res.status(400).json({ msg: "El usuario admin ya existe" });

    const admin = await User.create({ username: "admin", password: "123456", role: "admin" });

    res.status(201).json({
      msg: "Usuario admin creado con éxito",
      user: { id: admin._id, username: admin.username, role: admin.role },
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// --- Login ---
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // Intentos fallidos
    if (!loginAttempts[username]) loginAttempts[username] = 0;
    if (loginAttempts[username] >= MAX_ATTEMPTS) {
      return res.status(403).json({ msg: "Máximos intentos alcanzados" });
    }

    if (user.password !== password) {
      loginAttempts[username]++;
      return res.status(401).json({ msg: "Contraseña incorrecta" });
    }

    loginAttempts[username] = 0;
    const token = generateToken(user);
    res.json({ msg: "Login exitoso", token, role: user.role });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

export default router;
