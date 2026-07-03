import { useState, useEffect } from 'react';
import { api, LANG_CONFIG } from '@/utils/api';
import { Heart, Users } from 'lucide-react';

interface DubWork {
  id: number;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  material: {
    title: string;
    source: string;
  };
  overallScore: number;
  likesCount: number;
  createdAt: string;
}

interface WorksResponse {
  success: boolean;
  data: DubWork[];
}

function LanguageTab({
  lang,
  isActive,
  onClick,
}: {
  lang: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const config = LANG_CONFIG[lang];
  if (!config) return null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
        ${isActive
          ? 'bg-emerald/15 text-emerald border border-emerald/30'
          : 'text-moon-dim hover:text-moon border border-transparent hover:bg-white/5'
        }`}
    >
      <span className="text-lg">{config.emoji}</span>
      <span>{config.name}</span>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-32" />
        </div>
      </div>
      <div className="skeleton h-4 w-3/4" />
      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-14 rounded-full" />
        <div className="skeleton h-5 w-12" />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export default function DubWorks() {
  const [sort, setSort] = useState<'popular' | 'latest'>('popular');
  const [selectedLang, setSelectedLang] = useState('ja');
  const [works, setWorks] = useState<DubWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const langs = ['en', 'ja', 'ko', 'th'];

  useEffect(() => {
    setLoading(true);
    api
      .get<WorksResponse>(`/dub/works?sort=${sort}`)
      .then((res) => {
        if (res.success) {
          setWorks(res.data || []);
        }
      })
      .catch(() => {
        setWorks([]);
      })
      .finally(() => setLoading(false));
  }, [sort]);

  const handleLike = (workId: number) => {
    api
      .post(`/dub/works/${workId}/like`)
      .then(() => {
        setLikedIds((prev) => new Set(prev).add(workId));
        setWorks((prev) =>
          prev.map((w) =>
            w.id === workId ? { ...w, likesCount: w.likesCount + 1 } : w,
          ),
        );
      })
      .catch(() => {});
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return 'text-celadon bg-celadon/10 border-celadon/30';
    if (score >= 70) return 'text-emerald bg-emerald/10 border-emerald/30';
    return 'text-sakura bg-sakura/10 border-sakura/30';
  };

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-moon">作品广场</h1>
        <p className="text-moon-dim">发现社区优秀配音作品</p>
      </div>

      {/* Sort Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSort('popular')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300
            ${sort === 'popular'
              ? 'bg-emerald/15 text-emerald border border-emerald/30'
              : 'text-moon-dim hover:text-moon border border-transparent hover:bg-white/5'
            }`}
        >
          热门
        </button>
        <button
          onClick={() => setSort('latest')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300
            ${sort === 'latest'
              ? 'bg-emerald/15 text-emerald border border-emerald/30'
              : 'text-moon-dim hover:text-moon border border-transparent hover:bg-white/5'
            }`}
        >
          最新
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex flex-wrap gap-3">
        {langs.map((lang) => (
          <LanguageTab
            key={lang}
            lang={lang}
            isActive={selectedLang === lang}
            onClick={() => setSelectedLang(lang)}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && works.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-moon-dim">
          <Users size={48} className="mb-4 opacity-30" />
          <p className="text-lg">暂无作品</p>
        </div>
      )}

      {/* Works Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.map((work) => {
            const isLiked = likedIds.has(work.id);
            return (
              <div key={work.id} className="glass-card p-5 space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald/15 flex items-center justify-center text-emerald text-sm font-bold shrink-0">
                    {work.user.avatarUrl ? (
                      <img
                        src={work.user.avatarUrl}
                        alt={work.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      work.user.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-moon truncate">
                      {work.user.username}
                    </p>
                    <p className="text-xs text-moon-dim">{timeAgo(work.createdAt)}</p>
                  </div>
                </div>

                {/* Material Info */}
                <div>
                  <p className="text-sm text-moon font-medium line-clamp-1">
                    {work.material.title}
                  </p>
                  <p className="text-xs text-moon-dim mt-0.5">{work.material.source}</p>
                </div>

                {/* Score & Like */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreColor(work.overallScore)}`}
                  >
                    {work.overallScore} 分
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(work.id);
                    }}
                    className={`flex items-center gap-1.5 text-sm transition-colors
                      ${isLiked
                        ? 'text-sakura'
                        : 'text-moon-dim hover:text-sakura'
                      }`}
                  >
                    <Heart
                      size={16}
                      fill={isLiked ? 'currentColor' : 'none'}
                    />
                    <span>{work.likesCount}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}