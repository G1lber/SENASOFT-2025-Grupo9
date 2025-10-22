const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

const c = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', red: '\x1b[31m'
};

function log(msg, color = 'reset') { 
  console.log(`${c[color]}${msg}${c.reset}`); 
}

function sep() { 
  console.log(`${c.cyan}${'='.repeat(70)}${c.reset}`); 
}

async function testLogin(email, cedula) {
  try {
    log('\n📤 Intentando login...', 'yellow');
    log(`📧 Email: ${email}`, 'blue');
    log(`🆔 Cédula: ${cedula}`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: email,
      cedula: cedula
    });
    
    sep();
    log('✅ LOGIN EXITOSO', 'green');
    sep();
    
    const data = response.data;
    
    if (data.success && data.user) {
      log('\n👤 DATOS DEL USUARIO:', 'green');
      log(`   ID: ${data.user.id_usuario}`, 'cyan');
      log(`   Nombre: ${data.user.nombres} ${data.user.apellidos}`, 'cyan');
      log(`   Email: ${data.user.email}`, 'cyan');
      log(`   Edad: ${data.user.edad} años`, 'cyan');
      log(`   Ciudad: ${data.user.ciudad}, ${data.user.departamento}`, 'cyan');
      log(`   Ingresos: $${data.user.ingresos_mensuales_cop?.toLocaleString()} COP`, 'cyan');
      log(`   Nivel: ${data.user.nivel_conocimiento}`, 'cyan');
      log(`   SARLAFT: ${data.user.sarlaft_ok}`, 'cyan');
      sep();
      
      return data.user;
    }
    
  } catch (error) {
    log('\n❌ ERROR EN LOGIN', 'red');
    if (error.response) {
      log(`Estado: ${error.response.status}`, 'red');
      log(`Mensaje: ${error.response.data.message}`, 'red');
      log(`Código: ${error.response.data.error}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    sep();
    return null;
  }
}

async function testVerifySession(userId) {
  try {
    log('\n🔍 Verificando sesión...', 'yellow');
    log(`👤 User ID: ${userId}`, 'blue');
    
    const response = await axios.get(`${BASE_URL}/api/auth/verify/${userId}`);
    
    log('✅ Sesión válida', 'green');
    log(`Usuario: ${response.data.user.nombres} ${response.data.user.apellidos}`, 'cyan');
    
    return response.data;
    
  } catch (error) {
    log('❌ Sesión inválida', 'red');
    return null;
  }
}

async function ejecutarPruebas() {
  log('\n🚀 TEST DE LOGIN - SENASOFT 2025', 'green');
  log('🔐 Autenticación con Email y Cédula\n', 'cyan');
  
  // Prueba 1: Login exitoso (usa datos reales de tu BD)
  log('📋 PRUEBA 1: Login exitoso', 'yellow');
  const usuario = await testLogin('santiago.torres52@gmail.com', '71070189');
  
  if (usuario) {
    // Prueba 2: Verificar sesión
    await new Promise(resolve => setTimeout(resolve, 1000));
    log('\n📋 PRUEBA 2: Verificar sesión', 'yellow');
    await testVerifySession(usuario.id_usuario);
  }
  
  // Prueba 3: Login fallido - credenciales incorrectas
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('\n📋 PRUEBA 3: Login con credenciales incorrectas', 'yellow');
  await testLogin('correo@falso.com', '123456789');
  
  // Prueba 4: Login fallido - email inválido
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('\n📋 PRUEBA 4: Login con email inválido', 'yellow');
  await testLogin('email-invalido', '71070189');
  
  // Prueba 5: Login fallido - datos incompletos
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('\n📋 PRUEBA 5: Login con datos incompletos', 'yellow');
  await testLogin('santiago.torres52@gmail.com', '');
  
  log('\n✅ PRUEBAS COMPLETADAS\n', 'green');
}

// Función para prueba individual
async function pruebaIndividual() {
  const email = process.argv[2] || 'santiago.torres52@gmail.com';
  const cedula = process.argv[3] || '71070189';
  
  log('\n🎯 PRUEBA INDIVIDUAL DE LOGIN', 'green');
  const usuario = await testLogin(email, cedula);
  
  if (usuario) {
    await testVerifySession(usuario.id_usuario);
  }
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help')) {
  log('\n📋 TEST DE LOGIN - USO', 'green');
  sep();
  log('Comandos:', 'yellow');
  log('  node test-login.js                           - Ejecutar todas las pruebas', 'cyan');
  log('  node test-login.js <email> <cedula>          - Prueba individual', 'cyan');
  log('  node test-login.js --help                    - Mostrar ayuda', 'cyan');
  sep();
  log('\nEjemplo:', 'yellow');
  log('  node test-login.js santiago.torres52@gmail.com 71070189', 'cyan');
  sep();
} else if (args.length >= 2) {
  pruebaIndividual();
} else {
  ejecutarPruebas();
}
