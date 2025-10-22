const { pool } = require('../src/config/database.js');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Simple MCP-like server implementation
class MCPServer {
  constructor() {
    this.tools = new Map();
    this.setupTools();
  }

  setupTools() {
    this.tools.set('get_user_profile', {
      description: 'Retrieve user profile from database',
      handler: this.getUserProfile.bind(this)
    });

    this.tools.set('save_user_profile', {
      description: 'Save user profile to database',
      handler: this.saveUserProfile.bind(this)
    });

    this.tools.set('get_investment_options', {
      description: 'Get investment options based on user profile',
      handler: this.getInvestmentOptions.bind(this)
    });

    this.tools.set('analyze_with_groq', {
      description: 'Analyze data using Groq AI model',
      handler: this.analyzeWithGroq.bind(this)
    });

    this.tools.set('analyze_investment_profile', {
      description: 'Complete investment profile analysis combining user data and AI recommendations',
      handler: this.analyzeInvestmentProfile.bind(this)
    });

    this.tools.set('get_user_objectives', {
      description: 'Retrieve user objectives from database',
      handler: this.getUserObjectives.bind(this)
    });


    // --- Nuevas herramientas para verificación de esquema y uso desde test-sistema.js
    this.tools.set('check_table_exists', {
      description: 'Check if a database table exists',
      handler: this.checkTableExists.bind(this)
    });

    this.tools.set('get_database_schema', {
      description: 'List database tables (information_schema)',
      handler: this.getDatabaseSchema.bind(this)
    });
  }

  // Helper para calcular edad desde fecha de nacimiento
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
        `SELECT 
              u.id_usuario,
              u.nombres,
              u.apellidos,
              u.email,
              o.id_objetivo,
              o.tipo_objetivo,
              o.monto_meta_cop,
              o.fecha_meta,
              o.descripcion
            FROM usuarios u
            INNER JOIN objetivos o
              ON u.id_usuario = o.id_usuario;
`,
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

    // Primero intentar tabla legacy user_profiles, si falla -> fallback a usuarios (DDL)
    try {
      try {
        const [rows] = await pool.execute(
          'SELECT * FROM user_profiles WHERE user_id = ?',
          [userId]
        );
        if (rows && rows.length > 0) {
          return {
            success: true,
            data: rows[0],
            message: 'User profile found (legacy table)',
            tableUsed: 'user_profiles'
          };
        }
        // Si no hay filas, no lanzar error; intentar tabla DDL abajo
      } catch (legacyErr) {
        // Si la tabla no existe o error, lo registramos y continuamos con DDL
        console.log('Legacy user_profiles query failed, trying DDL table usuarios...', legacyErr.message);
      }

      // Intento con tabla DDL usuarios
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
      try {
        // Intento en tabla legacy
        await pool.execute(`
          INSERT INTO user_profiles (user_id, age, income, risk_tolerance, goals, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
          age = VALUES(age),
          income = VALUES(income),
          risk_tolerance = VALUES(risk_tolerance),
          goals = VALUES(goals),
          updated_at = NOW()
        `, [userId, age || null, income || null, riskTolerance || null, goals || null]);

        return {
          success: true,
          message: 'Profile saved successfully (legacy table)',
          tableUsed: 'user_profiles'
        };
      } catch (legacyErr) {
        // Si falla (tabla inexistente), intentar guardar en tabla DDL usuarios (simplificado)
        console.log('Legacy user_profiles save failed, trying to save into usuarios (DDL)...', legacyErr.message);
      }

      // Para insertar en usuarios necesitamos al menos nombres/apellidos/email; si no están, devolver error claro
      if (!nombres || !apellidos || !email) {
        throw new Error('To save into DDL table "usuarios" provide nombres, apellidos and email');
      }

      // Fecha de nacimiento aproximada a partir de age (si se proporciona)
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
        userId,
        nombres,
        apellidos,
        `CC${userId}`,
        fechaNacimiento,
        'M',
        'Ciudad por defecto',
        'Departamento por defecto',
        'Dirección por defecto',
        email,
        '3000000000',
        riskTolerance || 'Principiante',
        3,
        income || 0,
        'S',
        'N'
      ]);

      return {
        success: true,
        message: 'Profile saved successfully (DDL usuarios)',
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
      // Intento en tabla legacy
      try {
        const [rows] = await pool.execute(
          'SELECT * FROM investment_options WHERE risk_level = ? AND min_amount <= ? LIMIT 10',
          [riskLevel, amount]
        );
        if (rows && rows.length > 0) {
          return {
            success: true,
            data: rows,
            message: `Found ${rows.length} investment options (legacy)`,
            tableUsed: 'investment_options'
          };
        }
      } catch (legacyErr) {
        console.log('Legacy investment_options query failed, trying DDL instrumentos_financieros...', legacyErr.message);
      }

      // Fallback a instrumentos_financieros (DDL)
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
        message: `Found ${mapped.length} investment options (DDL instrumentos_financieros)`,
        tableUsed: 'instrumentos_financieros'
      };

    } catch (error) {
      console.error('Database error in getInvestmentOptions:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Nuevo: verifica existencia de tabla en la BD (information_schema)
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

  // Nuevo: devuelve listado básico de tablas del esquema actual
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

  // Nuevo helper: si payload contiene userId, adjunta userProfile si está disponible
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
      // Propagar para que el llamador lo capture si es necesario
      throw err;
    }
  }

  // Ajuste: analyzeWithGroq ahora usa AWS Bedrock con Llama 3 70B
  async analyzeWithGroq(args) {
    const { prompt, context = '', userProfile } = args || {};
    
    if (!prompt) {
      throw new Error('Prompt is required for analysis');
    }

    // Si existe userProfile, lo agregamos al contexto automáticamente
    const fullContext = userProfile
      ? `${context}\n\nPerfil del Usuario:\n${JSON.stringify(userProfile, null, 2)}`
      : context;

    try {
      // Construir el mensaje para Llama 3
      const systemPrompt = `Eres un asesor financiero experto en el mercado colombiano. 
Proporciona consejos claros y útiles sobre inversiones en español.
Considera pesos colombianos (COP), instrumentos de inversión locales y regulaciones financieras colombianas.
Adapta tus respuestas al perfil específico del usuario (edad, ingresos, tolerancia al riesgo).`;
      
      const userMessage = `${prompt}\n\nContexto: ${fullContext}`;
      
      const fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

      // Invocar modelo Llama 3 70B en AWS Bedrock
      const input = {
        modelId: process.env.AWS_BEDROCK_MODEL || 'meta.llama3-70b-instruct-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt: fullPrompt,
          max_gen_len: 2048,
          temperature: 0.7,
          top_p: 0.9
        })
      };

      const command = new InvokeModelCommand(input);
      const response = await bedrockClient.send(command);
      
      // Parsear respuesta de Bedrock
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const generatedText = responseBody.generation || responseBody.results?.[0]?.outputText || 'No se pudo generar respuesta';

      return {
        success: true,
        data: generatedText.trim(),
        message: 'Analysis completed successfully with AWS Bedrock Llama 3 70B'
      };
    } catch (error) {
      console.error('AWS Bedrock error:', error);
      throw new Error(`AWS Bedrock error: ${error.message}`);
    }
  }

  async analyzeInvestmentProfile(args) {
    const { userId, investmentAmount } = args;

    if (!userId) {
      throw new Error('UserId is required for investment profile analysis');
    }

    try {
      // Get user profile
      const profileResult = await this.getUserProfile({ userId });

      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          message: 'User profile not found. Please complete your profile first.',
          data: null
        };
      }

      const profile = profileResult.data;

      // Get investment options based on user's risk tolerance and amount
      const optionsResult = await this.getInvestmentOptions({
        riskLevel: profile.risk_tolerance || 'medium',
        amount: investmentAmount || 0
      });

      // Create context for AI analysis
      const context = `
        User Profile:
        - Age: ${profile.age}
        - Income: $${profile.income}
        - Risk Tolerance: ${profile.risk_tolerance}
        - Goals: ${profile.goals}
        - Investment Amount: $${investmentAmount}
        
        Available Investment Options: ${JSON.stringify(optionsResult.data)}
      `;

      // Get AI analysis
      const aiAnalysis = await this.analyzeWithGroq({
        prompt: `Based on this user's profile and available investment options, provide specific investment recommendations. Consider their age, income, risk tolerance, and goals. Recommend specific allocations and explain the reasoning.`,
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

  // Agent-compatible request processor
  async processAgentRequest(request) {
    const { action, payload = {}, metadata } = request;

    if (!action) {
      throw new Error('Action is required in agent request');
    }

    try {
      console.log(`🤖 Processing agent request: ${action}`);
      console.log(`📋 Payload:`, payload);

      // Intentar enriquecer con perfil de usuario si aplica
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
  
  console.log('🧪 Testing MCP Server with AWS Bedrock...');
  
  // Test database connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // Test AWS Bedrock
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('✅ AWS Bedrock credentials configured');
    console.log(`📍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`🤖 Model: ${process.env.AWS_BEDROCK_MODEL || 'meta.llama3-70b-instruct-v1:0'}`);
    
    // Test AWS Bedrock connection
    try {
      const testResult = await server.callTool('analyze_with_groq', {
        prompt: 'Responde en una línea: ¿Qué es una inversión?',
        context: 'Test de conexión con AWS Bedrock'
      });
      console.log('✅ AWS Bedrock Llama 3 70B connection successful');
      console.log('📝 Test response:', testResult.data.substring(0, 150) + '...');
    } catch (error) {
      console.error('❌ AWS Bedrock test failed:', error.message);
      console.error('💡 Verifica que el modelo esté habilitado en tu cuenta de AWS Bedrock');
    }
  } else {
    console.log('⚠️  AWS Bedrock credentials not configured');
  }

  // List available tools
  const tools = server.listTools();
  console.log('🔧 Available tools:', tools.map(t => t.name).join(', '));
  
  console.log('🚀 MCP Server is ready to use with AWS Bedrock Llama 3 70B!');
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
