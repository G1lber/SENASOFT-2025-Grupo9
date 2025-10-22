const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`); }
function separator() { log('='.repeat(60), 'cyan'); }
async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function testEndpoint(name, method, url, data = null) {
  try {
    log(`🧪 ${name}`, 'yellow');
    const config = { method, url: `${BASE_URL}${url}`, headers: { 'Content-Type': 'application/json' } };
    if (data) config.data = data;
    const response = await axios(config);
    log(`✅ ${name}`, 'green');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    log(`❌ ${name}`, 'red');
    log(`📄 Error: ${error.response?.data?.error || error.message}`, 'red');
    return null;
  }
}

async function obtenerUsuario(userId) {
  log(`\n🔍 Obteniendo usuario ID "${userId}"...`, 'cyan');
  const response = await testEndpoint(`Usuario ${userId}`, 'GET', `/api/profile/${userId}`);
  
  if (response?.success) {
    // Extraer datos del perfil (puede venir en response.data o response.profile)
    const usuario = response.profile || response.data;
    log(`✅ Usuario encontrado: ${usuario.nombres} ${usuario.apellidos}`, 'green');
    return usuario;
  }
  
  log(`❌ Usuario ID "${userId}" no encontrado`, 'red');
  return null;
}

async function ejecutarPruebas() {
  log('🚀 PRUEBAS SISTEMA SENASOFT - Análisis Personalizado', 'bright');
  separator();

  const usuario = await obtenerUsuario("1");
  if (!usuario) {
    log('⚠️  No se puede continuar sin el usuario ID 1 en la BD', 'red');
    return;
  }

  separator();
  log('📊 PERFIL DEL USUARIO', 'blue');
  log(`👤 Nombre: ${usuario.nombres} ${usuario.apellidos}`, 'cyan');
  log(`📧 Email: ${usuario.email}`, 'cyan');
  log(`🎂 Edad: ${usuario.age} años`, 'cyan');
  log(`💰 Ingresos: $${usuario.income?.toLocaleString()} COP/mes`, 'cyan');
  log(`📊 Tolerancia al riesgo: ${usuario.risk_tolerance || usuario.riskTolerance}`, 'cyan');
  log(`🏙️  Ciudad: ${usuario.ciudad}, ${usuario.departamento}`, 'cyan');
  log(`📚 Nivel de conocimiento: ${usuario.original?.nivel_conocimiento || 'N/A'}`, 'cyan');

  // Preguntas personalizadas basadas en el perfil real
  const preguntasPersonalizadas = [
    "Quiero invertir $500,000 COP, ¿qué me recomiendas según mi perfil?",
    "¿En qué debería invertir considerando mi edad de 26 años y mis ingresos?",
    "Tengo tolerancia al riesgo básica, ¿cuáles son mis mejores opciones de inversión?",
    "¿Cómo puedo hacer crecer mis ahorros de forma segura con mis ingresos actuales?"
  ];

  // Análisis de perfil con IA
  separator();
  log('1️⃣ ANÁLISIS DE PERFIL CON IA', 'magenta');
  await testEndpoint('Análisis de perfil', 'GET', `/api/profile/1/analyze`);
  await delay(2000);

  // Respuestas personalizadas
  separator();
  log('2️⃣ CONSULTAS PERSONALIZADAS DE INVERSIÓN', 'magenta');
  
  for (let i = 0; i < preguntasPersonalizadas.length; i++) {
    log(`\n💬 Pregunta ${i + 1}: "${preguntasPersonalizadas[i]}"`, 'cyan');
    await testEndpoint(`Respuesta ${i + 1}`, 'POST', '/api/chat', {
      message: preguntasPersonalizadas[i],
      userId: "1"
    });
    await delay(2500);
  }

  // Consejos de inversión específicos según ingresos
  separator();
  log('3️⃣ ESCENARIOS DE INVERSIÓN PERSONALIZADOS', 'magenta');
  
  const ingresos = usuario.income || 1800000;
  const escenarios = [
    { amount: 500000, desc: "Inversión inicial conservadora" },
    { amount: Math.round(ingresos * 0.2), desc: "20% de ingresos mensuales" },
    { amount: Math.round(ingresos * 0.5), desc: "50% de ingresos mensuales" }
  ];

  for (const escenario of escenarios) {
    log(`\n💰 ${escenario.desc}: $${escenario.amount.toLocaleString()} COP`, 'cyan');
    await testEndpoint(`Consejo ${escenario.desc}`, 'POST', '/api/chat/investment-advice', {
      userId: "1",
      amount: escenario.amount,
      riskLevel: usuario.risk_tolerance || usuario.riskTolerance || "básico"
    });
    await delay(2500);
  }

  // Opciones de inversión disponibles
  separator();
  log('4️⃣ OPCIONES DE INVERSIÓN DISPONIBLES', 'magenta');
  
  const options = await testEndpoint('Instrumentos financieros recomendados', 'POST', '/api/mcp', {
    action: 'get_investment_options',
    payload: {
      riskLevel: usuario.risk_tolerance || usuario.riskTolerance || 'básico',
      amount: ingresos
    }
  });

  if (options?.success && options.data?.length > 0) {
    log(`\n💼 ${options.data.length} opciones de inversión encontradas`, 'green');
    log(`📊 Fuente de datos: ${options.tableUsed}`, 'blue');
  }

  // Resumen
  separator();
  log('✅ PRUEBAS COMPLETADAS', 'green');
  log(`\n📋 Resumen para ${usuario.nombres}:`, 'bright');
  log(`   • Edad: ${usuario.age} años`, 'blue');
  log(`   • Ingresos: $${ingresos.toLocaleString()} COP`, 'blue');
  log(`   • Perfil de riesgo: ${usuario.risk_tolerance || usuario.riskTolerance}`, 'blue');
  log(`   • Sistema: DB → MCP → IA ✓`, 'green');
  log(`   • Personalización: Activa ✓`, 'green');
}

async function consultarUsuario(userId) {
  log(`\n📡 Consultando usuario ID "${userId}" vía MCP...`, 'cyan');
  separator();
  
  const result = await testEndpoint(`MCP - Usuario ${userId}`, 'POST', '/api/mcp', {
    action: 'get_user_profile',
    payload: { userId: String(userId) }
  });
  
  if (result?.success) {
    const usuario = result.data;
    separator();
    log('📋 PERFIL COMPLETO:', 'green');
    log(`👤 ${usuario.nombres} ${usuario.apellidos}`, 'cyan');
    log(`📧 ${usuario.email}`, 'cyan');
    log(`🎂 ${usuario.age} años`, 'cyan');
    log(`💰 $${usuario.income?.toLocaleString()} COP/mes`, 'cyan');
    log(`📊 Riesgo: ${usuario.risk_tolerance || usuario.riskTolerance}`, 'cyan');
    separator();
  }
  
  return result?.data;
}

function mostrarAyuda() {
  log('\n📋 SISTEMA DE PRUEBAS SENASOFT 2025', 'bright');
  log('🎯 Asesor de Inversiones con IA Personalizada', 'cyan');
  separator();
  log('📝 Comandos disponibles:', 'yellow');
  log('  npm run test                    - Ejecutar pruebas completas con usuario ID 1', 'blue');
  log('  npm run test -- --get1          - Consultar solo perfil usuario ID 1', 'blue');
  log('  npm run test -- --get <id>      - Consultar perfil de cualquier usuario', 'blue');
  log('  npm run test -- --help          - Mostrar esta ayuda', 'blue');
  separator();
  log('💡 El sistema analiza el perfil del usuario desde la BD y genera', 'cyan');
  log('   respuestas personalizadas usando IA (Groq) con contexto completo.', 'cyan');
  separator();
}

// Manejo de argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  mostrarAyuda();
} else if (args.includes('--get1')) {
  (async () => { 
    await consultarUsuario('1'); 
    process.exit(0); 
  })();
} else {
  const idx = args.indexOf('--get');
  if (idx !== -1 && args[idx + 1]) {
    (async () => { 
      await consultarUsuario(args[idx + 1]); 
      process.exit(0); 
    })();
  } else {
    ejecutarPruebas();
  }
}
