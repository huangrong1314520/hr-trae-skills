import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Trophy, Flame, Mic, Pencil, Languages, Users, Award } from 'lucide-react';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface Stats {
  totalCheckins: number;
  totalDubWorks: number;
  totalTranslations: number;
  streak: number;
}

interface LeaderboardUser {
  rank: number;
  user: { id: number; username: string; avatarUrl: string | null };
  count: number;
}

interface LeaderboardData {
  checkins: LeaderboardUser[];
  dubWorks: LeaderboardUser[];
  translations: LeaderboardUser[];
}

const BADGE_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'streak', label: '坚持' },
  { key: 'dub', label: '配音' },
  { key: 'translate', label: '翻译' },
  { key: 'writing', label: '书写' },
  { key: 'social', label: '社交' },
];

const CATEGORY_ICONS: Record<string, string> = {
  streak: '🔥',
  dub: '🎤',
  translate: '📝',
  writing: '✍️',
  social: '💬',
};

const LEADERBOARD_TABS = [
  { key: 'checkin', label: '打卡排行' },
  { key: 'dub', label: '配音排行' },
  { key: 'translate', label: '翻译排行' },
];

const LEADERBOARD_KEY_MAP: Record<string, keyof LeaderboardData> = {
  checkin: 'checkins',
  dub: 'dubWorks',
  translate: 'translations',
};

export default function Achievements() {
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
  const [badgeCategory, setBadgeCategory] = useState('all');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<Stats>({ totalCheckins: 0, totalDubWorks: 0, totalTranslations: 0, streak: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({ checkins: [], dubWorks: [], translations: [] });
  const [leaderboardTab, setLeaderboardTab] = useState('checkin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<{ success: boolean; data: Badge[] }>('/achievements'),
      api.get<{ success: boolean; data: Stats }>('/achievements/stats'),
      api.get<{ success: boolean; data: LeaderboardData }>('/achievements/leaderboard'),
    ])
      .then(([badgesRes, statsRes, leaderboardRes]) => {
        if (badgesRes.success) setBadges(badgesRes.data || []);
        if (statsRes.success) setStats(statsRes.data || { totalCheckins: 0, totalDubWorks: 0, totalTranslations: 0, streak: 0 });
        if (leaderboardRes.success) setLeaderboard(leaderboardRes.data || { checkins: [], dubWorks: [], translations: [] });
      })
      .catch(() => {
        setBadges([]);
        setLeaderboard({ checkins: [], dubWorks: [], translations: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBadges = badgeCategory === 'all'
    ? badges
    : badges.filter((b) => b.category === badgeCategory);

  const currentLeaderboard = leaderboard[LEADERBOARD_KEY_MAP[leaderboardTab]] || [];

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 bg-yellow-400/10';
    if (rank === 2) return 'text-gray-300 bg-gray-300/10';
    if (rank === 3) return 'text-amber-600 bg-amber-600/10';
    return 'text-moon-dim';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="page-enter space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-moon">成就殿堂</h1>
        <p className="text-moon-dim mt-1 text-sm">记录你的每一次成长</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Calendar2 size={20} className="text-amber" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.totalCheckins}</p>
          <p className="text-xs text-moon-dim">打卡天数</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Mic size={20} className="text-amber" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.totalDubWorks}</p>
          <p className="text-xs text-moon-dim">配音作品</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Languages size={20} className="text-amber" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.totalTranslations}</p>
          <p className="text-xs text-moon-dim">翻译数量</p>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="flex justify-center mb-2">
            <Flame size={20} className="text-amber" />
          </div>
          <p className="text-2xl font-bold text-moon">{stats.streak}</p>
          <p className="text-xs text-moon-dim">连续打卡</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'badges'
              ? 'bg-amber/15 text-amber border border-amber/20'
              : 'text-moon-dim hover:text-moon hover:bg-amber/5'
          }`}
        >
          勋章墙
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'leaderboard'
              ? 'bg-amber/15 text-amber border border-amber/20'
              : 'text-moon-dim hover:text-moon hover:bg-amber/5'
          }`}
        >
          排行榜
        </button>
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {BADGE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setBadgeCategory(cat.key)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  badgeCategory === cat.key
                    ? 'bg-amber/15 text-amber border border-amber/20'
                    : 'text-moon-dim hover:text-moon hover:bg-amber/5'
                }`}
              >
                {CATEGORY_ICONS[cat.key] && <span className="mr-1">{CATEGORY_ICONS[cat.key]}</span>}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Badge Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card p-4 space-y-3">
                  <div className="h-12 w-12 rounded-full skeleton mx-auto" />
                  <div className="h-4 w-20 skeleton mx-auto" />
                  <div className="h-3 w-full skeleton" />
                </div>
              ))}
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="glass-card p-12 text-center text-moon-dim">
              <Award size={48} className="mx-auto mb-3 opacity-30" />
              <p>暂无勋章</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`glass-card p-4 text-center transition-all duration-300 ${
                    badge.unlocked
                      ? 'border-amber/30 shadow-[0_0_20px_rgba(240,160,80,0.1)]'
                      : 'opacity-40 grayscale'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className={`text-sm font-bold mb-1 ${badge.unlocked ? 'text-moon' : 'text-moon-dim'}`}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-moon-dim mb-2">{badge.description}</p>
                  {badge.unlocked && badge.unlockedAt && (
                    <p className="text-xs text-amber">{formatDate(badge.unlockedAt)}</p>
                  )}
                  {!badge.unlocked && (
                    <p className="text-xs text-moon-dim/50">未解锁</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="flex gap-2">
            {LEADERBOARD_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setLeaderboardTab(tab.key)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  leaderboardTab === tab.key
                    ? 'bg-amber/15 text-amber border border-amber/20'
                    : 'text-moon-dim hover:text-moon hover:bg-amber/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Leaderboard List */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass-card p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="w-8 h-8 rounded-full skeleton" />
                  <div className="h-4 w-24 skeleton" />
                  <div className="flex-1" />
                  <div className="h-4 w-12 skeleton" />
                </div>
              ))}
            </div>
          ) : currentLeaderboard.length === 0 ? (
            <div className="glass-card p-12 text-center text-moon-dim">
              <Trophy size={48} className="mx-auto mb-3 opacity-30" />
              <p>暂无排名数据</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentLeaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`glass-card p-3 flex items-center gap-3 hover:border-amber/30 transition-all duration-200 ${
                    item.rank <= 3 ? 'border-amber/20' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(item.rank)}`}>
                    {getRankBadge(item.rank)}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center text-amber text-xs font-bold">
                    {item.user.username[0].toUpperCase()}
                  </div>
                  <span className={`text-sm ${item.rank <= 3 ? 'text-moon font-medium' : 'text-moon-dim'}`}>
                    {item.user.username}
                  </span>
                  <div className="flex-1" />
                  <span className="text-sm font-bold text-amber">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Calendar2 icon inline since we need it
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