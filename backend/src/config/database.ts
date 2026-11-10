import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Em dev, o hot-reload do tsx recriaria o PrismaClient a cada save,
 * esgotando conexões do Postgres. Por isso guardamos a instância
 * no objeto global e reaproveitamos entre reloads.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}
