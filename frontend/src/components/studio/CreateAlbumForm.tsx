import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { studioService } from '@/services/studioService';
import { getErrorMessage } from '@/utils/errors';
import { inputClass, primaryButtonClass } from '@/components/common/AuthLayout';

export function CreateAlbumForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'ALBUM' | 'SINGLE' | 'EP'>('ALBUM');
  const [releaseDate, setReleaseDate] = useState('');
  const [cover, setCover] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (form: FormData) => studioService.createAlbum(form),
    onSuccess: (album) => {
      toast.success(`Álbum "${album.title}" criado`);
      void queryClient.invalidateQueries({ queryKey: ['studio'] });
      void queryClient.invalidateQueries({ queryKey: ['albums', 'recent'] });
      setTitle('');
      setReleaseDate('');
      setCover(null);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível criar o álbum.')),
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return toast.error('Dê um título ao álbum.');

    // Campos vazios NÃO entram no FormData: a API rejeitaria "" como data/uuid inválido
    const form = new FormData();
    if (cover) form.append('cover', cover);
    form.append('title', title.trim());
    form.append('type', type);
    if (releaseDate) form.append('releaseDate', releaseDate);
    mutation.mutate(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-surface p-5">
      <h2 className="text-lg font-bold">Criar álbum</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Título do álbum"
          aria-label="Título do álbum"
          className={inputClass}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          aria-label="Tipo"
          className={inputClass}
        >
          <option value="ALBUM">Álbum</option>
          <option value="EP">EP</option>
          <option value="SINGLE">Single</option>
        </select>
        <input
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          aria-label="Data de lançamento"
          className={inputClass}
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-base px-4 py-3 text-sm ring-1 ring-fg/15 hover:ring-accent">
          <ImagePlus size={18} className="shrink-0 text-muted" />
          <span className="truncate">{cover ? cover.name : 'Capa (opcional)'}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <button type="submit" disabled={mutation.isPending} className={primaryButtonClass}>
        {mutation.isPending ? 'Criando...' : 'Criar álbum'}
      </button>
    </form>
  );
}
