const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

// Colores para consola
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

async function enviarPregunta(userId, pregunta) {
  try {
    log(`\n📤 Enviando pregunta...`, 'yellow');
    log(`👤 Usuario ID: ${userId}`, 'blue');
    log(`💬 Pregunta: "${pregunta}"`, 'cyan');
    
    const inicio = Date.now();
    
    const response = await axios.post(`${BASE_URL}/api/chat`, {
      message: pregunta,
      userId: userId
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const tiempo = ((Date.now() - inicio) / 1000).toFixed(2);
    
    sep();
    log(`✅ RESPUESTA RECIBIDA (${tiempo}s)`, 'green');
    sep();
    
    const data = response.data;
    
    if (data.success) {
      // Mostrar perfil del usuario si está disponible
      if (data.userProfile) {
        log('\n👤 PERFIL DEL USUARIO:', 'blue');
        log(`   Nombre: ${data.userProfile.nombres} ${data.userProfile.apellidos}`, 'cyan');
        log(`   Edad: ${data.userProfile.age} años`, 'cyan');
        log(`   Ingresos: $${data.userProfile.income?.toLocaleString()} COP`, 'cyan');
        log(`   Riesgo: ${data.userProfile.risk_tolerance}`, 'cyan');
        sep();
      }
      
      // Mostrar respuesta de la IA
      log('\n🤖 RESPUESTA PERSONALIZADA:', 'green');
      console.log(data.response);
      sep();
      
      return data;
    } else {
      log(`❌ Error: ${data.error || 'Respuesta no exitosa'}`, 'red');
      return null;
    }
    
  } catch (error) {
    log(`\n❌ ERROR EN LA PETICIÓN`, 'red');
    log(`Detalles: ${error.response?.data?.error || error.message}`, 'red');
    return null;
  }
}

async function ejecutarPruebas() {
  log('\n🚀 TEST DE CHAT PERSONALIZADO - SENASOFT 2025', 'green');
  log('📋 Probando respuestas personalizadas con perfil de usuario\n', 'cyan');
  
  // ID del usuario a probar (cambia esto según necesites)
  const userId = "1";
  
  // Preguntas de prueba
  const preguntas = [
    "Quiero invertir $500,000 COP, ¿qué me recomiendas?",
    "¿Cuál es la mejor estrategia de inversión para mi edad y mis ingresos?",
    "Tengo tolerancia al riesgo básica, ¿en qué debería invertir?",
    "¿Cómo puedo diversificar mi portafolio de forma segura?"
  ];
  
  log(`🎯 Usuario de prueba: ID ${userId}`, 'yellow');
  log(`📝 Total de preguntas: ${preguntas.length}\n`, 'yellow');
  sep();
  
  for (let i = 0; i < preguntas.length; i++) {
    log(`\n\n[${i + 1}/${preguntas.length}]`, 'yellow');
    await enviarPregunta(userId, preguntas[i]);
    
    // Esperar 2 segundos entre preguntas
    if (i < preguntas.length - 1) {
      log('\n⏳ Esperando 2 segundos antes de la siguiente pregunta...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  log('\n\n✅ PRUEBAS COMPLETADAS', 'green');
  log('📊 Todas las preguntas fueron procesadas con personalización\n', 'cyan');
}

// Función para prueba individual
async function pruebaIndividual() {
  const userId = process.argv[3] || "1";
  const pregunta = process.argv[4] || "¿En qué debería invertir según mi perfil?";
  
  log('\n🎯 PRUEBA INDIVIDUAL', 'green');
  await enviarPregunta(userId, pregunta);
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('\n📋 TEST DE CHAT PERSONALIZADO - USO', 'green');
  sep();
  log('Comandos disponibles:', 'yellow');
  log('  node test-chat-personalizado.js                  - Ejecutar todas las pruebas', 'cyan');
  log('  node test-chat-personalizado.js --single <id> "<pregunta>" - Prueba individual', 'cyan');
  log('  node test-chat-personalizado.js --help           - Mostrar ayuda', 'cyan');
  sep();
  log('\nEjemplo de uso:', 'yellow');
  log('  node test-chat-personalizado.js --single 1 "¿Cómo invertir 1 millón?"', 'cyan');
  sep();
} else if (args.includes('--single')) {
  pruebaIndividual();
} else {
  ejecutarPruebas();
}
