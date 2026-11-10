import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { AppError } from '@/utils/AppError';

/**
 * Usamos a service_role key porque o upload acontece no backend
 * (depois de já termos validado o usuário via JWT), nunca no client.
 * Isso evita expor uma chave privilegiada no frontend.
 *
 * O client é criado sob demanda: se o Supabase não estiver configurado,
 * a API continua funcionando e só os endpoints de upload respondem 503.
 */
let client: SupabaseClient | null = null;

export const isStorageConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);

export function getSupabase(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      'Armazenamento de arquivos não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env do backend.',
      503,
    );
  }
  client ??= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  return client;
}

export const BUCKETS = {
  TRACKS: env.SUPABASE_BUCKET_TRACKS,
  IMAGES: env.SUPABASE_BUCKET_IMAGES,
} as const;

/**
 * Cria os buckets (públicos) na inicialização se ainda não existirem,
 * poupando o passo manual no painel do Supabase.
 */
export async function ensureBuckets(): Promise<void> {
  if (!isStorageConfigured) {
    console.warn('⚠️  Supabase não configurado — uploads desativados.');
    return;
  }
  const supabase = getSupabase();
  for (const name of Object.values(BUCKETS)) {
    const { error } = await supabase.storage.createBucket(name, { public: true });
    if (error && !/already exists|duplicate/i.test(error.message)) {
      console.warn(`⚠️  Não foi possível garantir o bucket "${name}": ${error.message}`);
    }
  }
}
