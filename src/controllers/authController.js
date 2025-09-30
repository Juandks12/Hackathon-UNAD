import jwt from "jsonwebtoken";
import User from "../models/users.js";

const MAX_ATTEMPTS = 3;

let attempts = {}; 

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!attempts[username]) attempts[username] = 0;
  if (attempts[username] >= MAX_ATTEMPTS) {
    return res.status(403).json({ message: "Cuenta bloqueada por intentos fallidos" });
  }

  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    attempts[username]++;
    return res.status(401).json({ message: "Credenciales inválidas" });
  }

  // Reset intentos fallidos
  attempts[username] = 0;

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, role: user.role });
};
