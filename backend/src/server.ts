import { app } from '@/app';
import { env } from '@/config/env';
import { prisma } from '@/config/database';
import { ensureBuckets } from '@/config/supabase';
import { userRepository } from '@/repositories/user.repository';

const DAY_MS = 24 * 60 * 60 * 1000;

async function bootstrap() {
  await ensureBuckets();

  const server = app.listen(env.PORT, () => {
    console.log(`🎧 NOIZ API rodando em http://localhost:${env.PORT}`);
    console.log(`📄 Docs disponíveis em http://localhost:${env.PORT}/docs`);
  });

  // Limpeza diária de refresh tokens expirados/revogados (a tabela não cresce para sempre)
  const cleanup = setInterval(() => {
    userRepository
      .deleteStaleRefreshTokens()
      .catch((err) => console.warn('Limpeza de tokens falhou:', err));
  }, DAY_MS);
  cleanup.unref();

  // Encerramento limpo (Docker/Railway enviam SIGTERM ao reiniciar/desligar)
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} recebido — encerrando...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar a API:', err);
  process.exit(1);
});
