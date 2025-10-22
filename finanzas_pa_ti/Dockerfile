# Etapa 1: Compilación de Angular
FROM node:20 AS build

WORKDIR /app

# Copiar archivos de configuración e instalar dependencias
COPY package*.json ./
RUN npm install --force

# Copiar el resto del código
COPY . .

# Compilar Angular
RUN npm run build --prod || npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Eliminar archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar el build de Angular
COPY --from=build /app/dist/finanzas_pa_ti/browser /usr/share/nginx/html

# Exponer el puerto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
