import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import InstallPrompt from '@/components/InstallPrompt';
import { useAppStore } from '@/hooks/useStore';
import { useEffect, useState } from 'react';

function Particles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 6,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="bg-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Layout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-night">
      <Particles />
      <Sidebar />
      <main
        className="transition-all duration-300 ease-in-out relative z-10 pb-20 md:pb-0
          md:ml-16 lg:ml-56
        "
      >
        <div className="min-h-screen px-4 py-4 md:p-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <InstallPrompt />
    </div>
  );
}