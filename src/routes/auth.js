const express = require("express");
const bcrypt = require("bcrypt");
const { users, loginAttempts } = require("../models/users");
const { generateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

  // Control de intentos fallidos
  if (!loginAttempts[username]) loginAttempts[username] = 0;
  if (loginAttempts[username] >= 3) {
    return res.status(403).json({ msg: "Máximos intentos alcanzados" });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    loginAttempts[username]++;
    return res.status(401).json({ msg: "Contraseña incorrecta" });
  }

  // Login correcto → reset intentos
  loginAttempts[username] = 0;
  const token = generateToken(user);
  res.json({ msg: "Login exitoso", token });
});

module.exports = router;
