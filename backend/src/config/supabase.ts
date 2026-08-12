import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Usamos a service_role key porque o upload acontece no backend
 * (depois de já termos validado o usuário via JWT), nunca no client.
 * Isso evita expor uma chave privilegiada no frontend.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export const BUCKETS = {
  TRACKS: env.SUPABASE_BUCKET_TRACKS,
  IMAGES: env.SUPABASE_BUCKET_IMAGES,
} as const;
