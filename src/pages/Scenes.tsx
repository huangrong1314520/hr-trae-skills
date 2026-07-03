import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type SceneCourse } from '@/utils/api';
import { BookOpen, Sparkles } from 'lucide-react';

// 骨架卡片
function SkeletonCard() {
  return (
    <div className="glass-card p-5 flex items-center gap-5">
      <div className="skeleton h-16 w-16 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-5 w-12 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Scenes() {
  const [scenes, setScenes] = useState<SceneCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<SceneCourse[]>('/scenes')
      .then((res) => {
        // 兼容直接返回数组与 { success, data } 包装两种返回结构
        const list = Array.isArray(res)
          ? res
          : (res as unknown as { data?: SceneCourse[] }).data ?? [];
        setScenes(list);
      })
      .catch(() => setScenes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter space-y-8">
      {/* 页头 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald" />
          <h1 className="font-serif text-3xl font-bold text-moon">场景课程</h1>
        </div>
        <p className="text-moon-dim">每日一个主题，循序渐进掌握日语</p>
      </div>

      {/* 加载骨架屏 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && scenes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-moon-dim">
          <BookOpen size={48} className="mb-4 opacity-30" />
          <p className="text-lg">暂无场景课程</p>
        </div>
      )}

      {/* 课程卡片网格 */}
      {!loading && scenes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenes.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link
                to={`/scenes/${scene.id}`}
                className="glass-card relative overflow-hidden p-5 flex items-center gap-5 group hover:border-emerald/40 block"
              >
                {/* 背景图 */}
                {scene.imageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${scene.imageUrl})` }}
                  />
                )}
                {/* 半透明遮罩，确保文字可读 */}
                <div className="absolute inset-0 bg-night/70 group-hover:bg-night/60 transition-colors" />

                {/* 内容 */}
                <div className="relative z-10 flex items-center gap-5 w-full">
                  <span className="text-5xl leading-none flex-shrink-0">
                    {scene.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-moon truncate">
                      {scene.title}
                    </h3>
                    <p className="text-sm text-moon-dim line-clamp-2 mt-1">
                      {scene.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/15 text-emerald">
                        {scene.level}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-moon-dim">
                        Day {scene.day}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
