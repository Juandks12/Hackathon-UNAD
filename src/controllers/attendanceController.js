import Attendance from "../models/attendance.js";
import User from "../models/users.js";

// Check-in (entrada)
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Verificar si ya tiene un check-in sin check-out hoy
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      user: userId,
      checkIn: { $gte: todayStart, $lte: todayEnd },
      checkOut: null,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Ya tienes un registro de entrada sin salida hoy",
        attendance: existingAttendance,
      });
    }

    // Verificar tardanza (ejemplo: después de las 8:00 AM)
    const horaEntradaEsperada = new Date(now);
    horaEntradaEsperada.setHours(8, 0, 0, 0);
    const tardanza = now > horaEntradaEsperada;

    const attendance = await Attendance.create({
      user: userId,
      checkIn: now,
      tardanza,
    });

    await attendance.populate("user", "username");

    res.status(201).json({
      message: tardanza ? "Entrada registrada (con tardanza)" : "Entrada registrada",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar entrada", error: error.message });
  }
};

// Check-out (salida)
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Buscar el registro de entrada de hoy sin salida
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: userId,
      checkIn: { $gte: todayStart, $lte: todayEnd },
      checkOut: null,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No se encontró un registro de entrada para hoy",
      });
    }

    attendance.checkOut = now;
    await attendance.save();
    await attendance.populate("user", "username");

    // Calcular horas trabajadas
    const horasTrabajadas = (now - attendance.checkIn) / (1000 * 60 * 60);

    res.json({
      message: "Salida registrada",
      attendance,
      horasTrabajadas: horasTrabajadas.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar salida", error: error.message });
  }
};

// Obtener mis registros de asistencia (empleado)
export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const filter = { user: userId };
    
    if (startDate && endDate) {
      filter.checkIn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [attendances, total] = await Promise.all([
      Attendance.find(filter)
        .populate("user", "username")
        .sort({ checkIn: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      total,
      page: parsedPage,
      limit: parsedLimit,
      attendances,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros", error: error.message });
  }
};

// Obtener estado actual (si tiene entrada sin salida)
export const getCurrentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: userId,
      checkIn: { $gte: todayStart, $lte: todayEnd },
      checkOut: null,
    }).populate("user", "username");

    if (!attendance) {
      return res.json({
        hasActiveEntry: false,
        message: "No hay entrada registrada hoy",
      });
    }

    const horasTrabajadas = (now - attendance.checkIn) / (1000 * 60 * 60);

    res.json({
      hasActiveEntry: true,
      attendance,
      horasTrabajadas: horasTrabajadas.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estado", error: error.message });
  }
};

// Obtener todos los registros (admin)
export const getAllAttendance = async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = {};
    
    if (userId) filter.user = userId;
    
    if (startDate && endDate) {
      filter.checkIn = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const [attendances, total] = await Promise.all([
      Attendance.find(filter)
        .populate("user", "username role")
        .sort({ checkIn: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Attendance.countDocuments(filter),
    ]);

    res.json({
      total,
      page: parsedPage,
      limit: parsedLimit,
      attendances,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros", error: error.message });
  }
};

// Corregir un registro de asistencia (admin)
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, tardanza, motivoCorreccion } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut !== undefined) {
      attendance.checkOut = checkOut ? new Date(checkOut) : null;
    }
    if (tardanza !== undefined) attendance.tardanza = tardanza;
    if (motivoCorreccion) attendance.motivoCorreccion = motivoCorreccion;

    await attendance.save();
    await attendance.populate("user", "username role");

    res.json({
      message: "Registro actualizado",
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar registro", error: error.message });
  }
};

// Reporte global (admin)
export const getGlobalReport = async (req, res) => {
  try {
    const { type, date } = req.query; // type: day | week
    let start, end;

    if (type === "day") {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else if (type === "week") {
      start = new Date(date);
      start.setDate(start.getDate() - start.getDay()); // inicio semana
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 6); // fin semana
      end.setHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ message: "Tipo de reporte inválido. Use 'day' o 'week'" });
    }

    const attendances = await Attendance.find({
      checkIn: { $gte: start, $lte: end },
    }).populate("user", "username role");

    // Calcular estadísticas
    const totalAsistencias = attendances.length;
    const tardanzas = attendances.filter((a) => a.tardanza).length;
    const sinSalida = attendances.filter((a) => !a.checkOut).length;

    // Calcular horas totales trabajadas
    let horasTotales = 0;
    attendances.forEach((att) => {
      if (att.checkOut) {
        const horas = (att.checkOut - att.checkIn) / (1000 * 60 * 60);
        horasTotales += horas;
      }
    });

    res.json({
      periodo: { start, end },
      totalAsistencias,
      tardanzas,
      sinSalida,
      horasTotales: horasTotales.toFixed(2),
      registros: attendances,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al generar reporte", error: error.message });
  }
};

