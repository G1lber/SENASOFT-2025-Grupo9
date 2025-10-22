const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

const MCP_CONFIG = {
  name: 'senasoft-investment-mcp',
  version: '1.0.0',
  description: 'MCP server for SENASOFT investment advisor with database access'
};

function createMCPServer() {
  const server = new Server(MCP_CONFIG, {
    capabilities: {
      tools: {}
    }
  });

  return server;
}

module.exports = { createMCPServer, MCP_CONFIG };
