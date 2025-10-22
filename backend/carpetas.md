backend/
├── src/
│   ├── agents/                    # Agentes especializados
│   │   ├── profileAgent.js        # Diagnostica perfil de usuario
│   │   ├── investmentAgent.js     # Genera propuestas de inversión
│   │   ├── educationAgent.js      # Recomienda contenido educativo
│   │   └── orchestratorAgent.js   # Coordina agentes (A2A)
│   │
│   ├── config/
│   │   ├── database.js            # Configuración MySQL
│   │   ├── langchain.js           # Configuración LangChain/Claude
│   │   └── mcp.js                 # Configuración MCP server
│   │
│   ├── controllers/
│   │   ├── chatController.js      # Maneja conversación
│   │   ├── profileController.js   # Gestiona perfiles
│   │   └── investmentController.js
│   │
│   ├── models/
│   │   ├── chatController.js
│   │   ├── Profile.js
│   │   ├── Investment.js
│   │   └── EducationalContent.js
│   │
│   ├── routes/
│   │   ├── chat.js
│   │   ├── profile.js
│   │   └── investment.js
│   │
│   ├── services/
│   │   ├── mcpService.js          # Servicio MCP para MySQL
│   │   ├── ragService.js          # Servicio RAG con embeddings
│   │   ├── vectorStore.js         # Chroma/Pinecone para vectores
│   │   └── conversationService.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validator.js
│   │
│   ├── utils/
│   │   ├── riskClassifier.js      # Clasificación de tolerancia al riesgo
│   │   └── portfolioBuilder.js    # Construcción de portafolio
│   │
│   └── app.js                     # Configuración Express
│
├── data/
│   ├── educational_content/       # Contenido para RAG
│   │   ├── beginner/
│   │   ├── intermediate/
│   │   └── advanced/
│   └── investment_instruments.json
│
├── mcp-server/                    # Servidor MCP separado
│   ├── index.js
│   └── tools/
│       ├── getUserProfile.js
│       ├── saveProfile.js
│       └── getInvestmentOptions.js
│
├── tests/
├── .env
├── package.json
└── README.md