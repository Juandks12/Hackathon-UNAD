const jwt = require("jsonwebtoken");
const SECRET = "secretito123";

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
}

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "Token requerido" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Token inválido" });
    req.user = decoded;
    next();
  });
}

module.exports = { generateToken, verifyToken };
