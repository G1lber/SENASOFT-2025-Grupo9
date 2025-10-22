@echo off
echo ========================================
echo    SISTEMA DE PRUEBAS SENASOFT 2025
echo    Asesor de Inversiones con IA
echo ========================================
echo.

echo Verificando si Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)

echo Verificando si npm esta instalado...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)

echo.
echo Instalando dependencias si es necesario...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo.
echo ========================================
echo Opciones disponibles:
echo 1. Ejecutar todas las pruebas completas
echo 2. Ejecutar pruebas rapidas
echo 3. Mostrar ayuda
echo 4. Salir
echo ========================================
echo.

set /p choice="Selecciona una opcion (1-4): "

if "%choice%"=="1" (
    echo.
    echo Ejecutando pruebas completas...
    node test-sistema.js
) else if "%choice%"=="2" (
    echo.
    echo Ejecutando pruebas rapidas...
    node test-sistema.js --quick
) else if "%choice%"=="3" (
    echo.
    node test-sistema.js --help
) else if "%choice%"=="4" (
    echo Saliendo...
    exit /b 0
) else (
    echo Opcion invalida
)

echo.
echo ========================================
echo Pruebas finalizadas
echo ========================================
pause
