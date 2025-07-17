# Backend Dockerfile
FROM node:18-slim

# Crear directorio de trabajo
WORKDIR /app
# Instalar OpenSSL y CA certs para Prisma
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Crear usuario no root
RUN groupadd --gid 1001 nodejs \
 && useradd --uid 1001 --gid nodejs --no-create-home --shell /usr/sbin/nologin nodejs

# Cambiar permisos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["npm", "start"]
