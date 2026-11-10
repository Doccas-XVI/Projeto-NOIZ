import { randomUUID } from 'crypto';
import { getSupabase } from '@/config/supabase';
import { AppError } from '@/utils/AppError';

/**
 * Ponto único que sabe conversar com o Supabase Storage. Services
 * nunca chamam `supabase.storage` diretamente — só este util —
 * então trocar de provedor de storage no futuro fica restrito a 1 arquivo.
 */
export async function uploadToStorage(
  bucket: string,
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  const supabase = getSupabase();
  const extension = file.originalname.split('.').pop()?.toLowerCase() ?? 'bin';
  const path = `${folder}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw new AppError(`Falha no upload do arquivo: ${error.message}`, 502);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Remove um arquivo a partir da URL pública. Best-effort: se falhar,
 * não derruba a operação principal (o registro no banco já foi tratado).
 */
export async function deleteFromStorage(bucket: string, publicUrl?: string | null): Promise<void> {
  if (!publicUrl) return;
  const marker = `/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;

  const path = decodeURIComponent(publicUrl.slice(index + marker.length));
  try {
    await getSupabase().storage.from(bucket).remove([path]);
  } catch (err) {
    console.warn('Não foi possível remover arquivo do storage:', err);
  }
}
