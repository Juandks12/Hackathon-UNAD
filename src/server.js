import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Servir archivos estáticos
app.use(express.static("src/public"));

// Conexión a MongoDB
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error de conexión a MongoDB:", err));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
