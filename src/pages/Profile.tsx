import { useState, useEffect } from 'react';
import { api, LANG_CONFIG, LEVEL_LABELS } from '@/utils/api';
import { useAuthStore } from '@/hooks/useStore';
import { Edit2, Save, X, Award, Flame, Mic, Languages, Calendar, User, Bell, Target } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  nativeLanguage: string;
  languages: { language: string; level: string }[];
  createdAt: string;
}

interface UserStats {
  totalCheckins: number;
  totalDubWorks: number;
  totalTranslations: number;
  streak: number;
}

interface WorkItem {
  id: number;
  title: string;
  language: string;
  createdAt: string;
}

export default function Profile() {
  const { user: authUser, setAuth } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalCheckins: 0, totalDubWorks: 0, totalTranslations: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Works tabs
  const [worksTab, setWorksTab] = useState<'dub' | 'translate' | 'writing'>('dub');
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  // Settings
  const [dailyGoal, setDailyGoal] = useState(30);
  const [notifyCheckin, setNotifyCheckin] = useState(true);
  const [notifyNewContent, setNotifyNewContent] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ success: boolean; data: UserProfile & { stats: UserStats } }>('/users/profile')
      .then((res) => {
        if (res.success) {
          setProfile(res.data);
          setStats(res.data.stats);
          setEditBio(res.data.bio || '');
          // Update auth store
          setAuth(res.data, localStorage.getItem('token') || '');
        }
      })
      .catch(() => {
        // Use auth store data as fallback
        if (authUser) {
          setProfile({
            id: authUser.id,
            username: authUser.username,
            email: authUser.email,
            avatarUrl: authUser.avatarUrl,
            bio: authUser.bio,
            nativeLanguage: authUser.nativeLanguage,
            languages: authUser.languages,
            createdAt: new Date().toISOString(),
          });
          setEditBio(authUser.bio || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put('/users/profile', { bio: editBio });
      setProfile({ ...profile, bio: editBio });
      setEditing(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const levelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-emerald/10 text-emerald border-emerald/20';
      case 'advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-moon-dim/10 text-moon-dim border-moon-dim/20';
    }
  };

  if (loading) {
    return (
      <div className="page-enter space-y-8">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full skeleton" />
            <div className="space-y-2">
              <div className="h-6 w-32 skeleton" />
              <div className="h-4 w-48 skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-enter">
        <div className="glass-card p-12 text-center text-moon-dim">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          <p>无法加载用户信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-moon">个人中心</h1>
        <p className="text-moon-dim mt-1 text-sm">管理你的学习档案</p>
      </div>

      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald/20 flex items-center justify-center text-emerald text-2xl font-bold shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-moon">{profile.username}</h2>
              {!editing && (
                <button
                  onClick={() => { setEditing(true); setEditBio(profile.bio || ''); }}
                  className="p-1.5 rounded-lg hover:bg-emerald/10 text-moon-dim hover:text-emerald transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-moon-dim">{profile.email}</p>

            {editing ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="介绍一下自己..."
                  rows={3}
                  className="input-night resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-glow px-4 py-1.5 text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save size={12} /> {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 text-xs text-moon-dim hover:text-moon transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> 取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-moon mt-2">{profile.bio || '暂无简介'}</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Calendar size={12} className="text-moon-dim" />
              <span className="text-xs text-moon-dim">
                {profile.createdAt ? `${formatDate(profile.createdAt)} 加入` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Calendar2 size={20} className="text-emerald" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.totalCheckins}</p>
          <p className="text-xs text-moon-dim">打卡天数</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Mic size={20} className="text-emerald" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.totalDubWorks}</p>
          <p className="text-xs text-moon-dim">配音作品</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Languages size={20} className="text-emerald" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.totalTranslations}</p>
          <p className="text-xs text-moon-dim">翻译数量</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Flame size={20} className="text-emerald" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.streak}</p>
          <p className="text-xs text-moon-dim">连续打卡</p>
        </div>
      </div>

      {/* Learning Languages */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-moon mb-4">学习语言</h3>
        {profile.languages.length === 0 ? (
          <p className="text-sm text-moon-dim">暂无学习语言</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${levelColor(lang.level)}`}
              >
                {LANG_CONFIG[lang.language]?.emoji} {LANG_CONFIG[lang.language]?.name || lang.language}
                <span className="opacity-70">{LEVEL_LABELS[lang.level] || lang.level}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* My Works */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-moon mb-4">我的作品</h3>
        <div className="flex gap-2 mb-4">
          {(['dub', 'translate', 'writing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setWorksTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                worksTab === tab
                  ? 'bg-emerald/15 text-emerald border border-emerald/20'
                  : 'text-moon-dim hover:text-moon hover:bg-emerald/5'
              }`}
            >
              {tab === 'dub' ? '配音' : tab === 'translate' ? '翻译' : '手写'}
            </button>
          ))}
        </div>
        {worksLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-full skeleton rounded-lg" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <p className="text-sm text-moon-dim text-center py-4">暂无作品</p>
        ) : (
          <div className="space-y-2">
            {works.map((work) => (
              <div key={work.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald/5 transition-colors">
                <span className="text-xs">{LANG_CONFIG[work.language]?.emoji}</span>
                <span className="text-sm text-moon flex-1">{work.title}</span>
                <span className="text-xs text-moon-dim">{formatDate(work.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-moon mb-4">设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-emerald" />
              <span className="text-sm text-moon">每日学习目标</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-moon-dim">{dailyGoal} 分钟</span>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-20 accent-emerald"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald" />
              <span className="text-sm text-moon">打卡提醒</span>
            </div>
            <button
              onClick={() => setNotifyCheckin(!notifyCheckin)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifyCheckin ? 'bg-emerald' : 'bg-moon-dim/20'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                notifyCheckin ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald" />
              <span className="text-sm text-moon">新内容通知</span>
            </div>
            <button
              onClick={() => setNotifyNewContent(!notifyNewContent)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifyNewContent ? 'bg-emerald' : 'bg-moon-dim/20'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                notifyNewContent ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Calendar2 icon
function Calendar2({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}