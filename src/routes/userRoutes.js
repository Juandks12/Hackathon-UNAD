import express from "express";
import User from "../models/users.js";  // tu modelo de usuario en Mongo
import bcrypt from "bcryptjs";

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Verificar si ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    res.status(201).json({ msg: "Usuario registrado con éxito", user: newUser });
  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
});

export default router;
