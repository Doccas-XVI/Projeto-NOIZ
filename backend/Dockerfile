FROM node:22-slim

# O Prisma precisa do OpenSSL no Linux; ca-certificates permite HTTPS (Supabase, e-mail)
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Dependências. O schema precisa estar presente ANTES do `npm ci`, porque o
#    script postinstall roda `prisma generate` (gera o Prisma Client em node_modules).
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# 2) Código + build (tsc + tsc-alias, que resolve os imports "@/...")
COPY . .
RUN npm run build

# Mantemos as devDependencies de propósito: o `prisma` (CLI) é usado na subida do
# container para criar/atualizar as tabelas, e o `tsx` roda o seed.
ENV NODE_ENV=production
EXPOSE 3333

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
