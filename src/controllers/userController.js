import User from "../models/users.js";

// Crear un nuevo usuario (solo admin)
export const createUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "'username' y 'password' son obligatorios" });
  }

  if (role && !["empleado", "admin"].includes(role)) {
    return res.status(400).json({ message: "'role' inválido" });
  }

  try {
    const user = await User.create({ username, password, role });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    // Duplicado por índice único
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "El nombre de usuario ya existe" });
    }

    return res.status(500).json({ message: "Error al crear usuario" });
  }
};

// Listar usuarios con paginación y filtros básicos (solo admin)
export const listUsers = async (req, res) => {
  const { q, role, page = 1, limit = 50 } = req.query;

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const skip = (parsedPage - 1) * parsedLimit;

  const filter = {};
  if (q) filter.username = new RegExp(q, "i");
  if (role) filter.role = role;

  try {
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ username: 1 })
        .skip(skip)
        .limit(parsedLimit),
      User.countDocuments(filter),
    ]);

    return res.json({
      total,
      page: parsedPage,
      limit: parsedLimit,
      users,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al listar usuarios" });
  }
};


