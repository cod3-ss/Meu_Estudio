# Estágio de Build
FROM node:18-alpine AS build-stage

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código fonte
COPY . .

# Executa o build da aplicação
RUN npm run build

# Estágio de Produção (Servidor Nginx)
FROM nginx:stable-alpine AS production-stage

# Copia os arquivos gerados no build para a pasta pública do Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expõe a porta 80 (padrão HTTP)
EXPOSE 80

# Inicia o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]