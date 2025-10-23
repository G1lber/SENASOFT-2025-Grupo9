const mcpService = require('../services/mcpService');

class ChatController {
  async chat(req, res) {
    try {
      const { message, userId, context, conversationHistory = [] } = req.body;

      console.log('📨 Incoming chat request:', {
        message: message?.substring(0, 50),
        userId,
        hasContext: !!context,
        historyLength: conversationHistory.length
      });

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'El mensaje es requerido'
        });
      }

      // Verificar que el MCP Service esté inicializado
      try {
        await mcpService.ensureInitialized();
        console.log('✅ MCP Service confirmed initialized');
      } catch (error) {
        console.error('❌ MCP Service not initialized:', error);
        return res.status(503).json({
          success: false,
          error: 'El servicio de IA no está disponible temporalmente. Por favor intenta de nuevo.',
          message: error.message
        });
      }

      // Obtener perfil del usuario si se proporciona userId
      let userProfile = null;
      if (userId) {
        try {
          const profileResult = await mcpService.getUserProfile(userId);
          userProfile = profileResult.data;
          console.log(`✅ Perfil cargado: ${userProfile?.nombres || 'N/A'}`);
        } catch (error) {
          console.log('⚠️ No se encontró perfil:', error.message);
        }
      }

      // Contexto mínimo (el sistema ya tiene el perfil)
      const enhancedContext = context || '';

      console.log('🤖 Calling analyzeWithGroq...');
      
      // Analizar con Groq usando historial conversacional
      const analysis = await mcpService.analyzeWithGroq(
        message, 
        enhancedContext,
        userProfile,
        userId,
        conversationHistory
      );

      console.log('✅ Analysis completed:', {
        success: analysis.success,
        responseLength: analysis.data?.length,
        historyLength: analysis.conversationHistory?.length
      });

      res.json({
        success: true,
        response: analysis.data,
        userProfile: userProfile ? {
          nombres: userProfile.nombres,
          ciudad: userProfile.ciudad,
          income: userProfile.income
        } : null,
        conversationHistory: analysis.conversationHistory || conversationHistory,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en el chat:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Error procesando el mensaje. Por favor intenta nuevamente.',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async clearHistory(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId requerido'
        });
      }

      const result = await mcpService.clearConversationHistory(userId);

      res.json({
        success: result.success,
        message: result.message
      });

    } catch (error) {
      console.error('Error borrando historial:', error);
      res.status(500).json({
        success: false,
        error: 'Error borrando historial',
        message: error.message
      });
    }
  }

  async getHistory(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId requerido'
        });
      }

      const result = await mcpService.getConversationHistory(userId);

      res.json({
        success: result.success,
        data: result.data,
        message: result.message
      });

    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo historial',
        message: error.message
      });
    }
  }

  async getInvestmentAdvice(req, res) {
    try {
      const { userId, amount, riskLevel, conversationHistory = [] } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'El ID de usuario es requerido'
        });
      }

      // Obtener perfil del usuario
      const profileResult = await mcpService.getUserProfile(userId);
      const userProfile = profileResult.data;

      // Obtener opciones de inversión
      const optionsResult = await mcpService.getInvestmentOptions(
        riskLevel || userProfile?.risk_tolerance || 'medio',
        amount || 0
      );

      // Prompt optimizado y conciso
      const prompt = `Necesito un plan de inversión específico para $${amount ? amount.toLocaleString('es-CO') : '0'} COP.

Proporciona (CONCISO, máximo 300 palabras):
1. **Distribución recomendada** (% por tipo con montos)
2. **3 productos específicos** (nombres reales, tasas, mínimos)
3. **Advertencias de riesgo** (específicas para Colombia)
4. **Siguiente paso práctico** (acción inmediata)
5. **Recurso educativo** (1 enlace o fuente)

⚠️ NO repitas información del chat anterior. Sé directo y específico.`;

      const context = `
Opciones disponibles en DB: ${JSON.stringify(optionsResult.data)}

Contexto colombiano actual:
- Inflación ~10% anual
- Tasa Banco República ~13%
- Productos: CDT, TES, Fondos, Acciones BVC`;

      // Obtener asesoría con contexto conversacional
      const adviceResult = await mcpService.analyzeWithGroq(
        prompt,
        context,
        userProfile,
        userId,
        conversationHistory
      );

      res.json({
        success: true,
        userProfile: {
          nombres: userProfile.nombres,
          ciudad: userProfile.ciudad,
          income: userProfile.income
        },
        investmentOptions: optionsResult.data.slice(0, 5), // Solo top 5
        advice: adviceResult.data,
        conversationHistory: adviceResult.conversationHistory || conversationHistory,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en consejos de inversión:', error);
      res.status(500).json({
        error: 'Error generando consejos',
        message: error.message
      });
    }
  }
}

module.exports = new ChatController();
