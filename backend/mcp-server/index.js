const { pool } = require('../src/config/database.js');
require('dotenv').config();

// Initialize Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in environment variables');
  console.log('⚠️ Will use fallback responses instead');
} else {
  console.log('✅ Groq API configured');
  console.log(`🤖 Model: ${GROQ_MODEL}`);
}

// Simple MCP-like server implementation
class MCPServer {
  constructor() {
    this.tools = new Map();
    this.conversationHistory = new Map(); // Historial por usuario
    this.setupTools();
  }

  setupTools() {
    // Using arrow functions to preserve 'this' context
    this.tools.set('get_user_profile', {
      description: 'Retrieve user profile from database',
      handler: (args) => this.getUserProfile(args)
    });

    this.tools.set('save_user_profile', {
      description: 'Save user profile to database',
      handler: (args) => this.saveUserProfile(args)
    });

    this.tools.set('get_investment_options', {
      description: 'Get investment options based on user profile',
      handler: (args) => this.getInvestmentOptions(args)
    });

    this.tools.set('analyze_with_groq', {
      description: 'Analyze data using AI model',
      handler: (args) => this.analyzeWithGroq(args)
    });

    this.tools.set('analyze_investment_profile', {
      description: 'Complete investment profile analysis',
      handler: (args) => this.analyzeInvestmentProfile(args)
    });

    this.tools.set('get_user_objectives', {
      description: 'Retrieve user objectives from database',
      handler: (args) => this.getUserObjectives(args)
    });

    this.tools.set('check_table_exists', {
      description: 'Check if a database table exists',
      handler: (args) => this.checkTableExists(args)
    });

    this.tools.set('get_database_schema', {
      description: 'List database tables',
      handler: () => this.getDatabaseSchema()
    });

    this.tools.set('clear_conversation', {
      description: 'Clear conversation history for a user',
      handler: (args) => this.clearConversationHistory(args)
    });

    this.tools.set('get_conversation_history', {
      description: 'Get conversation history for a user',
      handler: (args) => this.getConversationHistory(args)
    });
  }

  calculateAge(birthDate) {
    if (!birthDate) return null;
    
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      
      // Verificar que la fecha es válida
      if (isNaN(birth.getTime())) {
        console.log(`⚠️ Invalid birth date: ${birthDate}`);
        return null;
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      // Validar que la edad es razonable (entre 18 y 120 años)
      if (age < 18 || age > 120) {
        console.log(`⚠️ Unreasonable age calculated: ${age} from ${birthDate}`);
        return null;
      }
      
      return age;
    } catch (error) {
      console.error(`Error calculating age from ${birthDate}:`, error);
      return null;
    }
  }

  async getUserObjectives(args) {
    const { userId } = args;
    if (!userId) throw new Error('userId is required');

    try {
      const [rows] = await pool.execute(
        'SELECT * FROM objetivos WHERE id_usuario = ?',
        [userId]
      );

      return {
        success: true,
        data: rows,
        message: `Found ${rows.length} objectives for user ${userId}`
      };
    } catch (error) {
      console.error('Database error in getUserObjectives:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getUserProfile(args) {
    const { userId } = args;

    if (!userId) {
      throw new Error('UserId is required');
    }

    try {
      const [rowsDDL] = await pool.execute(
        'SELECT * FROM usuarios WHERE id_usuario = ?',
        [userId]
      );

      if (rowsDDL && rowsDDL.length > 0) {
        const u = rowsDDL[0];
        
        // Calcular edad de forma segura
        const edad = this.calculateAge(u.fecha_nacimiento);
        
        // Log para debugging
        console.log(`📊 User data: fecha_nacimiento=${u.fecha_nacimiento}, edad calculada=${edad}, ingresos=${u.ingresos_mensuales_cop}`);
        
        const mappedUser = {
          user_id: u.id_usuario,
          age: edad,
          income: parseInt(u.ingresos_mensuales_cop) || 0,
          risk_tolerance: u.nivel_conocimiento || 'Básico',
          goals: null,
          nombres: u.nombres || 'Usuario',
          apellidos: u.apellidos || '',
          email: u.email || '',
          ciudad: u.ciudad || 'Colombia',
          departamento: u.departamento || '',
          cedula: u.cedula || '',
          genero: u.genero || '',
          estrato: u.estrato || 0,
          fecha_nacimiento: u.fecha_nacimiento,
          original: u
        };

        console.log(`✅ Mapped user profile: edad=${mappedUser.age}, ingresos=${mappedUser.income}`);

        return {
          success: true,
          data: mappedUser,
          message: 'User profile found',
          tableUsed: 'usuarios'
        };
      }

      return {
        success: true,
        data: null,
        message: 'User profile not found in any table'
      };

    } catch (error) {
      console.error('Database error in getUserProfile:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async saveUserProfile(args) {
    const { userId, age, income, riskTolerance, goals, nombres, apellidos, email } = args;

    if (!userId) {
      throw new Error('UserId is required');
    }

    try {
      if (!nombres || !apellidos || !email) {
        throw new Error('To save provide nombres, apellidos and email');
      }

      const fechaNacimiento = age ? new Date(new Date().getFullYear() - age, 0, 1) : new Date('1990-01-01');

      await pool.execute(`
        INSERT INTO usuarios (
          id_usuario, nombres, apellidos, cedula, fecha_nacimiento, genero,
          ciudad, departamento, direccion, email, celular, nivel_conocimiento,
          estrato, ingresos_mensuales_cop, sarlaft_ok, es_pep
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombres = VALUES(nombres),
          apellidos = VALUES(apellidos),
          email = VALUES(email),
          nivel_conocimiento = VALUES(nivel_conocimiento),
          ingresos_mensuales_cop = VALUES(ingresos_mensuales_cop)
      `, [
        userId, nombres, apellidos, `CC${userId}`, fechaNacimiento, 'M',
        'Ciudad por defecto', 'Departamento por defecto', 'Dirección por defecto',
        email, '3000000000', riskTolerance || 'Principiante', 3, income || 0, 'S', 'N'
      ]);

      return {
        success: true,
        message: 'Profile saved successfully',
        tableUsed: 'usuarios'
      };

    } catch (error) {
      console.error('Database error in saveUserProfile:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getInvestmentOptions(args) {
    const { riskLevel = 'medium', amount = 0 } = args;

    try {
      const [rowsDDL] = await pool.execute(
        'SELECT * FROM instrumentos_financieros WHERE min_inversion_cop <= ? LIMIT 10',
        [amount]
      );

      const mapped = (rowsDDL || []).map(item => ({
        id: item.id_instrumento,
        name: item.tipo_instrumento,
        risk_level: item.nivel_riesgo,
        min_amount: item.min_inversion_cop,
        expected_return: item.tasa_nominal_anual_pct,
        liquidity_days: item.liquidez_dias,
        currency: item.moneda,
        commission: item.comision_apertura_pct,
        bank_id: item.id_banco,
        original: item
      }));

      return {
        success: true,
        data: mapped,
        message: `Found ${mapped.length} investment options`,
        tableUsed: 'instrumentos_financieros'
      };

    } catch (error) {
      console.error('Database error in getInvestmentOptions:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async checkTableExists(args) {
    const { tableName } = args || {};
    if (!tableName) {
      throw new Error('tableName is required');
    }

    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS table_exists
         FROM information_schema.tables
         WHERE table_schema = DATABASE()
         AND table_name = ?`,
        [tableName]
      );
      const exists = rows[0] && rows[0].table_exists > 0;
      return {
        success: true,
        data: { tableName, exists },
        message: exists ? `Table ${tableName} exists` : `Table ${tableName} does not exist`
      };
    } catch (err) {
      console.error('Database error in checkTableExists:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async getDatabaseSchema() {
    try {
      const [rows] = await pool.execute(
        `SELECT table_name, table_type, engine
         FROM information_schema.tables
         WHERE table_schema = DATABASE()
         ORDER BY table_name`
      );
      return {
        success: true,
        data: rows,
        message: `Found ${rows.length} tables in database`
      };
    } catch (err) {
      console.error('Database error in getDatabaseSchema:', err);
      throw new Error(`Database error: ${err.message}`);
    }
  }

  async ensureUserProfileInArgs(args = {}) {
    if (!args.userId) return args;
    if (args.userProfile) return args;
    try {
      const profileResult = await this.getUserProfile({ userId: args.userId });
      if (profileResult && profileResult.success && profileResult.data) {
        return { ...args, userProfile: profileResult.data };
      }
      return args;
    } catch (err) {
      throw err;
    }
  }

  async analyzeWithGroq(args) {
    const { prompt, context = '', userProfile, userId, conversationHistory = [] } = args || {};
    
    if (!prompt) {
      throw new Error('Prompt is required for analysis');
    }

    // Construir perfil resumido del usuario con validaciones
    let perfilResumido = '';
    if (userProfile) {
      const nombre = `${userProfile.nombres || 'Usuario'} ${userProfile.apellidos || ''}`.trim();
      const ciudad = userProfile.ciudad || 'Colombia';
      const departamento = userProfile.departamento || '';
      const ubicacion = departamento ? `${ciudad}, ${departamento}` : ciudad;
      const ingresos = parseInt(userProfile.income) || 0;
      const edad = userProfile.age;
      const nivel = userProfile.risk_tolerance || 'Básico';
      
      perfilResumido = `
👤 Usuario: ${nombre}
📍 Ubicación: ${ubicacion}
💰 Ingresos: $${ingresos.toLocaleString('es-CO')} COP/mes
📚 Nivel: ${nivel}`;
      
      // Solo agregar edad si está disponible
      if (edad !== null && edad !== undefined) {
        perfilResumido += `\n🎂 Edad: ${edad} años`;
      }
    }

    const fullContext = `${perfilResumido}\n${context}`;

    if (!GROQ_API_KEY) {
      console.log('⚠️ Groq API key not available, using fallback response');
      return this.generateFallbackResponse(prompt, fullContext, userProfile);
    }

    try {
      // Sistema de prompts optimizado
      const systemPrompt = `Eres Santiago, un asesor financiero colombiano experto, certificado y con amplia experiencia.

🎯 PERSONALIDAD:
- Tono cercano, profesional pero amigable
- Usa el nombre del usuario de forma natural
- Respuestas CONCISAS: máximo 200 palabras (salvo análisis complejos)
- Emojis estratégicos: 💰 📊 🏦 ✅ 🎯 ⚠️ (máximo 3 por respuesta)
- Español colombiano natural

📚 EXPERTISE:
- Mercado financiero colombiano: CDTs, TES, fondos, BVC
- Bancos: Bancolombia, Davivienda, BBVA, Colpatria
- Regulación: Superintendencia Financiera de Colombia
- Tasas realistas 2024-2025: CDT 9-12% EA, Fondos 5-15%

🔄 METODOLOGÍA (NO MENCIONAR EXPLÍCITAMENTE):
1. Entender necesidad inmediata
2. Evaluar perfil silenciosamente (NO revelar perfil de riesgo)
3. Recomendar opciones específicas y realistas
4. Advertir riesgos cuando aplique
5. Sugerir siguiente paso práctico

📝 FORMATO RESPUESTAS (ESTRICTO):
1. Saludo personalizado (SOLO primera vez o después de pausa larga)
2. Respuesta directa (2-3 párrafos máximo)
3. Recomendaciones específicas (máximo 3 opciones con números reales)
4. Una pregunta de seguimiento

⚠️ REGLAS CRÍTICAS:
✅ SIEMPRE montos en COP con formato colombiano
✅ Tasas realistas del mercado colombiano
✅ Advertencias sobre riesgo en inversiones
✅ NO repetir información ya dicha en el chat
✅ NO revelar perfil de riesgo del usuario directamente
✅ NO prometer rentabilidades garantizadas
✅ Respuestas CORTAS y al punto
✅ Si faltan datos (edad, ingresos), pregunta de forma natural

🎯 MANEJO DE DATOS FALTANTES:
- Si edad NO disponible: NO asumas, pregunta sutilmente: "¿Me podrías compartir tu edad para recomendaciones más precisas?"
- Si ingresos en $0: pregunta: "¿Cuáles son tus ingresos mensuales aproximados?"
- Si faltan ambos: prioriza preguntar primero ingresos, luego edad
- NO inventes datos ni hagas suposiciones

❌ PROHIBIDO:
❌ Respuestas largas y redundantes
❌ Repetir lo mismo de mensajes anteriores
❌ Saludos en cada mensaje (solo al inicio)
❌ "Tu perfil de riesgo es X" (NO revelar)
❌ Información genérica sin números concretos
❌ Asumir datos que no están disponibles

💡 EJEMPLOS BUENOS:
✅ "Con tus $1.800.000 mensuales y 24 años, te sugiero: CDT 90 días en Bancolombia 10.2% EA (mínimo $500K). ¿Cuánto podrías apartar mensualmente?"
✅ "Para darte mejores recomendaciones, ¿me compartes tu edad y tus ingresos mensuales aproximados?"
✅ "Veo que tienes nivel Básico en Barranquilla. Para sugerirte opciones específicas, ¿cuáles son tus ingresos mensuales?"

❌ EJEMPLOS MALOS:
❌ "Como persona de mediana edad..." (asumiendo edad desconocida)
❌ "Con tus ingresos estándar..." (inventando datos)
❌ "Basándome en tu edad de 30 años..." (cuando no está disponible)

🎓 RUTA DE APRENDIZAJE (cuando aplique):
- "Para profundizar: [enlace específico]"
- "Bancolombia tiene tutorial gratuito sobre..."
- "La Superfinanciera explica esto en..."

RECUERDA: 
1. Lee el historial del chat, NO repitas información ya compartida
2. Si faltan datos críticos (edad/ingresos), pregúntalos de forma natural
3. NUNCA asumas o inventes información del usuario
4. Sé directo, específico y conciso`;

      // Construir mensajes
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Agregar contexto del usuario
      if (fullContext.trim()) {
        messages.push({
          role: 'system',
          content: `Contexto del usuario (usa esta info, NO la repitas):\n${fullContext}`
        });
      }

      // Obtener historial almacenado si no se proporciona
      let effectiveHistory = conversationHistory;
      if ((!effectiveHistory || effectiveHistory.length === 0) && userId && this.conversationHistory.has(userId)) {
        effectiveHistory = this.conversationHistory.get(userId);
      }

      // Agregar historial previo (últimas 8 mensajes = 4 intercambios)
      if (effectiveHistory && effectiveHistory.length > 0) {
        const recentHistory = effectiveHistory.slice(-8);
        messages.push(...recentHistory);
        console.log(`📚 Using ${recentHistory.length} messages from history`);
      }

      // Agregar mensaje actual del usuario
      messages.push({
        role: 'user',
        content: prompt
      });

      console.log(`📨 Sending ${messages.length} messages to Groq`);
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.85,
          frequency_penalty: 0.5,
          presence_penalty: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || 'No se pudo generar respuesta';

      // Almacenar en historial si hay userId
      if (userId) {
        if (!this.conversationHistory.has(userId)) {
          this.conversationHistory.set(userId, []);
        }
        const history = this.conversationHistory.get(userId);
        history.push(
          { role: 'user', content: prompt },
          { role: 'assistant', content: generatedText }
        );
        if (history.length > 8) {
          history.splice(0, history.length - 8);
        }
        console.log(`💾 Stored conversation for user ${userId} (${history.length} messages)`);
      }

      return {
        success: true,
        data: generatedText.trim(),
        message: 'Analysis completed successfully with Groq AI',
        conversationHistory: userId ? this.conversationHistory.get(userId) : effectiveHistory
      };
    } catch (error) {
      console.error('Groq API error:', error);
      console.log('⚠️ Using fallback response generator');
      return this.generateFallbackResponse(prompt, fullContext, userProfile);
    }
  }

  generateFallbackResponse(prompt, context, userProfile) {
    console.log('📝 Generando respuesta simulada');
    
    let nombre = "Usuario";
    let ingresos = null;
    let edad = null;
    let ciudad = "Colombia";
    
    if (userProfile) {
      nombre = userProfile.nombres || "Usuario";
      ingresos = parseInt(userProfile.income) || null;
      edad = userProfile.age;
      ciudad = userProfile.ciudad || "Colombia";
    }

    const promptLower = prompt.toLowerCase();
    let respuesta;

    // Verificar si faltan datos críticos
    const faltanDatos = !ingresos || ingresos === 0 || edad === null || edad === undefined;

    if (faltanDatos && (promptLower.includes("informacion") || promptLower.includes("tengo") || promptLower.includes("sobre mi"))) {
      respuesta = `Hola ${nombre}! 👋

Tengo la siguiente información:
${edad !== null && edad !== undefined ? `✅ Edad: ${edad} años` : '❌ Edad: No disponible'}
${ingresos && ingresos > 0 ? `✅ Ingresos: $${ingresos.toLocaleString('es-CO')} COP/mes` : '❌ Ingresos: No disponible'}
✅ Ciudad: ${ciudad}

Para darte recomendaciones personalizadas, necesito ${!edad ? 'tu edad' : ''}${!edad && (!ingresos || ingresos === 0) ? ' y ' : ''}${!ingresos || ingresos === 0 ? 'tus ingresos mensuales' : ''}. ¿Me los compartes? 📊`;

    } else if (faltanDatos) {
      respuesta = `Hola ${nombre}! 👋

Para ayudarte mejor, necesito conocer:
${!edad || edad === null ? '• Tu edad' : ''}
${!ingresos || ingresos === 0 ? '• Tus ingresos mensuales aproximados' : ''}

¿Me los podrías compartir? Así te daré recomendaciones más precisas 🎯`;

    } else if (promptLower.includes("cdt")) {
      respuesta = `¡Excelente ${nombre}! 💰

**Opciones CDT en ${ciudad}:**
1. 90 días - 9.8% EA (mín. $500K)
2. 180 días - 10.5% EA (mín. $1M)
3. 360 días - 11.2% EA

Con $${ingresos.toLocaleString('es-CO')} COP/mes, podrías invertir $${Math.round(ingresos * 0.2).toLocaleString('es-CO')}-${Math.round(ingresos * 0.3).toLocaleString('es-CO')}K mensualmente.

¿Qué plazo te interesa?`;
      
    } else {
      respuesta = `Hola ${nombre}! 👋

Perfil confirmado:
📍 ${ciudad}
${edad ? `🎂 ${edad} años` : ''}
💰 $${ingresos ? ingresos.toLocaleString('es-CO') : '0'} COP/mes

¿En qué puedo asesorarte hoy? 🎯`;
    }

    return {
      success: true,
      data: respuesta,
      message: 'Fallback response',
      usingFallback: true,
      conversationHistory: []
    };
  }

  clearConversationHistory(args) {
    const { userId } = args || {};
    if (!userId) {
      throw new Error('userId is required');
    }

    if (this.conversationHistory.has(userId)) {
      this.conversationHistory.delete(userId);
      return { 
        success: true, 
        message: `Historial borrado para usuario ${userId}` 
      };
    }
    return { 
      success: false, 
      message: `No hay historial para usuario ${userId}` 
    };
  }

  getConversationHistory(args) {
    const { userId } = args || {};
    if (!userId) {
      throw new Error('userId is required');
    }

    if (this.conversationHistory.has(userId)) {
      return {
        success: true,
        data: this.conversationHistory.get(userId),
        message: `${this.conversationHistory.get(userId).length} mensajes`
      };
    }
    return { 
      success: false, 
      data: [], 
      message: 'No hay historial' 
    };
  }

  async processAgentRequest(request) {
    const { action, payload = {}, metadata } = request;

    if (!action) {
      throw new Error('Action is required in agent request');
    }

    try {
      console.log(`🤖 Processing agent request: ${action}`);
      const enrichedPayload = await this.ensureUserProfileInArgs(payload);
      const result = await this.callTool(action, enrichedPayload || {});

      return {
        success: result.success,
        data: result.data,
        message: result.message,
        error: result.error,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
          action: action
        }
      };
    } catch (error) {
      console.error(`Agent request error for ${action}:`, error);
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
          action: action,
          errorType: 'ProcessingError'
        }
      };
    }
  }

  async callTool(toolName, args) {
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      const result = await tool.handler(args);
      return result;
    } catch (error) {
      console.error(`Tool error for ${toolName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  listTools() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description
    }));
  }
}

// Test function to verify the server works
async function testServer() {
  const server = new MCPServer();
  
  console.log('🧪 Testing MCP Server...');
  
  // Test database connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // Test Groq API
  if (GROQ_API_KEY) {
    console.log('✅ Groq API key configured');
    console.log(`🤖 Model: ${GROQ_MODEL}`);
    
    // Test Groq connection
    try {
      const testResult = await server.callTool('analyze_with_groq', {
        prompt: 'Responde en una línea: ¿Qué es una inversión?',
        context: 'Test de conexión con Groq'
      });
      if (testResult.usingFallback) {
        console.log('⚠️ Groq API test using fallback response');
      } else {
        console.log('✅ Groq API connection successful');
      }
      console.log('📝 Test response:', testResult.data.substring(0, 150) + '...');
    } catch (error) {
      console.error('❌ Groq API test failed:', error.message);
    }
  } else {
    console.log('⚠️ Groq API key not available - will use fallback responses');
  }

  // List available tools
  const tools = server.listTools();
  console.log('🔧 Available tools:', tools.map(t => t.name).join(', '));
  
  console.log('🚀 MCP Server is ready!');
  return server;
}

// Export for use in other modules
async function createMCPServer() {
  return new MCPServer();
}

// Main function
async function main() {
  try {
    const server = await testServer();

    // Keep the process running
    console.log('🎯 MCP Server running... Press Ctrl+C to stop');

    // Example usage
    setInterval(async () => {
      // This keeps the server alive and shows it's working
      const tools = server.listTools();
      console.log(`💓 Server heartbeat - ${tools.length} tools available`);
    }, 30000); // Every 30 seconds

  } catch (error) {
    console.error('❌ Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down MCP server...');
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
  process.exit(0);
});

// Export the server class and creation function
module.exports = { MCPServer, createMCPServer };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
