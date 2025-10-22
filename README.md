# 🏦 SENASOFT 2025 - Sistema de Asesoría Financiera con IA

Sistema inteligente de asesoría financiera para el mercado colombiano que utiliza IA (Groq/Llama 3) para proporcionar recomendaciones de inversión personalizadas.

## 📋 Descripción

Plataforma de asesoría financiera que combina inteligencia artificial con datos financieros reales del mercado colombiano. El sistema analiza el perfil del usuario (edad, ingresos, tolerancia al riesgo) y proporciona recomendaciones personalizadas de inversión en instrumentos financieros colombianos (CDTs, fondos, cuentas de ahorro, etc.).

---

## 🚀 Tecnologías Utilizadas

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

## 📁 Estructura del Proyecto

```
src
├── config
│   └── config.js         # Configuración general de la aplicación
├── controllers
│   └── userController.js # Lógica de negocio para usuarios
├── models
│   └── userModel.js      # Modelo de datos de usuario
├── routes
│   └── userRoutes.js     # Rutas de la API para usuarios
├── services
│   └── aiService.js      # Servicio de integración con la API de IA
├── utils
│   └── helpers.js        # Funciones auxiliares
├── .env                   # Variables de entorno
├── package.json           # Dependencias y scripts del proyecto
└── server.js             # Archivo principal de la aplicación
```

---

## 📦 Instalación y Ejecución

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

## 📚 Uso

- Acceder a la aplicación a través de `http://localhost:3000`
- Registrarse como nuevo usuario o iniciar sesión con credenciales existentes
- Completar el perfil de usuario con información financiera
- Obtener recomendaciones de inversión personalizadas
- Consultar el historial de recomendaciones y rendimiento de inversiones


---

## 🧠 Arquitectura MCP (Model Context Protocol)

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

## 🛠️ Herramientas Disponibles

El servidor MCP proporciona 8 herramientas especializadas:

| Herramienta | Descripción | Uso |
|-------------|-------------|-----|
| `get_user_profile` | Recupera información del usuario | Datos personales y financieros |
| `save_user_profile` | Guarda perfil de usuario | Crear/actualizar perfiles |
| `get_investment_options` | Recupera instrumentos financieros | Filtrado por monto y riesgo |
| `analyze_with_groq` | Análisis con IA | Recomendaciones personalizadas |
| `analyze_investment_profile` | Análisis completo | Combina perfil, opciones y recomendaciones |
| `get_user_objectives` | Objetivos financieros | Metas personales de inversión |
| `check_table_exists` | Verificación de BD | Comprobación de estructura |
| `get_database_schema` | Esquema de BD | Listado de tablas disponibles |

---

## 🔄 Flujo de Solicitud de Asesoría

El flujo de solicitud de asesoría financiera sigue estos pasos:

┌─────────────────────┐
│ 1. Solicitud        │
│    de asesoría      │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 2. Recuperación     │
│    de perfil        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 3. Búsqueda de      │
│    opciones         │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 4. Análisis con     │
│    Groq AI          │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 5. Generación de    │
│    recomendaciones  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 6. Entrega al       │
│    usuario          │
└─────────────────────┘

¡Bienvenido a SENASOFT 2025! Tu asesor financiero inteligente.