#!/bin/sh
set -e

# Prepara o banco antes de subir a API.
if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "▶ Aplicando migrations (prisma migrate deploy)..."
  npx prisma migrate deploy
else
  # Sem migrations versionadas ainda (início do projeto): sincroniza direto pelo schema.
  # Para produção, gere a migration inicial: `npm run prisma:migrate -- --name init`.
  echo "⚠ Nenhuma migration encontrada — usando 'prisma db push' (ok para desenvolvimento)."
  npx prisma db push --skip-generate
fi

exec "$@"
