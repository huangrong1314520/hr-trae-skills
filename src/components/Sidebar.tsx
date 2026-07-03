import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useAppStore } from '@/hooks/useStore';
import {
  LayoutDashboard, BookOpen, Mic, Pencil, Languages,
  Users, Trophy, User, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/courses', icon: BookOpen, label: '课程中心' },
  { to: '/dub', icon: Mic, label: '配音工坊' },
  { to: '/write', icon: Pencil, label: '手写练习' },
  { to: '/translate', icon: Languages, label: '翻译卡片' },
  { to: '/groups', icon: Users, label: '语种群组' },
  { to: '/achievements', icon: Trophy, label: '成就殿堂' },
  { to: '/profile', icon: User, label: '个人中心' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out
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

      {/* User section */}
      <div className="p-3 border-t border-emerald/10">
        {user ? (
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-emerald/20 flex items-center justify-center text-emerald text-sm font-bold shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-moon truncate">{user.username}</p>
                <p className="text-xs text-moon-dim truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-moon-dim hover:text-red-400 transition-colors"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 px-3 btn-glow text-sm"
          >
            {sidebarCollapsed ? '登' : '登录'}
          </button>
        )}
      </div>
    </aside>
  );
}