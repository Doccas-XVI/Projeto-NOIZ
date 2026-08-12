import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { PlayerBar } from '@/components/player/PlayerBar';
import { Topbar } from '@/components/layout/Topbar';

export function MainLayout() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Topbar />
          <main className="flex-1 px-4 pb-6 pt-2 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}
