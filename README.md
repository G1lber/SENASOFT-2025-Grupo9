#  SENASOFT 2025 - Sistema de Asesoría Financiera con IA

Sistema inteligente de asesoría financiera para el mercado colombiano que utiliza IA (Groq/Llama 3) para proporcionar recomendaciones de inversión personalizadas.

##  Descripción

Plataforma de asesoría financiera que combina inteligencia artificial con datos financieros reales del mercado colombiano. El sistema analiza el perfil del usuario (edad, ingresos, tolerancia al riesgo) y proporciona recomendaciones personalizadas de inversión en instrumentos financieros colombianos (CDTs, fondos, cuentas de ahorro, etc.).

---

##  Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos relacional
- **Groq API** - Motor de IA (Llama 3.3 70B Versatile)
- **MCP (Model Context Protocol)** - Arquitectura de comunicación con IA

### Integraciones
- **Clever Cloud MySQL** - Hosting de base de datos en la nube
- **dotenv** - Gestión segura de variables de entorno
- **node-fetch** - Cliente HTTP para llamadas a API

### APIs y Servicios
- **Groq AI API** - Análisis financiero con modelo Llama 3.3 70B
- **REST API** - Comunicación frontend-backend

---

##  Estructura del Proyecto

```
SENASOFT-2025-Grupo9/
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── carpetas.md
│   ├── Dockerfile
│   ├── ejecutar-pruebas.bat
│   ├── Equipo 09 DDL.sql
│   ├── package.json
│   ├── README-PRUEBAS.md
│   ├── test-aws-bedrock.js
│   ├── test-chat-personalizado.js
│   ├── test-login.js
│   ├── test-requests.http
│   ├── test-sistema.js
│   ├── mcp-server/
│   │   ├── index.js
│   │   └── test-agent.js
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── config/
│       │   ├── database.js
│       │   ├── langchain.js
│       │   └── mcp.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── chatController.js
│       │   ├── investmentController.js
│       │   └── profileController.js
│       ├── middleware/
│       │   ├── errorHandler.js
│       │   └── validator.js
│       ├── models/
│       │   └── User.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── authRoutes.js
│       │   ├── chat.js
│       │   ├── chatRoutes.js
│       │   ├── investment.js
│       │   ├── mcp.js
│       │   ├── profile.js
│       │   └── profileRoutes.js
│       ├── services/
│       │   ├── conversationService.js
│       │   └── mcpService.js
│       └── utils/
│           ├── portfolioBuilder.js
│           └── riskClassifier.js
|
└── frontend-react/
    ├── .env.production
    ├── .gitignore
    ├── package.json
    ├── vercel.json
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    └── src/
        ├── App.css
        ├── App.js
        ├── index.css
        ├── index.js
        ├── components/
        │   └── Chat/
        │       ├── ChatPage.css
        │       └── ChatPage.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── ChatPage.js
        │   └── LoginPage.js
        ├── services/
        │   └── api.js
        └── styles/
            ├── ChatPage.css
            └── LoginPage.css
---


## Instalación y Ejecución

1. Clonar el repositorio
   ```bash
   git clone https://github.com/tu_usuario/SENASOFT-2025.git
   ```
2. Navegar al directorio del proyecto
   ```bash
   cd SENASOFT-2025
   ```
3. Instalar dependencias
   ```bash
   npm install
   ```
4. Configurar variables de entorno
   - Renombrar el archivo `.env.example` a `.env`
   - Configurar las variables necesarias (consultar con el equipo de desarrollo)
5. Ejecutar la aplicación
   ```bash
   npm start
   ```

---

##  Uso

- Acceder a la aplicación a través de `https://senasoft-2025-grupo9.vercel.app/chat`
- Iniciar sesión con credenciales existentes
- Completar el perfil de usuario con información financiera
- Obtener recomendaciones de inversión personalizadas
- Rutas de aprendizajes personalizadas 

---

##  Arquitectura MCP (Model Context Protocol)

El sistema está construido alrededor de un servidor MCP que proporciona herramientas inteligentes mediante un protocolo estructurado.

### Componentes Principales

1. **MCPServer (backend/mcp-server/index.js)**
   - Núcleo del sistema que registra y ejecuta herramientas
   - Gestiona conexión con base de datos y API de Groq
   - Implementa sistema de fallback para operaciones fallidas
   - Calcula información derivada (edad, recomendaciones, etc.)

2. **MCPService (backend/src/services/mcpService.js)**
   - Capa de abstracción que simplifica la comunicación con el servidor MCP
   - Proporciona métodos intuitivos para las operaciones comunes
   - Gestiona la inicialización y estado del servidor

3. **Frontend React**
   - Interfaz de usuario moderna y responsive
   - Comunicación con el backend mediante API REST
   - Visualización de recomendaciones financieras

---

##  Herramientas Disponibles

El servidor MCP proporciona **10 herramientas especializadas**:

| Herramienta | Descripción | Uso |
|-------------|-------------|-----|
| `get_user_profile` | Recupera información del usuario | Datos personales y financieros con edad calculada automáticamente |
| `save_user_profile` | Guarda perfil de usuario | Crear/actualizar perfiles con validación de datos |
| `get_investment_options` | Recupera instrumentos financieros | Filtrado por monto y riesgo desde BD |
| `analyze_with_groq` | Análisis con IA (Llama 3.3 70B) | Recomendaciones personalizadas con contexto conversacional |
| `analyze_investment_profile` | Análisis completo | Combina perfil, opciones y recomendaciones |
| `get_user_objectives` | Objetivos financieros | Metas personales de inversión del usuario |
| `check_table_exists` | Verificación de BD | Comprobación de existencia de tablas |
| `get_database_schema` | Esquema de BD | Listado completo de tablas disponibles |
| `clear_conversation` | Limpiar historial | Elimina el historial conversacional del usuario |
| `get_conversation_history` | Obtener historial | Recupera las conversaciones previas del usuario |

---


## 🔄 Flujo de Solicitud de Asesoría

El sistema procesa las solicitudes de asesoría financiera en 6 pasos:

| Paso | Acción | Descripción |
|------|--------|-------------|
| 1️⃣ | **Solicitud de asesoría** | Usuario envía consulta desde el chat |
| 2️⃣ | **Recuperación de perfil** | Sistema obtiene datos del usuario (edad, ingresos, ciudad) |
| 3️⃣ | **Búsqueda de opciones** | Consulta instrumentos financieros compatibles en BD |
| 4️⃣ | **Análisis con Groq AI** | Envía contexto completo al LLM para procesamiento |
| 5️⃣ | **Generación de recomendaciones** | IA genera consejos personalizados y específicos |
| 6️⃣ | **Entrega al usuario** | Respuesta formateada se muestra en el chat |

### Flujo Técnico Detallado

```
Usuario → ChatController → MCPService → MCPServer → Groq API
   ↓            ↓              ↓            ↓           ↓
Frontend    Valida       Inicializa   Ejecuta     Genera
Request     Request      Conexión     Herramientas Respuesta
   ↓            ↓              ↓            ↓           ↓
JSON        Obtiene      Llama         - get_user_profile
Payload     Perfil       Tools         - get_investment_options
            Usuario                    - analyze_with_groq
   ↓            ↓              ↓            ↓           ↓
            Construye    Envía         MySQL      Llama 3.3
            Contexto     Mensajes      Query      70B Model
   ↓            ↓              ↓            ↓           ↓
            Historial    System        Datos      Respuesta
            Previo       Prompt        Reales     Personalizada
```

## Flujo de la peticion

Usuario → Controlador → MCP Service → Groq LLM → Respuesta
                ↓
            Obtiene perfil de usuario desde DB vía MCP

### Configuracion LLM

## Configuración de Groq AI

El sistema utiliza la API de Groq con el modelo **Llama 3.3 70B Versatile** para generar respuestas conversacionales inteligentes.

### Parámetros de Generación

La solicitud HTTP POST a Groq está optimizada con los siguientes parámetros:

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `model` | `llama-3.3-70b-versatile` | Modelo de lenguaje usado para análisis financiero |
| `messages` | Array | Historial de conversación (system prompt, contexto, mensajes previos) |
| `temperature` | `0.7` | Controla creatividad/aleatoriedad (0.0 = predecible, 1.0 = creativo). Balance moderado para respuestas coherentes pero variadas |
| `max_tokens` | `800` | Límite máximo de tokens (palabras) en la respuesta generada |
| `top_p` | `0.85` | Muestreo nucleus: considera solo el 85% de palabras más probables, filtrando opciones improbables |
| `frequency_penalty` | `0.5` | Penaliza palabras repetidas frecuentemente, reduciendo redundancia (0.0 = sin penalización, 2.0 = máxima) |
| `presence_penalty` | `0.3` | Penaliza palabras ya usadas en la conversación, promoviendo temas nuevos |

> **Nota**: Estos valores están optimizados para obtener respuestas financieras **concisas, coherentes y sin repeticiones excesivas**.

### System Prompt Personalizado

El sistema utiliza un prompt especializado que define a "Santiago", un asesor financiero colombiano con:

-  **Personalidad**: Cercano, profesional y conciso (máx. 200 palabras)
-  **Expertise**: Mercado colombiano (CDTs, TES, fondos, BVC)
-  **Bancos**: Bancolombia, Davivienda, BBVA, Colpatria
-  **Tasas realistas**: CDT 9-12% EA, Fondos 5-15% (2024-2025)
-  **Validaciones**: No inventa datos faltantes, pregunta naturalmente por edad/ingresos
# Sistema de Pruebas SENASOFT 2025

##  Descripción
Sistema automatizado de pruebas para el Asesor de Inversiones con IA desarrollado para SENASOFT 2025.

## Cómo Ejecutar las Pruebas

### Opción 1: Script de Node.js (Recomendado)
```bash
# Instalar dependencias
npm install

# Ejecutar todas las pruebas
npm run test

# Ejecutar pruebas rápidas
npm run test:quick

# Mostrar ayuda
npm run test:help
```

### Opción 2: Archivo Batch (Windows)
```batch
# Doble click en:
ejecutar-pruebas.bat
```

### Opción 3: Comandos Directos
```bash
# Pruebas completas
node test-sistema.js

# Pruebas rápidas
node test-sistema.js --quick

# Ayuda
node test-sistema.js --help
```

##  Qué Prueba el Sistema

### Salud del Servidor
-  Verificar que el servidor Express esté corriendo
-  Confirmar conexión a la base de datos
-  Validar configuración de APIs

### 2 Servicio MCP
-  Verificar conectividad con el servidor MCP
-  Listar herramientas disponibles
-  Confirmar integración con Groq AI

### 3 Gestión de Perfiles
-  Guardar perfil de usuario en base de datos
-  Recuperar perfil de usuario
-  Análisis de perfil con IA

### 4 Chat con IA
-  Respuestas a preguntas sobre inversiones
-  Integración de contexto de usuario
-  Análisis personalizado con Groq

### 5 Consejos de Inversión
-  Recomendaciones basadas en perfil
-  Análisis por montos de inversión
-  Sugerencias por nivel de riesgo

##  Requisitos Previos

1. **Servidor Principal**
   ```bash
   npm run dev  # Puerto 3000
   ```

2. **Servidor MCP**
   ```bash
   npm run mcp
   ```

3. **Base de Datos MySQL**
   - Servidor corriendo en localhost:3306
   - Base de datos `senasoft-sena` creada
   - Tablas necesarias configuradas

4. **API Keys**
   - Groq API Key configurada en `.env`

##  Interpretación de Resultados

###  Éxito
- **Verde**: Prueba pasó correctamente
- **Código 200**: Respuesta exitosa del servidor
- **JSON válido**: Datos estructurados correctamente

###  Error
- **Rojo**: Prueba falló
- **Código 4xx/5xx**: Error del cliente o servidor
- **Mensaje de error**: Descripción del problema

##  Casos de Prueba

### Usuario de Prueba
```json
{
  "userId": "usuario_test_123",
  "age": 28,
  "income": 45000,
  "riskTolerance": "medio",
  "goals": "Ahorrar para comprar una casa en 5 años"
}
```

### Preguntas de Chat
1. "¿Cuáles son las mejores opciones de inversión para un principiante?"
2. "¿Cómo puedo diversificar mi portafolio con $10,000?"
3. "¿Qué factores debo considerar para mi tolerancia al riesgo?"
4. "Explícame la diferencia entre acciones y bonos"

### Escenarios de Inversión
- **$5,000** con riesgo bajo
- **$15,000** con riesgo medio  
- **$50,000** con riesgo alto

##  Solución de Problemas

### Error de Conexión
```
ERROR: Error de conexión
```
**Solución**: Verificar que los servidores estén corriendo

### Error de Base de Datos
```
 ERROR: Database error
```
**Solución**: Verificar MySQL y configuración en `.env`

### Error de API Groq
```
 ERROR: Groq API error
```
**Solución**: Verificar API Key en `.env`

## Soporte
Para problemas con las pruebas, verificar:
1. Logs del servidor principal
2. Logs del servidor MCP
3. Estado de la base de datos
4. Configuración del archivo `.env`

---
¡Bienvenido a SENASOFT 2025! Tu asesor financiero inteligente.