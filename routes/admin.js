const express = require("express");
const { users } = require("../models/users");
const { records } = require("../models/records");
const { exportToCSV } = require("../utils/exportCSV");

const router = express.Router();

// Alta de usuario
router.post("/user", (req, res) => {
  const { username, password, role } = req.body;
  users.push({ id: users.length + 1, username, password, role });
  res.json({ msg: "Usuario creado" });
});

// Reportes globales
router.get("/report", (req, res) => {
  res.json(records);
});

// Exportar CSV
router.get("/export", (req, res) => {
  const filePath = exportToCSV(records);
  res.download(filePath);
});

module.exports = router;
