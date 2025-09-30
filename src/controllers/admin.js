// controllers/admin.js
const User = require("../models/users");
const Record = require("../models/records");

// Crear usuario (alta)
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: "Usuario creado correctamente", user });
  } catch (err) {
    res.status(400).json({ message: "Error al crear usuario", error: err.message });
  }
};

// Editar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Usuario actualizado", user });
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar usuario", error: err.message });
  }
};

// Eliminar usuario (baja)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(400).json({ message: "Error al eliminar usuario", error: err.message });
  }
};

// Listar todos los usuarios
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // sin mostrar contraseñas
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: "Error al listar usuarios", error: err.message });
  }
};

// Ver fichajes por empleado y fecha
exports.getRecordsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const filter = { user: userId };
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Record.find(filter).populate("user", "username");
    res.json(records);
  } catch (err) {
    res.status(400).json({ message: "Error al obtener fichajes", error: err.message });
  }
};

// Editar un fichaje
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const record = await Record.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Fichaje actualizado", record });
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar fichaje", error: err.message });
  }
};


// Reporte global
exports.globalReport = async (req, res) => {
  try {
    const { type, date } = req.query; // type: day | week
    let start, end;

    if (type === "day") {
      start = new Date(date);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else if (type === "week") {
      start = new Date(date);
      start.setDate(start.getDate() - start.getDay()); // inicio semana
      end = new Date(start);
      end.setDate(end.getDate() + 6); // fin semana
    } else {
      return res.status(400).json({ message: "Tipo de reporte inválido" });
    }

    const records = await Record.find({ date: { $gte: start, $lte: end } }).populate("user", "username role");

    // Totales
    const totalAsistencias = records.length;
    const tardanzas = records.filter(r => r.isLate).length;

    res.json({
      periodo: { start, end },
      totalAsistencias,
      tardanzas,
      registros: records
    });
  } catch (err) {
    res.status(400).json({ message: "Error al generar reporte", error: err.message });
  }
};


