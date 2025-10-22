# 🧪 Sistema de Pruebas SENASOFT 2025

## 📋 Descripción
Sistema automatizado de pruebas para el Asesor de Inversiones con IA desarrollado para SENASOFT 2025.

## 🚀 Cómo Ejecutar las Pruebas

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

## 📊 Qué Prueba el Sistema

### 1️⃣ Salud del Servidor
- ✅ Verificar que el servidor Express esté corriendo
- ✅ Confirmar conexión a la base de datos
- ✅ Validar configuración de APIs

### 2️⃣ Servicio MCP
- ✅ Verificar conectividad con el servidor MCP
- ✅ Listar herramientas disponibles
- ✅ Confirmar integración con Groq AI

### 3️⃣ Gestión de Perfiles
- ✅ Guardar perfil de usuario en base de datos
- ✅ Recuperar perfil de usuario
- ✅ Análisis de perfil con IA

### 4️⃣ Chat con IA
- ✅ Respuestas a preguntas sobre inversiones
- ✅ Integración de contexto de usuario
- ✅ Análisis personalizado con Groq

### 5️⃣ Consejos de Inversión
- ✅ Recomendaciones basadas en perfil
- ✅ Análisis por montos de inversión
- ✅ Sugerencias por nivel de riesgo

## 🔧 Requisitos Previos

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

## 📈 Interpretación de Resultados

### ✅ Éxito
- **Verde**: Prueba pasó correctamente
- **Código 200**: Respuesta exitosa del servidor
- **JSON válido**: Datos estructurados correctamente

### ❌ Error
- **Rojo**: Prueba falló
- **Código 4xx/5xx**: Error del cliente o servidor
- **Mensaje de error**: Descripción del problema

## 🎯 Casos de Prueba

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

## 🐛 Solución de Problemas

### Error de Conexión
```
❌ ERROR: Error de conexión
```
**Solución**: Verificar que los servidores estén corriendo

### Error de Base de Datos
```
❌ ERROR: Database error
```
**Solución**: Verificar MySQL y configuración en `.env`

### Error de API Groq
```
❌ ERROR: Groq API error
```
**Solución**: Verificar API Key en `.env`

## 📞 Soporte
Para problemas con las pruebas, verificar:
1. Logs del servidor principal
2. Logs del servidor MCP
3. Estado de la base de datos
4. Configuración del archivo `.env`
