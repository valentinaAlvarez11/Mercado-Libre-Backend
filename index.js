const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

const db = new sqlite3.Database('./usuarios.db', (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  telefono TEXT,
  nombre TEXT,
  contraseña TEXT
)`);

// Middleware para procesar JSON y cookies
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("mercado libre");
});

app.post("/register", (req, res) => {
  const { email, telefono, nombre, contraseña } = req.body;
  if (!email || !telefono || !nombre || !contraseña) {
    return res.status(400).json({ error: "Por favor completa todos los campos." });
  }
  db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Hubo un problema al acceder a la base de datos." });
    }
    if (row) {
      return res.status(409).json({ error: "Ya existe una cuenta registrada con este correo." });
    }
    db.run(
      "INSERT INTO usuarios (email, telefono, nombre, contraseña) VALUES (?, ?, ?, ?)",
      [email, telefono, nombre, contraseña],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "No se pudo registrar el usuario. Intenta nuevamente." });
        }
        res.json({
          mensaje: `¡Bienvenido/a, ${nombre}! Tu registro fue exitoso.`,
          usuario: { email, telefono, nombre }
        });
      }
    );
  });
});

app.post("/login", (req, res) => {
  const { email, contraseña } = req.body;
  if (!email || !contraseña) {
    return res.status(400).json({ error: "Email y contraseña son requeridos." });
  }
  // Buscar usuario en la base de datos
  db.get(
    "SELECT * FROM usuarios WHERE email = ? AND contraseña = ?",
    [email, contraseña],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Error en la base de datos." });
      }
      if (!row) {
        return res.status(401).json({ error: "Credenciales incorrectas." });
      }
      const payload = { email };
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
      res.json({ token });
    }
  );
});

app.get("/usuarios", (req, res) => {
  db.all("SELECT id, email, telefono, nombre FROM usuarios", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error al consultar usuarios." });
    }
    res.json({ usuarios: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

