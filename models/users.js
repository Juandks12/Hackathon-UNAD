const bcrypt = require("bcrypt");

// Usuarios de ejemplo
let users = [
  { id: 1, username: "juan", password: bcrypt.hashSync("1234", 10), role: "employee" },
  { id: 2, username: "ana", password: bcrypt.hashSync("1234", 10), role: "admin" }
];

// Para contar intentos fallidos en sesión
let loginAttempts = {};

module.exports = { users, loginAttempts };
