#!/bin/bash

# Script de instalación y configuración automática
# RE/MAX Knowledge Platform

echo "🚀 Instalando RE/MAX Knowledge Platform..."
echo ""

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar requisitos
echo "📋 Verificando requisitos..."

if ! command_exists node; then
    echo "❌ Node.js no está instalado. Por favor instale Node.js 18 o superior."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm no está instalado. Por favor instale npm."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versión 18 o superior requerida. Versión actual: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"
echo "✅ npm $(npm --version) detectado"

# Instalar dependencias del backend
echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

# Configurar variables de entorno del backend
if [ ! -f .env ]; then
    echo "🔧 Configurando variables de entorno del backend..."
    cp .env.example .env
    echo "⚠️  Recuerda configurar las variables de entorno en backend/.env"
fi

# Configurar base de datos
echo "🗄️  Configurando base de datos..."
npx prisma generate
npx prisma migrate dev --name init

# Ejecutar seed
echo "🌱 Ejecutando seed de datos..."
npm run db:seed

# Volver al directorio raíz
cd ..

# Instalar dependencias del frontend
echo ""
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

# Configurar variables de entorno del frontend
if [ ! -f .env.local ]; then
    echo "🔧 Configurando variables de entorno del frontend..."
    cp .env.example .env.local
fi

# Volver al directorio raíz
cd ..

# Crear script de desarrollo
echo ""
echo "📝 Creando scripts de desarrollo..."

cat > dev.sh << 'EOF'
#!/bin/bash

# Script para ejecutar el entorno de desarrollo
echo "🚀 Iniciando entorno de desarrollo..."

# Función para manejar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Iniciar backend
echo "🔧 Iniciando backend (puerto 3001)..."
cd backend && npm run dev &
BACKEND_PID=$!

# Esperar un poco para que el backend se inicie
sleep 3

# Iniciar frontend
echo "🎨 Iniciando frontend (puerto 3000)..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servidores iniciados:"
echo "   🔗 Frontend: http://localhost:3000"
echo "   🔗 Backend API: http://localhost:3001"
echo "   🔗 Prisma Studio: npx prisma studio (ejecutar en backend/)"
echo ""
echo "Presiona Ctrl+C para detener los servidores"

# Esperar a que los procesos terminen
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x dev.sh

# Crear script de producción
cat > build.sh << 'EOF'
#!/bin/bash

# Script para construir la aplicación para producción
echo "🏗️  Construyendo aplicación para producción..."

# Construir backend
echo "📦 Construyendo backend..."
cd backend
npm run build

# Construir frontend
echo "📦 Construyendo frontend..."
cd ../frontend
npm run build

echo "✅ Construcción completada!"
echo ""
echo "Para ejecutar en producción:"
echo "   Backend: cd backend && npm start"
echo "   Frontend: cd frontend && npm start"
EOF

chmod +x build.sh

# Crear script de limpieza
cat > clean.sh << 'EOF'
#!/bin/bash

# Script para limpiar el proyecto
echo "🧹 Limpiando proyecto..."

# Limpiar backend
echo "🗑️  Limpiando backend..."
cd backend
rm -rf node_modules
rm -rf dist
rm -f dev.db
rm -f dev.db-journal

# Limpiar frontend
echo "🗑️  Limpiando frontend..."
cd ../frontend
rm -rf node_modules
rm -rf .next
rm -rf out

echo "✅ Limpieza completada!"
EOF

chmod +x clean.sh

# Mostrar resumen
echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Credenciales por defecto:"
echo "   👤 Admin: admin@remax.com / admin123"
echo "   👤 Demo: demo@remax.com / demo123"
echo ""
echo "🚀 Comandos disponibles:"
echo "   ./dev.sh        - Iniciar entorno de desarrollo"
echo "   ./build.sh      - Construir para producción"
echo "   ./clean.sh      - Limpiar proyecto"
echo ""
echo "🔧 Configuración adicional:"
echo "   1. Configura tu API key de OpenAI en backend/.env"
echo "   2. Revisa las variables de entorno en ambos archivos .env"
echo "   3. Ejecuta ./dev.sh para iniciar el desarrollo"
echo ""
echo "📖 Documentación: README.md"
echo "🐛 Reportar issues: https://github.com/remax/knowledge-platform/issues"
