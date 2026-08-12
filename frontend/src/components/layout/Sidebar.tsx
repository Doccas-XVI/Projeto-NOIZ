import { NavLink } from 'react-router-dom';
import { Home, Search, Library, ListMusic } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/library', label: 'Sua biblioteca', icon: Library },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 flex-col gap-6 border-r border-white/5 bg-surface p-6 md:flex">
      <span className="text-xl font-black tracking-tight text-accent">NOIZ</span>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-accent' : 'text-muted hover:text-white',
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-2 flex items-center gap-2 px-3 text-sm font-semibold text-muted">
        <ListMusic size={18} />
        Playlists
      </div>
      {/* TODO: próxima etapa — listar playlists do usuário aqui (useQuery) */}
    </aside>
  );
}
