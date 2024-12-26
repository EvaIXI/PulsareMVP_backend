# Usa una imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del backend
COPY . .

# Expone el puerto en el que se ejecuta tu app (3000)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
