const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;
const SECRET_KEY = "hola123";

// Middleware para procesar JSON y cookies
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("¡Hola mundo desde Node.js!");
});

app.post("/register", (req, res) => {
  const { email, telefono, nombre, contraseña } = req.body;
  if (!email || !telefono || !nombre || !contraseña) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }
  res.json({
    mensaje: "Registro exitoso",
    datos: { email, telefono, nombre }
  });
});

app.post("/login", (req, res) => {
  const { email, contraseña } = req.body;
  if (!email || !contraseña) {
    return res.status(400).json({ error: "Email y contraseña son requeridos." });
  }
  const payload = { email };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
  // Guardar el token en una cookie httpOnly
  res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
