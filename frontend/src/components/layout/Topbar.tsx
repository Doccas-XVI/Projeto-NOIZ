import { Search, Sun, Moon, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Cover } from '@/components/common/Cover';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-base/80 px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <button
        onClick={() => navigate('/search')}
        className="flex w-full max-w-xs items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-muted hover:text-fg"
      >
        <Search size={16} />
        <span className="truncate">O que você quer ouvir hoje?</span>
      </button>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="text-muted hover:text-fg"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <>
            <Link to="/profile" className="flex items-center gap-2" aria-label="Meu perfil">
              <Cover src={user.avatarUrl} title={user.name} round className="h-8 w-8" />
              <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
            </Link>
            <button onClick={logout} aria-label="Sair" className="text-muted hover:text-fg">
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
