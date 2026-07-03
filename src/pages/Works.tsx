import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '@/utils/api';
import { Clapperboard, Languages, Pencil, Sparkles } from 'lucide-react';

// 作品类型：视频 / 翻译 / 手写（all 仅用于 Tab 过滤）
type WorkType = 'video' | 'translate' | 'write';
type TabKey = 'all' | WorkType;

// 原始作品结构（来自 localStorage，字段不确定）
interface RawWork {
  id: number;
  createdAt?: string;
  [key: string]: unknown;
}

interface WorksData {
  dubWorks: RawWork[];
  translations: RawWork[];
  handwriting: RawWork[];
}

// 统一后的作品结构
interface UnifiedWork {
  id: number;
  type: WorkType;
  title: string;
  content: string;
  createdAt?: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'video', label: '视频' },
  { key: 'translate', label: '翻译' },
  { key: 'write', label: '手写' },
];

// 类型对应的展示信息
const TYPE_META: Record<WorkType, { label: string; icon: typeof Clapperboard; color: string }> = {
  video: { label: '视频', icon: Clapperboard, color: 'text-emerald' },
  translate: { label: '翻译', icon: Languages, color: 'text-celadon' },
  write: { label: '手写', icon: Pencil, color: 'text-sakura' },
};

// 相对时间格式化
function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

// 将不同来源的作品统一化（按时间倒序）
function normalize(data: WorksData): UnifiedWork[] {
  const dub: UnifiedWork[] = (data.dubWorks || []).map((w, idx) => {
    const recorded = Array.isArray(w.recordedLines) ? w.recordedLines.length : 0;
    const content =
      recorded > 0
        ? `完成 ${recorded} 句配音`
        : (w.originalText as string) || (w.recordedText as string) || '';
    return {
      id: typeof w.id === 'number' ? w.id : idx,
      type: 'video',
      title: (w.title as string) || (w.materialTitle as string) || '配音作品',
      content,
      createdAt: w.createdAt,
    };
  });

  const trans: UnifiedWork[] = (data.translations || []).map((w, idx) => ({
    id: typeof w.id === 'number' ? w.id : idx,
    type: 'translate',
    title: '翻译练习',
    content:
      (w.translatedText as string) ||
      (w.translation as string) ||
      (w.originalText as string) ||
      '',
    createdAt: w.createdAt,
  }));

  const hand: UnifiedWork[] = (data.handwriting || []).map((w, idx) => ({
    id: typeof w.id === 'number' ? w.id : idx,
    type: 'write',
    title: '手写练习',
    content: (w.characterText as string) || '',
    createdAt: w.createdAt,
  }));

  return [...dub, ...trans, ...hand].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

export default function Works() {
  const [tab, setTab] = useState<TabKey>('all');
  const [works, setWorks] = useState<UnifiedWork[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取本地存储的作品
  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; data: WorksData }>('/works')
      .then((res) => {
        if (res.success) setWorks(normalize(res.data));
      })
      .catch(() => setWorks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? works : works.filter((w) => w.type === tab);

  return (
    <div className="page-enter space-y-8">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-moon">我的作品</h1>
        <p className="text-moon-dim">这里收藏着你的每一次创作</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? 'bg-emerald/15 text-emerald border border-emerald/30'
                : 'text-moon-dim hover:text-moon border border-transparent hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 加载骨架屏 */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && filtered.length === 0 && (
        <div className="glass-card p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-moon-dim opacity-30 mx-auto" />
          <p className="text-moon-dim">还没有作品，去创作吧！</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link to="/create/video" className="btn-glow px-5 py-2 text-sm">
              视频创作
            </Link>
            <Link to="/create/translate" className="btn-glow px-5 py-2 text-sm">
              翻译练习
            </Link>
            <Link to="/create/write" className="btn-glow px-5 py-2 text-sm">
              手写练习
            </Link>
          </div>
        </div>
      )}

      {/* 作品列表 */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((work, i) => {
            const meta = TYPE_META[work.type];
            return (
              <motion.div
                key={`${work.type}-${work.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="glass-card p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <meta.icon className={`w-4 h-4 ${meta.color}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-white/5 ${meta.color}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-moon-dim ml-auto">
                    {timeAgo(work.createdAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-moon">{work.title}</h3>
                {work.content && (
                  <p className="text-sm text-moon-dim line-clamp-3 whitespace-pre-wrap break-words">
                    {work.content}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
