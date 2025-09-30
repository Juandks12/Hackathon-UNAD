const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("./src/routes/auth");
const employeeRoutes = require("./src/routes/employee");
const adminRoutes = require("./src/routes/admin");

const { verifyToken } = require("./src/middleware/auth");
const { checkRole } = require("./src/middleware/roles");

const app = express();
app.use(bodyParser.json());

// Rutas públicas
app.use("/auth", authRoutes);

// Rutas para empleados
app.use("/employee", verifyToken, checkRole(["employee", "admin"]), employeeRoutes);

// Rutas para admin
app.use("/admin", verifyToken, checkRole(["admin"]), adminRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
