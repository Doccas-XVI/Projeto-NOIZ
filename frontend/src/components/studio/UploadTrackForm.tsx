import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Music, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { studioService } from '@/services/studioService';
import { getErrorMessage } from '@/utils/errors';
import { formatTime } from '@/utils/format';
import { inputClass, primaryButtonClass } from '@/components/common/AuthLayout';

const MAX_AUDIO_MB = 20;
const MAX_IMAGE_MB = 5;

/** Lê a duração do arquivo no próprio navegador (a API exige `durationSec`). */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não consegui ler esse arquivo de áudio.'));
    };
    audio.src = url;
  });
}

export function UploadTrackForm({ albums }: { albums: { id: string; title: string }[] }) {
  const queryClient = useQueryClient();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (form: FormData) => studioService.uploadTrack(form, setProgress),
    onSuccess: (track) => {
      toast.success(`"${track.title}" já está no ar!`);
      void queryClient.invalidateQueries({ queryKey: ['studio'] });
      void queryClient.invalidateQueries({ queryKey: ['tracks', 'trending'] });
      setAudioFile(null);
      setCoverFile(null);
      setDuration(0);
      setTitle('');
      setGenre('');
      setAlbumId('');
      setProgress(0);
    },
    onError: (error) => {
      setProgress(0);
      toast.error(getErrorMessage(error, 'Não foi possível enviar a música.'));
    },
  });

  async function handleAudioChange(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_AUDIO_MB * 1024 * 1024)
      return toast.error(`O áudio pode ter no máximo ${MAX_AUDIO_MB}MB.`);
    try {
      setDuration(await readDuration(file));
      setAudioFile(file);
      // sugere o título a partir do nome do arquivo ("minha-musica.mp3" -> "minha musica")
      setTitle(
        (current) =>
          current ||
          file.name
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .trim(),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Arquivo de áudio inválido.');
    }
  }

  function handleCoverChange(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024)
      return toast.error(`A capa pode ter no máximo ${MAX_IMAGE_MB}MB.`);
    setCoverFile(file);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!audioFile) return toast.error('Escolha o arquivo de áudio.');
    if (!title.trim()) return toast.error('Dê um título para a música.');
    if (duration <= 0) return toast.error('Não consegui descobrir a duração do áudio.');

    const form = new FormData();
    form.append('audio', audioFile);
    if (coverFile) form.append('cover', coverFile);
    form.append('title', title.trim());
    form.append('durationSec', String(duration));
    if (albumId) form.append('albumId', albumId);
    if (genre.trim()) form.append('genre', genre.trim());
    mutation.mutate(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-surface p-5">
      <h2 className="text-lg font-bold">Enviar música</h2>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-fg/25 px-4 py-4 text-sm hover:border-accent">
        <Music size={20} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1 truncate">
          {audioFile
            ? `${audioFile.name} • ${formatTime(duration)}`
            : `Escolher áudio (MP3, WAV, OGG ou M4A • até ${MAX_AUDIO_MB}MB)`}
        </span>
        <input
          type="file"
          accept=".mp3,.wav,.ogg,.m4a,audio/*"
          hidden
          onChange={(e) => void handleAudioChange(e.target.files?.[0])}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Título"
          aria-label="Título"
          className={inputClass}
        />
        <input
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          maxLength={60}
          placeholder="Gênero (opcional)"
          aria-label="Gênero"
          className={inputClass}
        />
        <select
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          aria-label="Álbum"
          className={inputClass}
        >
          <option value="">Sem álbum (single)</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-base px-4 py-3 text-sm ring-1 ring-fg/15 hover:ring-accent">
          <ImagePlus size={18} className="shrink-0 text-muted" />
          <span className="truncate">{coverFile ? coverFile.name : 'Capa (opcional)'}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => handleCoverChange(e.target.files?.[0])}
          />
        </label>
      </div>

      {mutation.isPending && (
        <div
          className="h-2 overflow-hidden rounded-full bg-fg/10"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button type="submit" disabled={mutation.isPending} className={primaryButtonClass}>
        {mutation.isPending ? `Enviando... ${progress}%` : 'Publicar música'}
      </button>
    </form>
  );
}
