import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useStore';
import { api } from '@/utils/api';
import { Flame, Clock, BookOpen, Star, Mic, Languages, Pencil, Heart } from 'lucide-react';

interface Stats {
  totalCheckins: number;
  totalDubWorks: number;
  totalTranslations: number;
  streak: number;
}

interface Post {
  id: number;
  content: string;
  type: string;
  username: string;
  createdAt: string;
  likes: number;
  liked: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  dub: { label: '配音', cls: 'text-sakura' },
  translate: { label: '翻译', cls: 'text-celadon' },
  write: { label: '手写', cls: 'text-teak' },
  checkin: { label: '打卡', cls: 'text-indigo-light' },
};

const RECOMMENDATIONS = [
  { title: '配音跟读', desc: '模仿原声，提升口语', icon: Mic, color: 'text-sakura', bg: 'from-sakura/20 to-sakura/5', to: '/dub' },
  { title: '翻译练习', desc: '中英互译，学以致用', icon: Languages, color: 'text-celadon', bg: 'from-celadon/20 to-celadon/5', to: '/translate' },
  { title: '手写练习', desc: '一笔一画，书写美好', icon: Pencil, color: 'text-teak', bg: 'from-teak/20 to-teak/5', to: '/write' },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      setStatsLoading(false);
      return;
    }
    api.get<{ success: boolean; data: Stats }>('/achievements/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      setPostsLoading(false);
      return;
    }
    api.get<{ success: boolean; data: { language: string }[] }>('/groups')
      .then(async (res) => {
        const groups = res.data;
        if (groups.length > 0) {
          const postsRes = await api.get<{ success: boolean; data: { posts: Post[] } }>(
            `/groups/${groups[0].language}/posts?page=1`,
          );
          setPosts(postsRes.data.posts);
        }
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, []);

  const totalScore = stats
    ? stats.totalCheckins * 10 + stats.totalDubWorks * 5 + stats.totalTranslations * 5
    : 0;

  const statItems = [
    { label: '今日学习时长', value: stats ? `${stats.totalDubWorks + stats.totalTranslations}次` : '0', icon: Clock },
    { label: '完成课程数', value: stats ? stats.totalCheckins : 0, icon: BookOpen },
    { label: '连续打卡', value: stats ? `${stats.streak}天` : '0', icon: Flame },
    { label: '总积分', value: totalScore, icon: Star },
  ];

  return (
    <div className="page-enter space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass-card p-5 flex flex-col items-center gap-2"
          >
            <item.icon className="w-6 h-6 text-emerald" />
            {statsLoading ? (
              <div className="skeleton h-8 w-16 rounded" />
            ) : (
              <span className="text-2xl font-bold text-moon">{item.value}</span>
            )}
            <span className="text-xs text-moon-dim">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Daily Recommendations */}
      <section>
        <h2 className="text-xl font-semibold text-moon mb-1">今日推荐</h2>
        <p className="text-sm text-moon-dim mb-4">精选练习，助你每日进步</p>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {RECOMMENDATIONS.map((rec, i) => (
            <motion.div
              key={rec.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="min-w-[200px] flex-shrink-0"
            >
              <Link
                to={rec.to}
                className="glass-card p-5 flex flex-col items-center gap-3 h-full hover:border-emerald/30"
              >
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${rec.bg} flex items-center justify-center`}
                >
                  <rec.icon className={`w-7 h-7 ${rec.color}`} />
                </div>
                <span className="font-semibold text-moon">{rec.title}</span>
                <span className="text-xs text-moon-dim text-center">{rec.desc}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-white/5 ${rec.color}`}>推荐</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Feed */}
      <section>
        <h2 className="text-xl font-semibold text-moon mb-4">社区动态</h2>
        {!isAuthenticated() ? (
          <div className="glass-card p-8 text-center">
            <p className="text-moon-dim mb-3">登录后查看社区动态</p>
            <Link to="/login" className="btn-glow px-6 py-2 inline-block rounded-full text-sm">
              去登录
            </Link>
          </div>
        ) : postsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-full" />
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-3 w-12 rounded ml-auto" />
                </div>
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-8 text-center text-moon-dim">暂无动态，快去社区看看吧~</div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-emerald/20 flex items-center justify-center text-emerald text-sm font-semibold">
                    {post.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-moon">{post.username}</span>
                  <span className="text-xs text-moon-dim ml-auto">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-sm text-moon-dim mb-3">{post.content}</p>
                <div className="flex items-center gap-3">
                  {post.type && TYPE_BADGE[post.type] && (
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-white/5 ${TYPE_BADGE[post.type].cls}`}>
                      {TYPE_BADGE[post.type].label}
                    </span>
                  )}
                  <button className="flex items-center gap-1 text-xs text-moon-dim hover:text-emerald transition-colors ml-auto">
                    <Heart className={`w-4 h-4 ${post.liked ? 'fill-emerald text-emerald' : ''}`} />
                    {post.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}