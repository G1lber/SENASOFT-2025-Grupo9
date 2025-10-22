const { pool } = require('../config/database');

class User {
  // Buscar usuario por email y cédula para login
  static async findByEmailAndCedula(email, cedula) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM usuarios WHERE email = ? AND cedula = ?`,
        [email, cedula]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findByEmailAndCedula:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM usuarios WHERE id_usuario = ?`,
        [userId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Verificar si el usuario existe por email
  static async existsByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM usuarios WHERE email = ?',
        [email]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('Error in existsByEmail:', error);
      throw error;
    }
  }

  // Calcular edad desde fecha de nacimiento
  static calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Formatear datos del usuario para respuesta
  static formatUserData(user) {
    return {
      id_usuario: user.id_usuario,
      nombres: user.nombres,
      apellidos: user.apellidos,
      cedula: user.cedula,
      edad: this.calculateAge(user.fecha_nacimiento),
      genero: user.genero,
      ciudad: user.ciudad,
      departamento: user.departamento,
      email: user.email,
      celular: user.celular,
      nivel_conocimiento: user.nivel_conocimiento,
      estrato: user.estrato,
      ingresos_mensuales_cop: user.ingresos_mensuales_cop,
      sarlaft_ok: user.sarlaft_ok,
      es_pep: user.es_pep
    };
  }
}

module.exports = User;
