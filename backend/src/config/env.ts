import 'dotenv/config';
import { z } from 'zod';

/**
 * Valida as variáveis de ambiente uma única vez, na inicialização.
 * Se algo obrigatório faltar, a aplicação falha rápido (fail-fast)
 * em vez de quebrar silenciosamente em algum controller no meio do dia.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url(),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_BUCKET_TRACKS: z.string().default('tracks'),
  SUPABASE_BUCKET_IMAGES: z.string().default('images'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuração de ambiente inválida. Verifique o arquivo .env');
}

export const env = parsed.data;
