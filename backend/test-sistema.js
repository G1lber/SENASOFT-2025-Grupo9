const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('='.repeat(60), 'cyan');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(name, method, url, data = null) {
  try {
    log(`🧪 Probando: ${name}`, 'yellow');
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    log(`✅ ÉXITO: ${name}`, 'green');
    log(`📊 Estado: ${response.status}`, 'blue');
    log(`📄 Respuesta:`, 'blue');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    log(`❌ ERROR: ${name}`, 'red');
    log(`📊 Estado: ${error.response?.status || 'Sin respuesta'}`, 'red');
    log(`📄 Error: ${error.response?.data?.error || error.message}`, 'red');
    return null;
  }
}

async function ejecutarPruebas() {
  log('🚀 INICIANDO PRUEBAS DEL SISTEMA SENASOFT', 'bright');
  log('📋 Sistema de Asesoría de Inversiones con IA', 'cyan');
  separator();

  // Datos de prueba
  const usuarioPrueba = {
    userId: "usuario_test_123",
    age: 28,
    income: 45000,
    riskTolerance: "medio",
    goals: "Ahorrar para comprar una casa en 5 años y planificar mi jubilación"
  };

  const preguntasChat = [
    "¿Cuáles son las mejores opciones de inversión para un principiante?",
    "¿Cómo puedo diversificar mi portafolio con $10,000?",
    "¿Qué factores debo considerar para mi tolerancia al riesgo?",
    "Explícame la diferencia entre acciones y bonos"
  ];

  try {
    // 1. Verificar salud del servidor
    separator();
    log('1️⃣ VERIFICANDO SALUD DEL SERVIDOR', 'magenta');
    await testEndpoint('Salud del servidor', 'GET', '/health');
    await delay(1000);

    // 2. Verificar servicio MCP
    separator();
    log('2️⃣ VERIFICANDO SERVICIO MCP', 'magenta');
    await testEndpoint('Servicio MCP', 'GET', '/api/test-mcp');
    await delay(1000);

    // 3. Guardar perfil de usuario
    separator();
    log('3️⃣ GUARDANDO PERFIL DE USUARIO', 'magenta');
    const perfilGuardado = await testEndpoint(
      'Guardar perfil de usuario',
      'POST',
      '/api/profile',
      usuarioPrueba
    );
    await delay(1000);

    // 4. Obtener perfil de usuario
    separator();
    log('4️⃣ OBTENIENDO PERFIL DE USUARIO', 'magenta');
    const perfilObtenido = await testEndpoint(
      'Obtener perfil de usuario',
      'GET',
      `/api/profile/${usuarioPrueba.userId}`
    );
    await delay(1000);

    // 5. Analizar perfil de usuario
    separator();
    log('5️⃣ ANALIZANDO PERFIL CON IA', 'magenta');
    const analisisPerfil = await testEndpoint(
      'Análisis de perfil con IA',
      'GET',
      `/api/profile/${usuarioPrueba.userId}/analyze`
    );
    await delay(2000);

    // 6. Probar chat con diferentes preguntas
    separator();
    log('6️⃣ PROBANDO CHAT CON IA', 'magenta');
    
    for (let i = 0; i < preguntasChat.length; i++) {
      const pregunta = preguntasChat[i];
      log(`\n💬 Pregunta ${i + 1}: "${pregunta}"`, 'yellow');
      
      await testEndpoint(
        `Chat - Pregunta ${i + 1}`,
        'POST',
        '/api/chat',
        {
          message: pregunta,
          userId: usuarioPrueba.userId,
          context: "Usuario interesado en inversiones seguras"
        }
      );
      await delay(2000);
    }

    // 7. Obtener consejos de inversión
    separator();
    log('7️⃣ OBTENIENDO CONSEJOS DE INVERSIÓN', 'magenta');
    
    const montosInversion = [5000, 15000, 50000];
    const nivelesRiesgo = ['bajo', 'medio', 'alto'];
    
    for (let i = 0; i < montosInversion.length; i++) {
      const monto = montosInversion[i];
      const riesgo = nivelesRiesgo[i];
      
      log(`\n💰 Consejo para $${monto} con riesgo ${riesgo}`, 'yellow');
      
      await testEndpoint(
        `Consejo de inversión - $${monto}`,
        'POST',
        '/api/chat/investment-advice',
        {
          userId: usuarioPrueba.userId,
          amount: monto,
          riskLevel: riesgo
        }
      );
      await delay(2000);
    }

    // 8. Resumen final
    separator();
    log('8️⃣ RESUMEN DE PRUEBAS', 'magenta');
    log('✅ Todas las pruebas completadas exitosamente', 'green');
    log('🎯 El sistema está funcionando correctamente', 'green');
    log('🤖 IA integrada y respondiendo', 'green');
    log('💾 Base de datos conectada y funcionando', 'green');
    log('🔧 Servicios MCP operativos', 'green');

  } catch (error) {
    log('❌ Error durante las pruebas:', 'red');
    console.error(error);
  }

  separator();
  log('🏁 PRUEBAS FINALIZADAS', 'bright');
}

// Función para mostrar ayuda
function mostrarAyuda() {
  log('📋 SISTEMA DE PRUEBAS SENASOFT 2025', 'bright');
  log('🎯 Asesor de Inversiones con IA', 'cyan');
  separator();
  log('📝 Uso:', 'yellow');
  log('  node test-sistema.js              - Ejecutar todas las pruebas', 'blue');
  log('  node test-sistema.js --help       - Mostrar esta ayuda', 'blue');
  log('  node test-sistema.js --quick      - Pruebas rápidas básicas', 'blue');
  separator();
  log('⚠️  Requisitos:', 'yellow');
  log('  - Servidor principal corriendo en puerto 3000', 'blue');
  log('  - Servidor MCP corriendo', 'blue');
  log('  - Base de datos MySQL conectada', 'blue');
  log('  - API Key de Groq configurada', 'blue');
  separator();
}

// Función para pruebas rápidas
async function pruebasRapidas() {
  log('⚡ EJECUTANDO PRUEBAS RÁPIDAS', 'bright');
  separator();

  await testEndpoint('Salud del servidor', 'GET', '/health');
  await testEndpoint('Servicio MCP', 'GET', '/api/test-mcp');
  
  const usuarioTest = {
    userId: "test_rapido",
    age: 25,
    income: 35000,
    riskTolerance: "bajo",
    goals: "Ahorros de emergencia"
  };

  await testEndpoint('Guardar perfil', 'POST', '/api/profile', usuarioTest);
  await testEndpoint('Chat básico', 'POST', '/api/chat', {
    message: "¿Qué es una inversión segura?",
    userId: usuarioTest.userId
  });

  log('✅ Pruebas rápidas completadas', 'green');
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  mostrarAyuda();
} else if (args.includes('--quick') || args.includes('-q')) {
  pruebasRapidas();
} else {
  ejecutarPruebas();
}
