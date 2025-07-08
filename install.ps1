# Script de instalación para Windows PowerShell
# RE/MAX Knowledge Platform

Write-Host "🚀 Instalando RE/MAX Knowledge Platform..." -ForegroundColor Green
Write-Host ""

# Función para verificar si un comando existe
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Verificar requisitos
Write-Host "📋 Verificando requisitos..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js no está instalado. Por favor instale Node.js 18 o superior." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm no está instalado. Por favor instale npm." -ForegroundColor Red
    exit 1
}

$NodeVersion = (node --version).Substring(1).Split('.')[0]
if ([int]$NodeVersion -lt 18) {
    Write-Host "❌ Node.js versión 18 o superior requerida. Versión actual: $(node --version)" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $(node --version) detectado" -ForegroundColor Green
Write-Host "✅ npm $(npm --version) detectado" -ForegroundColor Green

# Instalar dependencias del backend
Write-Host ""
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install

# Configurar variables de entorno del backend
if (-not (Test-Path .env)) {
    Write-Host "🔧 Configurando variables de entorno del backend..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Recuerda configurar las variables de entorno en backend/.env" -ForegroundColor Yellow
}

# Configurar base de datos
Write-Host "🗄️  Configurando base de datos..." -ForegroundColor Yellow
npx prisma generate
npx prisma migrate dev --name init

# Ejecutar seed
Write-Host "🌱 Ejecutando seed de datos..." -ForegroundColor Yellow
npm run db:seed

# Volver al directorio raíz
Set-Location ..

# Instalar dependencias del frontend
Write-Host ""
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install

# Configurar variables de entorno del frontend
if (-not (Test-Path .env.local)) {
    Write-Host "🔧 Configurando variables de entorno del frontend..." -ForegroundColor Yellow
    Copy-Item .env.example .env.local
}

# Volver al directorio raíz
Set-Location ..

# Crear script de desarrollo
Write-Host ""
Write-Host "📝 Creando scripts de desarrollo..." -ForegroundColor Yellow

$DevScript = @"
# Script para ejecutar el entorno de desarrollo
Write-Host "🚀 Iniciando entorno de desarrollo..." -ForegroundColor Green

# Función para manejar Ctrl+C
function Stop-Development {
    Write-Host ""
    Write-Host "🛑 Deteniendo servidores..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    exit 0
}

# Registrar manejador de Ctrl+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-Development }

# Iniciar backend
Write-Host "🔧 Iniciando backend (puerto 3001)..." -ForegroundColor Yellow
Start-Job -Name "Backend" -ScriptBlock {
    Set-Location backend
    npm run dev
}

# Esperar un poco para que el backend se inicie
Start-Sleep 3

# Iniciar frontend
Write-Host "🎨 Iniciando frontend (puerto 3000)..." -ForegroundColor Yellow
Start-Job -Name "Frontend" -ScriptBlock {
    Set-Location frontend
    npm run dev
}

Write-Host ""
Write-Host "✅ Servidores iniciados:" -ForegroundColor Green
Write-Host "   🔗 Frontend: http://localhost:3000"
Write-Host "   🔗 Backend API: http://localhost:3001"
Write-Host "   🔗 Prisma Studio: npx prisma studio (ejecutar en backend/)"
Write-Host ""
Write-Host "Presiona Ctrl+C para detener los servidores"

# Esperar a que los procesos terminen
do {
    Start-Sleep 1
    `$jobs = Get-Job | Where-Object { `$_.State -eq "Running" }
} while (`$jobs.Count -gt 0)
"@

$DevScript | Out-File -FilePath "dev.ps1" -Encoding UTF8

# Crear script de construcción
$BuildScript = @"
# Script para construir la aplicación para producción
Write-Host "🏗️  Construyendo aplicación para producción..." -ForegroundColor Green

# Construir backend
Write-Host "📦 Construyendo backend..." -ForegroundColor Yellow
Set-Location backend
npm run build

# Construir frontend
Write-Host "📦 Construyendo frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm run build
Set-Location ..

Write-Host "✅ Construcción completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar en producción:"
Write-Host "   Backend: cd backend && npm start"
Write-Host "   Frontend: cd frontend && npm start"
"@

$BuildScript | Out-File -FilePath "build.ps1" -Encoding UTF8

# Crear script de limpieza
$CleanScript = @"
# Script para limpiar el proyecto
Write-Host "🧹 Limpiando proyecto..." -ForegroundColor Yellow

# Limpiar backend
Write-Host "🗑️  Limpiando backend..." -ForegroundColor Yellow
Set-Location backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Force dev.db -ErrorAction SilentlyContinue
Remove-Item -Force dev.db-journal -ErrorAction SilentlyContinue

# Limpiar frontend
Write-Host "🗑️  Limpiando frontend..." -ForegroundColor Yellow
Set-Location ../frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
Set-Location ..

Write-Host "✅ Limpieza completada!" -ForegroundColor Green
"@

$CleanScript | Out-File -FilePath "clean.ps1" -Encoding UTF8

# Mostrar resumen
Write-Host ""
Write-Host "🎉 ¡Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Credenciales por defecto:" -ForegroundColor Cyan
Write-Host "   👤 Admin: admin@remax.com / admin123"
Write-Host "   👤 Demo: demo@remax.com / demo123"
Write-Host ""
Write-Host "🚀 Comandos disponibles:" -ForegroundColor Cyan
Write-Host "   .\dev.ps1        - Iniciar entorno de desarrollo"
Write-Host "   .\build.ps1      - Construir para producción"
Write-Host "   .\clean.ps1      - Limpiar proyecto"
Write-Host ""
Write-Host "🔧 Configuración adicional:" -ForegroundColor Yellow
Write-Host "   1. Configura tu API key de OpenAI en backend/.env"
Write-Host "   2. Revisa las variables de entorno en ambos archivos .env"
Write-Host "   3. Ejecuta .\dev.ps1 para iniciar el desarrollo"
Write-Host ""
Write-Host "📖 Documentación: README.md"
Write-Host "🐛 Reportar issues: https://github.com/remax/knowledge-platform/issues"
