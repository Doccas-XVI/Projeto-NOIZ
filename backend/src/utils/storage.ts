import { randomUUID } from 'crypto';
import { supabase } from '@/config/supabase';
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
  const extension = file.originalname.split('.').pop();
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
