import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Mic, Users, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/courses', icon: BookOpen, label: '课程' },
  { to: '/dub', icon: Mic, label: '配音' },
  { to: '/groups', icon: Users, label: '群组' },
  { to: '/profile', icon: User, label: '我的' },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-night/95 backdrop-blur-xl border-t border-amber/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-1 px-3 min-w-0 transition-all duration-200
              ${isActive ? 'text-amber' : 'text-moon-dim hover:text-moon'}`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-6 h-0.5 rounded-full bg-amber" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}