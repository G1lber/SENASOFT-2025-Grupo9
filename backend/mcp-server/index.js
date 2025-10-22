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
  }

  calculateAge(birthDate) {
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
      try {
        const [rows] = await pool.execute(
          'SELECT * FROM usuarios WHERE id_usuario = ?',
          [userId]
        );
        if (rows && rows.length > 0) {
          return {
            success: true,
            data: rows[0],
            message: 'User profile found (legacy table)',
            tableUsed: 'usuarios'
          };
        }
      } catch (legacyErr) {
        console.log('Legacy user_profiles query failed, trying DDL table usuarios...', legacyErr.message);
      }

      const [rowsDDL] = await pool.execute(
        'SELECT * FROM usuarios WHERE id_usuario = ?',
        [userId]
      );

      if (rowsDDL && rowsDDL.length > 0) {
        const u = rowsDDL[0];
        const mappedUser = {
          user_id: u.id_usuario,
          age: this.calculateAge(u.fecha_nacimiento),
          income: u.ingresos_mensuales_cop,
          risk_tolerance: u.nivel_conocimiento,
          goals: null,
          nombres: u.nombres,
          apellidos: u.apellidos,
          email: u.email,
          ciudad: u.ciudad,
          departamento: u.departamento,
          original: u
        };

        return {
          success: true,
          data: mappedUser,
          message: 'User profile found (DDL usuarios)',
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
    const { prompt, context = '', userProfile } = args || {};
    
    if (!prompt) {
      throw new Error('Prompt is required for analysis');
    }

    const fullContext = userProfile
      ? `${context}\n\nPerfil del Usuario:\n${JSON.stringify(userProfile, null, 2)}`
      : context;

    if (!GROQ_API_KEY) {
      console.log('⚠️ Groq API key not available, using fallback response');
      return this.generateFallbackResponse(prompt, fullContext, userProfile);
    }

    try {
      const systemPrompt = `Eres un asesor financiero experto en el mercado colombiano. 
Proporciona consejos claros y útiles sobre inversiones en español.
Considera pesos colombianos (COP), instrumentos de inversión locales y regulaciones financieras colombianas.
Adapta tus respuestas al perfil específico del usuario (edad, ingresos, tolerancia al riesgo).`;
      
      const userMessage = `${prompt}\n\nContexto: ${fullContext}`;
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || 'No se pudo generar respuesta';

      return {
        success: true,
        data: generatedText.trim(),
        message: 'Analysis completed successfully with Groq AI'
      };
    } catch (error) {
      console.error('Groq API error:', error);
      console.log('⚠️ Using fallback response generator');
      return this.generateFallbackResponse(prompt, fullContext, userProfile);
    }
  }

  generateFallbackResponse(prompt, context, userProfile) {
    console.log('📝 Generando respuesta simulada con datos locales');
    
    let edad = 30;
    let ingresos = 2000000;
    let riesgo = "básico";
    let ciudad = "Bogotá";
    
    if (userProfile) {
      edad = userProfile.age || 30;
      ingresos = userProfile.income || 2000000;
      riesgo = userProfile.risk_tolerance || "básico";
      ciudad = userProfile.ciudad || "Bogotá";
    }

    const respuestas = {
      inversion_general: `Basado en tu perfil (${edad} años, $${ingresos.toLocaleString()} COP/mes, riesgo ${riesgo}):

1. CDT (60%): Rendimiento 8-11% anual, bajo riesgo
2. Fondos conservadores (30%): Balance renta fija/variable
3. Ahorro de alta rentabilidad (10%): Liquidez para emergencias`,

      ahorro: `Para ${ciudad} con $${ingresos.toLocaleString()} COP/mes:

1. Fondo emergencia: 3-6 meses de gastos
2. Ahorro automático: 20% de ingresos
3. Podrías acumular $${(ingresos * 0.2 * 12).toLocaleString()} COP/año`,

      analisis: `Perfil: ${edad} años, $${ingresos.toLocaleString()} COP, riesgo ${riesgo}

Recomendación: Inversiones seguras como CDTs y fondos conservadores`
    };

    const promptLower = prompt.toLowerCase();
    let respuesta;
    
    if (promptLower.includes("invert") || promptLower.includes("recomend")) {
      respuesta = respuestas.inversion_general;
    } else if (promptLower.includes("ahorr")) {
      respuesta = respuestas.ahorro;
    } else {
      respuesta = respuestas.analisis;
    }

    return {
      success: true,
      data: respuesta,
      message: 'Analysis completed with fallback response',
      usingFallback: true
    };
  }

  async analyzeInvestmentProfile(args) {
    const { userId, investmentAmount } = args;

    if (!userId) {
      throw new Error('UserId is required for investment profile analysis');
    }

    try {
      const profileResult = await this.getUserProfile({ userId });

      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          message: 'User profile not found. Please complete your profile first.',
          data: null
        };
      }

      const profile = profileResult.data;

      const optionsResult = await this.getInvestmentOptions({
        riskLevel: profile.risk_tolerance || 'medium',
        amount: investmentAmount || 0
      });

      const context = `
        User Profile:
        - Age: ${profile.age}
        - Income: $${profile.income}
        - Risk Tolerance: ${profile.risk_tolerance}
        - Investment Amount: $${investmentAmount}
        
        Available Investment Options: ${JSON.stringify(optionsResult.data)}
      `;

      const aiAnalysis = await this.analyzeWithGroq({
        prompt: `Based on this user's profile and available investment options, provide specific investment recommendations.`,
        context: context
      });

      return {
        success: true,
        data: {
          userProfile: profile,
          investmentOptions: optionsResult.data,
          aiRecommendations: aiAnalysis.data,
          analysis: {
            totalAmount: investmentAmount,
            riskLevel: profile.risk_tolerance,
            suitableOptions: optionsResult.data.length
          }
        },
        message: 'Complete investment profile analysis completed successfully'
      };

    } catch (error) {
      console.error('Error in analyzeInvestmentProfile:', error);
      throw new Error(`Investment profile analysis error: ${error.message}`);
    }
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
