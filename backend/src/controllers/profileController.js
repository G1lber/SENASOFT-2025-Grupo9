const mcpService = require('../services/mcpService');

class ProfileController {
  async getProfile(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'User ID is required'
        });
      }

      const result = await mcpService.getUserProfile(userId);

      res.json({
        success: result.success,
        profile: result.data,
        message: result.message
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Error retrieving user profile',
        message: error.message
      });
    }
  }

  async saveProfile(req, res) {
    try {
      const { userId, age, income, riskTolerance, goals } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'User ID is required'
        });
      }

      const result = await mcpService.saveUserProfile({
        userId,
        age,
        income,
        riskTolerance,
        goals
      });

      res.json({
        success: result.success,
        message: result.message
      });

    } catch (error) {
      console.error('Save profile error:', error);
      res.status(500).json({
        error: 'Error saving user profile',
        message: error.message
      });
    }
  }

  async analyzeProfile(req, res) {
    try {
      const { userId } = req.params;

      // Get user profile
      const profileResult = await mcpService.getUserProfile(userId);
      
      if (!profileResult.data) {
        return res.status(404).json({
          error: 'User profile not found'
        });
      }

      // Analyze profile with AI
      const prompt = `
        Analyze this user's financial profile and provide insights about their:
        1. Risk tolerance assessment
        2. Investment readiness
        3. Recommended next steps
        4. Potential concerns or red flags
      `;

      const context = `User Profile: ${JSON.stringify(profileResult.data)}`;
      
      const analysisResult = await mcpService.analyzeWithGroq(prompt, context);

      res.json({
        success: true,
        profile: profileResult.data,
        analysis: analysisResult.data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Profile analysis error:', error);
      res.status(500).json({
        error: 'Error analyzing user profile',
        message: error.message
      });
    }
  }
}

module.exports = new ProfileController();
