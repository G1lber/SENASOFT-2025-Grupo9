const mcpService = require('../services/mcpService');

class ChatController {
  async chat(req, res) {
    try {
      const { message, userId, context } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje es requerido'
        });
      }

      // Get user profile if userId is provided
      let userProfile = null;
      if (userId) {
        try {
          const profileResult = await mcpService.getUserProfile(userId);
          userProfile = profileResult.data;
        } catch (error) {
          console.log('No se encontró el perfil de usuario o error al obtenerlo:', error.message);
        }
      }

      // Create enhanced context with user profile in Spanish
      const enhancedContext = `
        Perfil del Usuario: ${userProfile ? JSON.stringify(userProfile) : 'No hay perfil disponible'}
        Contexto Adicional: ${context || 'Ninguno'}
        
        Instrucciones importantes:
        - Responde SIEMPRE en español
        - Usa términos financieros apropiados para Colombia
        - Considera el contexto económico colombiano
        - Sé específico y práctico en tus recomendaciones
        - Si mencionas montos, úsalos en pesos colombianos (COP)
      `;

      // Analyze with Groq
      const analysis = await mcpService.analyzeWithGroq(message, enhancedContext);

      res.json({
        success: true,
        response: analysis.data,
        userProfile: userProfile,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error en el chat:', error);
      res.status(500).json({
        success: false,
        error: 'Error procesando el mensaje del chat',
        message: error.message
      });
    }
  }

  async getInvestmentAdvice(req, res) {
    try {
      const { userId, amount, riskLevel } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'El ID de usuario es requerido'
        });
      }

      // Get user profile
      const profileResult = await mcpService.getUserProfile(userId);
      const userProfile = profileResult.data;

      // Get investment options
      const optionsResult = await mcpService.getInvestmentOptions(
        riskLevel || userProfile?.risk_tolerance || 'medio',
        amount || 0
      );

      // Create advice prompt in Spanish
      const prompt = `
        Eres un asesor financiero experto en el mercado colombiano. Basándote en el perfil del usuario y las opciones de inversión disponibles, 
        proporciona consejos personalizados de inversión para un monto de $${amount ? amount.toLocaleString('es-CO') : 'no especificado'} COP.
        
        Considera la tolerancia al riesgo: ${riskLevel || userProfile?.risk_tolerance || 'medio'}
        
        Eres un asesor financiero profesional certificado en el mercado colombiano.
        Tu tarea no es solo responder, sino **pensar como un asesor humano experimentado**.
        al momento de decirle que debe hacer osea el plan quie le oferces, debes recomendarle una ruta de aprendizaje osea debes basarte en informacion y explicarle donde el puede profundizar
        nole digas tus conclusiones de el es decir no le digas cual es su perfil de riesgo esa informacion solo la sabes tu
        este es tu flujo:
        Inicio
          |
          v
        Recolectar información del cliente
        (edad, ingresos, gastos, patrimonio, deudas)
          |
          v
        Evaluar perfil de riesgo y objetivos
        (conservador, moderado, agresivo; metas financieras)
          |
          v
        Cumplir regulaciones legales
        (SARLAFT, PEP, identificación del cliente)
          |
          v
        Analizar situación financiera actual
        (líquidez, deuda, oportunidades de ahorro)
          |
          v
        Diseñar plan financiero
        (asignación de inversiones, instrumentos, rebalanceo, impuestos)
          |
          v
        Explicar plan al cliente
        (riesgos, beneficios, costos, dudas)
          |
          v
        Implementar plan
        (ejecutar inversiones, ajustes)
          |
          v
        Seguimiento periódico
        (revisar portafolio, ajustar según mercado o cambios del cliente)
          
   
        Considera siempre:
        - Menciona productos como **CDT, TES, fondos de inversión, acciones locales, y ETFs**.
        - No prometas rentabilidades fijas: todo consejo debe incluir **advertencias sobre riesgo**.
        - Prioriza la educación financiera del usuario y su comprensión sobre las decisiones.

        Basándote en este razonamiento, crea una **asesoría personalizada** que incluya:
        1. Asignación recomendada de inversión (porcentajes por tipo de activo)
        2. Productos financieros específicos disponibles en Colombia
        3. Consideraciones de riesgo según su perfil y la coyuntura local
        4. Cronograma o horizonte de inversión sugerido
        5. Pasos prácticos que el usuario puede seguir
        6. Entidades o tipos de instituciones confiables en el país

        Responde en español con un tono profesional, empático y claro.
        Por favor proporciona:
        1. **Asignación de inversión recomendada** (porcentajes específicos)
        2. **Productos de inversión específicos** disponibles en Colombia (CDT, fondos, acciones, etc.)
        3. **Consideraciones de riesgo** para el contexto colombiano
        4. **Recomendaciones de cronograma** (corto, mediano, largo plazo)
        5. **Próximos pasos concretos** que debe seguir el usuario
        6. **Entidades financieras recomendadas** en Colombia
        
        Contexto importante:
        - Considera la inflación actual en Colombia
        - Menciona opciones como CDT, fondos de inversión, acciones en la BVC
        - Incluye consideraciones sobre el dólar vs peso colombiano
        - Sugiere diversificación apropiada para el mercado local
        
        Responde en español de manera específica y práctica.
      `;

      const context = `
        Perfil del Usuario: ${JSON.stringify(userProfile)}
        Opciones de Inversión Disponibles: ${JSON.stringify(optionsResult.data)}
        
        Información del contexto colombiano:
        - Moneda: Peso Colombiano (COP)
        - Mercado principal: Bolsa de Valores de Colombia (BVC)
        - Entidades de supervisión: Superintendencia Financiera de Colombia
        - Productos locales: CDT, Fondos de inversión, TES, Acciones locales
      `;

      // Get AI advice
      const adviceResult = await mcpService.analyzeWithGroq(prompt, context);

      res.json({
        success: true,
        userProfile: userProfile,
        investmentOptions: optionsResult.data,
        advice: adviceResult.data,
        recommendations: {
          currency: 'COP',
          market: 'Colombia',
          regulators: ['Superintendencia Financiera de Colombia'],
          suggestedProducts: ['CDT', 'Fondos de Inversión', 'TES', 'Acciones BVC']
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error en consejos de inversión:', error);
      res.status(500).json({
        error: 'Error generando consejos de inversión',
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();
