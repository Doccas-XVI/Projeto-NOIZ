import { Search, Sun, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-base/80 px-4 py-4 backdrop-blur md:px-8">
      <button
        onClick={() => navigate('/search')}
        className="flex w-full max-w-xs items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm text-muted hover:text-white"
      >
        <Search size={16} />
        O que você quer ouvir hoje?
      </button>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} aria-label="Alternar tema" className="text-muted hover:text-white">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
            <button onClick={logout} aria-label="Sair" className="text-muted hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
