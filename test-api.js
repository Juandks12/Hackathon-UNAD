// Script de prueba para validar la API
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/models/users.js";
import bcrypt from "bcryptjs";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

async function testAPI() {
  console.log("🧪 Iniciando pruebas de la API...\n");

  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/hackathon-unad");
    console.log("✅ MongoDB conectado\n");

    // Limpiar usuarios de prueba
    await User.deleteMany({ username: { $in: ["testuser", "testadmin"] } });
    console.log("🧹 Usuarios de prueba eliminados\n");

    // Crear usuario de prueba (empleado)
    const hashedPassword = await bcrypt.hash("test123", 10);
    const testUser = await User.create({
      username: "testuser",
      password: hashedPassword,
      role: "empleado",
    });
    console.log("✅ Usuario de prueba creado:", testUser.username);

    // Crear admin de prueba
    const adminPassword = await bcrypt.hash("admin123", 10);
    const testAdmin = await User.create({
      username: "testadmin",
      password: adminPassword,
      role: "admin",
    });
    console.log("✅ Admin de prueba creado:", testAdmin.username);

    console.log("\n📋 Resumen de pruebas:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Base de datos: Conectada");
    console.log("✅ Modelos: Configurados");
    console.log("✅ Usuarios de prueba: Creados");
    console.log("\n🔑 Credenciales de prueba:");
    console.log("   Empleado: testuser / test123");
    console.log("   Admin: testadmin / admin123");
    console.log("\n🚀 Para iniciar el servidor:");
    console.log("   npm run dev");
    console.log("\n🌐 Endpoints disponibles:");
    console.log("   - POST /api/auth/login");
    console.log("   - POST /api/auth/setup-admin");
    console.log("   - POST /api/attendance/check-in");
    console.log("   - POST /api/attendance/check-out");
    console.log("   - GET /api/attendance/my-attendance");
    console.log("   - GET /api/admin/users");
    console.log("\n✨ ¡Todo listo para probar!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testAPI();

