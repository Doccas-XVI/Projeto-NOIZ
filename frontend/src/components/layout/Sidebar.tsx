import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, Clock, Mic2, Plus, ListMusic } from 'lucide-react';
import clsx from 'clsx';
import logo from '@/assets/logo.svg';
import { useMyPlaylists, useCreatePlaylist } from '@/hooks/usePlaylists';
import { useAuthStore } from '@/store/authStore';

const mainLinks = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/library', label: 'Sua biblioteca', icon: Library },
  { to: '/favorites', label: 'Curtidas', icon: Heart },
  { to: '/history', label: 'Histórico', icon: Clock },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-fg/10 text-accent' : 'text-muted hover:text-fg',
  );

export function Sidebar() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: playlists } = useMyPlaylists();
  const createPlaylist = useCreatePlaylist();

  async function handleNewPlaylist() {
    const playlist = await createPlaylist.mutateAsync('Nova playlist');
    navigate(`/playlists/${playlist.id}`, { state: { editing: true } });
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-fg/10 bg-surface p-6 md:flex">
      <img
        src={logo}
        alt="NOIZ"
        className="h-7 self-start"
        style={{ filter: 'var(--logo-filter, none)' }}
      />

      <nav className="flex flex-col gap-1" aria-label="Principal">
        {mainLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <NavLink to={role === 'LISTENER' ? '/profile' : '/studio'} className={linkClass}>
          <Mic2 size={20} />
          {role === 'LISTENER' ? 'Seja artista' : 'Estúdio'}
        </NavLink>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Playlists
          <button
            onClick={handleNewPlaylist}
            aria-label="Criar playlist"
            className="hover:text-accent"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto">
          {playlists?.map((playlist) => (
            <NavLink key={playlist.id} to={`/playlists/${playlist.id}`} className={linkClass}>
              <ListMusic size={16} className="shrink-0" />
              <span className="truncate">{playlist.name}</span>
            </NavLink>
          ))}
          {playlists?.length === 0 && (
            <p className="px-3 text-xs text-muted">Nenhuma playlist ainda.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
