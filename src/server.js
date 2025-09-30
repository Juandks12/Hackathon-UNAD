import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.DB_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
