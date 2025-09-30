const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const adminRoutes = require("./routes/admin");

const { verifyToken } = require("./middleware/auth");
const { checkRole } = require("./middleware/roles");

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
