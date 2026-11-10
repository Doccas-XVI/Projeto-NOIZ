import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PlayerBar } from '@/components/player/PlayerBar';
import { AudioEngine } from '@/components/player/AudioEngine';

export function MainLayout() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar />
          <main className="flex-1 px-4 pb-8 pt-2 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <PlayerBar />
      <MobileNav />
      <AudioEngine />
    </div>
  );
}
