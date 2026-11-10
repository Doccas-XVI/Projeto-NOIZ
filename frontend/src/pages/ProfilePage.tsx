import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mic2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import { studioService } from '@/services/studioService';
import { useAuthStore } from '@/store/authStore';
import { Cover } from '@/components/common/Cover';
import { inputClass, primaryButtonClass } from '@/components/common/AuthLayout';
import { getErrorMessage } from '@/utils/errors';

const ROLE_LABEL = { LISTENER: 'Ouvinte', ARTIST: 'Artista', ADMIN: 'Administrador' } as const;

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setSession = useAuthStore((s) => s.setSession);
  const avatarInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [artistName, setArtistName] = useState(user?.name ?? '');
  const [bio, setBio] = useState('');

  const isArtist = user?.role === 'ARTIST' || user?.role === 'ADMIN';

  const artistQuery = useQuery({
    queryKey: ['studio', 'me'],
    queryFn: studioService.myCatalog,
    enabled: isArtist,
  });

  const updateName = useMutation({
    mutationFn: (value: string) => userService.updateProfile(value),
    onSuccess: (updated) => {
      updateUser({ name: updated.name });
      toast.success('Nome atualizado');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (updated) => {
      updateUser({ avatarUrl: updated.avatarUrl });
      toast.success('Foto atualizada');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const createArtist = useMutation({
    mutationFn: () => studioService.createArtist(artistName.trim(), bio.trim()),
    onSuccess: (result) => {
      // A role vive dentro do token: a API devolve uma sessão nova já como ARTIST
      setSession(result.user, result.accessToken, result.refreshToken);
      toast.success('Perfil de artista criado! Bem-vindo ao Estúdio.');
      navigate('/studio');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const artistImage = useMutation({
    mutationFn: ({ kind, file }: { kind: 'avatar' | 'cover'; file: File }) =>
      kind === 'avatar'
        ? studioService.uploadArtistAvatar(file)
        : studioService.uploadArtistCover(file),
    onSuccess: () => {
      toast.success('Imagem atualizada');
      void queryClient.invalidateQueries({ queryKey: ['studio'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <h1 className="text-2xl font-black md:text-3xl">Seu perfil</h1>

      {/* Conta */}
      <section className="space-y-5 rounded-xl bg-surface p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Cover src={user.avatarUrl} title={user.name} round className="h-24 w-24" />
            <button
              onClick={() => avatarInput.current?.click()}
              disabled={uploadAvatar.isPending}
              aria-label="Trocar foto de perfil"
              className="absolute inset-0 grid place-items-center rounded-full bg-black/60 text-white opacity-0 transition hover:opacity-100 focus-visible:opacity-100"
            >
              <Camera size={22} />
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar.mutate(file);
                e.target.value = '';
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
              {ROLE_LABEL[user.role]}
            </span>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (trimmed.length < 2) return toast.error('O nome precisa ter ao menos 2 caracteres.');
            updateName.mutate(trimmed);
          }}
          className="flex gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            aria-label="Nome"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={updateName.isPending || name.trim() === user.name}
            className={`${primaryButtonClass} shrink-0`}
          >
            Salvar
          </button>
        </form>
      </section>

      {/* Artista */}
      <section className="space-y-4 rounded-xl bg-surface p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Mic2 size={20} className="text-accent" />{' '}
          {isArtist ? 'Perfil de artista' : 'Seja artista na NOIZ'}
        </h2>

        {isArtist ? (
          <>
            <p className="text-sm text-muted">
              Seu perfil público aparece na busca e na sua página. Envie músicas e álbuns pelo{' '}
              <Link to="/studio" className="font-semibold text-accent hover:underline">
                Estúdio
              </Link>
              .
            </p>
            {artistQuery.data && (
              <div className="flex flex-wrap gap-3">
                {(['avatar', 'cover'] as const).map((kind) => (
                  <label
                    key={kind}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-base px-4 py-2 text-sm font-medium ring-1 ring-fg/15 hover:ring-accent"
                  >
                    <Camera size={16} /> {kind === 'avatar' ? 'Foto do artista' : 'Capa da página'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) artistImage.mutate({ kind, file });
                        e.target.value = '';
                      }}
                    />
                  </label>
                ))}
              </div>
            )}
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (artistName.trim().length < 1) return toast.error('Escolha um nome artístico.');
              createArtist.mutate();
            }}
            className="space-y-3"
          >
            <p className="text-sm text-muted">
              Crie seu perfil de artista para subir músicas, montar álbuns e ter sua própria página.
            </p>
            <input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              maxLength={120}
              placeholder="Nome artístico"
              aria-label="Nome artístico"
              className={inputClass}
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Bio (opcional) — conta sua história"
              aria-label="Bio"
              className={`${inputClass} resize-none`}
            />
            <button type="submit" disabled={createArtist.isPending} className={primaryButtonClass}>
              {createArtist.isPending ? 'Criando...' : 'Criar perfil de artista'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
