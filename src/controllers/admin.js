import User from "../models/users.js";
import Attendance from "../models/attendance.js";
import bcrypt from "bcryptjs";

// Crear usuario (alta) - solo admin
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username y password son obligatorios" });
    }

    // Verificar si ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      role: role || "empleado",
    });

    await user.save();

    // No devolver la contraseña
    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    res.status(201).json({ message: "Usuario creado correctamente", user: userResponse });
  } catch (err) {
    res.status(400).json({ message: "Error al crear usuario", error: err.message });
  }
};

// Editar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Si se actualiza la contraseña, hashearla
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario actualizado", user });
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar usuario", error: err.message });
  }
};

// Eliminar usuario (baja)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(400).json({ message: "Error al eliminar usuario", error: err.message });
  }
};

// Listar todos los usuarios
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ username: 1 });
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: "Error al listar usuarios", error: err.message });
  }
};

// Ver fichajes por empleado y fecha
export const getRecordsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { user: userId };
    if (startDate && endDate) {
      filter.checkIn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const records = await Attendance.find(filter)
      .populate("user", "username")
      .sort({ checkIn: -1 });

    res.json(records);
  } catch (err) {
    res.status(400).json({ message: "Error al obtener fichajes", error: err.message });
  }
};


