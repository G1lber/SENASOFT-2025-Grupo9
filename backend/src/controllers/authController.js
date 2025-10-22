const User = require('../models/User');

// Login de usuario con email y cédula
const login = async (req, res) => {
  try {
    const { email, cedula } = req.body;

    // Validar que se envíen ambos campos
    if (!email || !cedula) {
      return res.status(400).json({
        success: false,
        message: 'Email y cédula son requeridos',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
        error: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Buscar usuario en la base de datos
    const user = await User.findByEmailAndCedula(email, cedula);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      });
    }

    if (user.sarlaft_ok !== 'S') {
      return res.status(403).json({
        success: false,
        message: 'Cuenta pendiente de verificación SARLAFT',
        error: 'SARLAFT_NOT_APPROVED'
      });
    }

    // Login exitoso - formatear datos del usuario
    const userData = User.formatUserData(user);

    res.json({
      success: true,
      message: 'Login exitoso',
      user: userData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el login',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Verificar sesión / obtener datos del usuario
const verifySession = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido',
        error: 'MISSING_USER_ID'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND'
      });
    }

    const userData = User.formatUserData(user);

    res.json({
      success: true,
      message: 'Sesión válida',
      user: userData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in verifySession:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar sesión',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Logout
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  login,
  verifySession,
  logout
};
