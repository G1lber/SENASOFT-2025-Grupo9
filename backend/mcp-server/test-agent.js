const { createMCPServer } = require('./index.js');

// Test JSON payloads for different scenarios
const testScenarios = {
  // Scenario 1: Get user profile
  getUserProfile: {
    action: 'get_user_profile',
    payload: {
      userId: '12345'
    },
    metadata: {
      requestId: 'test-001',
      agentName: 'FinancialAdvisorAgent'
    }
  },

  // Scenario 2: Save new user profile
  saveUserProfile: {
    action: 'save_user_profile',
    payload: {
      userId: '12345',
      age: 30,
      income: 50000,
      riskTolerance: 'medium',
      goals: 'retirement planning'
    },
    metadata: {
      requestId: 'test-002',
      agentName: 'FinancialAdvisorAgent'
    }
  },

  // Scenario 3: Get investment options
  getInvestmentOptions: {
    action: 'get_investment_options',
    payload: {
      riskLevel: 'medium',
      amount: 10000
    },
    metadata: {
      requestId: 'test-003',
      agentName: 'FinancialAdvisorAgent'
    }
  },

  // Scenario 4: AI Analysis
  aiAnalysis: {
    action: 'analyze_with_groq',
    payload: {
      prompt: 'What are the best investment strategies for a 30-year-old with medium risk tolerance?',
      context: 'User has $50,000 income and wants to plan for retirement'
    },
    metadata: {
      requestId: 'test-004',
      agentName: 'FinancialAdvisorAgent'
    }
  },

  // Scenario 5: Complete investment analysis workflow
  completeAnalysis: {
    action: 'analyze_investment_profile',
    payload: {
      userId: '12345',
      investmentAmount: 25000
    },
    metadata: {
      requestId: 'test-005',
      agentName: 'FinancialAdvisorAgent'
    }
  }
};

class AgentTester {
  constructor() {
    this.mcpServer = null;
  }

  async initialize() {
    console.log('🚀 Initializing Agent Tester...');
    this.mcpServer = await createMCPServer();
    console.log('✅ MCP Server initialized');
  }

  async runTest(scenarioName, customJson = null) {
    if (!this.mcpServer) {
      throw new Error('MCP Server not initialized');
    }

    const testJson = customJson || testScenarios[scenarioName];
    
    if (!testJson) {
      throw new Error(`Unknown test scenario: ${scenarioName}`);
    }

    console.log(`\n🧪 Running test: ${scenarioName}`);
    console.log('📨 Request JSON:');
    console.log(JSON.stringify(testJson, null, 2));
    
    const startTime = Date.now();
    const response = await this.mcpServer.processAgentRequest(testJson);
    const endTime = Date.now();
    
    console.log('📩 Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log(`⏱️  Execution time: ${endTime - startTime}ms`);
    
    return response;
  }

  async runAllTests() {
    console.log('🎯 Running all test scenarios...\n');
    
    const results = {};
    
    for (const [scenarioName, testJson] of Object.entries(testScenarios)) {
      try {
        results[scenarioName] = await this.runTest(scenarioName);
        console.log(`✅ ${scenarioName} - PASSED`);
      } catch (error) {
        console.error(`❌ ${scenarioName} - FAILED:`, error.message);
        results[scenarioName] = { error: error.message };
      }
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Test Results Summary:');
    Object.entries(results).forEach(([scenario, result]) => {
      const status = result.error ? '❌ FAILED' : '✅ PASSED';
      console.log(`${status} - ${scenario}`);
    });
    
    return results;
  }

  async runCustomTest(jsonString) {
    try {
      const customJson = JSON.parse(jsonString);
      return await this.runTest('custom', customJson);
    } catch (error) {
      console.error('❌ Invalid JSON:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const tester = new AgentTester();
  await tester.initialize();

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Available commands:');
    console.log('  npm run test-agent all              - Run all test scenarios');
    console.log('  npm run test-agent <scenario>       - Run specific scenario');
    console.log('  npm run test-agent custom <json>    - Run custom JSON test');
    console.log('\n📝 Available scenarios:', Object.keys(testScenarios).join(', '));
    return;
  }

  const command = args[0];

  try {
    if (command === 'all') {
      await tester.runAllTests();
    } else if (command === 'custom' && args[1]) {
      await tester.runCustomTest(args[1]);
    } else if (testScenarios[command]) {
      await tester.runTest(command);
    } else {
      console.error(`❌ Unknown command or scenario: ${command}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

module.exports = { AgentTester, testScenarios };

if (require.main === module) {
  main().catch(console.error);
}
