import multer from 'multer';
import { AppError } from '@/utils/AppError';

/**
 * Guardamos o arquivo em memória (buffer) e não em disco: o backend
 * é stateless e só repassa o buffer para o Supabase Storage.
 * Isso também facilita o deploy em Railway/Render (sem volume persistente).
 */
const storage = multer.memoryStorage();

const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const uploadAudio = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (!AUDIO_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Formato de áudio não suportado. Use MP3, WAV ou OGG.', 400));
    }
    cb(null, true);
  },
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Formato de imagem não suportado. Use PNG, JPEG ou WEBP.', 400));
    }
    cb(null, true);
  },
});

// Upload de música: aceita o áudio (obrigatório) e a capa (opcional) no mesmo request
const uploadTrackMulter = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = file.fieldname === 'cover' ? IMAGE_TYPES : AUDIO_TYPES;
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError(`Formato inválido para o campo "${file.fieldname}"`, 400));
    }
    cb(null, true);
  },
});

export const uploadTrackFiles = uploadTrackMulter.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);
