const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Login endpoint
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Query user from database
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE cedula = ? OR email = ?',
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const user = rows[0];

    // In production, you should verify hashed password
    // For now, we'll check if it matches the cedula (demo purposes)
    if (password !== user.cedula) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta'
      });
    }

    // Return user data (without sensitive info)
    res.json({
      success: true,
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        cedula: user.cedula,
        ciudad: user.ciudad,
        departamento: user.departamento
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error durante el login',
      message: error.message
    });
  }
});

module.exports = router;
