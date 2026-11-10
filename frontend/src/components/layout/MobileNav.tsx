import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, User } from 'lucide-react';
import clsx from 'clsx';

const items = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/favorites', label: 'Curtidas', icon: Heart },
  { to: '/profile', label: 'Perfil', icon: User },
];

/** Navegação inferior — só no celular (a sidebar some abaixo de `md`). */
export function MobileNav() {
  return (
    <nav aria-label="Principal" className="flex border-t border-fg/10 bg-surface md:hidden">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              isActive ? 'text-accent' : 'text-muted',
            )
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
