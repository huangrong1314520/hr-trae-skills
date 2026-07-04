import { NavLink } from 'react-router-dom';
import { useAppStore } from '@/hooks/useStore';
import {
  Home, Clapperboard, BookOpen, FolderOpen, User, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/create/video', icon: Clapperboard, label: '视频创作' },
  { to: '/scenes', icon: BookOpen, label: '场景课程' },
  { to: '/works', icon: FolderOpen, label: '我的作品' },
  { to: '/profile', icon: User, label: '个人中心' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-full z-40 flex-col transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-56'}
        bg-night/80 backdrop-blur-xl border-r border-emerald/10`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-emerald/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-emerald-dark flex items-center justify-center text-night font-bold text-sm shrink-0">
            言
          </div>
          {!sidebarCollapsed && (
            <span className="font-serif text-moon font-semibold text-lg whitespace-nowrap animate-fade-in">
              言夜
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1.5 rounded-lg hover:bg-emerald/10 transition-colors text-moon-dim"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${sidebarCollapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-emerald/15 text-emerald border border-emerald/20'
                : 'text-moon-dim hover:bg-emerald/5 hover:text-moon'
              }`
            }
          >
            <item.icon size={20} />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 创作工坊快捷入口 */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-emerald/10 space-y-1">
          <p className="text-xs text-moon-dim px-3 mb-2">创作工坊</p>
          <NavLink to="/create/translate" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
            ${isActive ? 'text-emerald' : 'text-moon-dim hover:text-moon hover:bg-emerald/5'}`
          }>
            <span className="w-5 text-center">译</span>
            <span>翻译练习</span>
          </NavLink>
          <NavLink to="/create/write" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
            ${isActive ? 'text-emerald' : 'text-moon-dim hover:text-moon hover:bg-emerald/5'}`
          }>
            <span className="w-5 text-center">写</span>
            <span>手写练习</span>
          </NavLink>
        </div>
      )}
    </aside>
  );
}
