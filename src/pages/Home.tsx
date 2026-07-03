import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api, LANG_CONFIG, type SceneCourse } from '@/utils/api';
import { Clapperboard, Languages, Pencil, ArrowRight, Sparkles, Calendar } from 'lucide-react';

// 创作工坊入口配置
const WORKSHOPS = [
  {
    title: '视频创作',
    desc: '从素材库选择或上传视频，中日字幕+语法分析',
    icon: Clapperboard,
    to: '/create/video',
  },
  {
    title: '翻译练习',
    desc: '日语翻译练习，提升理解力',
    icon: Languages,
    to: '/create/translate',
  },
  {
    title: '手写练习',
    desc: '假名书写练习，一笔一画',
    icon: Pencil,
    to: '/create/write',
  },
];

export default function Home() {
  const [scenes, setScenes] = useState<SceneCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取场景课程列表（首页无需登录检查，直接展示）
  useEffect(() => {
    api
      .get<{ success: boolean; data: SceneCourse[] }>('/scenes')
      .then((res) => {
        if (res.success) setScenes(res.data || []);
      })
      .catch(() => setScenes([]))
      .finally(() => setLoading(false));
  }, []);

  // 今日推荐：取第一个场景
  const todayScene = scenes[0];
  // 预览：前 2 个场景课程
  const previewScenes = scenes.slice(0, 2);

  return (
    <div className="page-enter space-y-10">
      {/* 顶部欢迎区 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-moon">
          言夜 <span className="text-emerald">-</span> 日语创作工坊
        </h1>
        <p className="text-moon-dim text-base md:text-lg">
          用碎片时间，创作你的日语世界
        </p>
      </motion.section>

      {/* 今日场景推荐 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald" />
          <h2 className="text-xl font-semibold text-moon">今日场景推荐</h2>
        </div>
        {loading ? (
          <div className="glass-card p-6 space-y-4">
            <div className="skeleton h-8 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        ) : todayScene ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Link
              to={`/scenes/${todayScene.id}`}
              className="glass-card p-6 block hover:border-emerald/40 group"
            >
              <div className="flex items-start gap-5">
                <div className="text-5xl md:text-6xl shrink-0 select-none">
                  {todayScene.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-bold text-moon group-hover:text-emerald transition-colors">
                      {todayScene.title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                      {todayScene.level}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-moon-dim flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Day {todayScene.day}
                    </span>
                    {LANG_CONFIG[todayScene.lang] && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-moon-dim">
                        {LANG_CONFIG[todayScene.lang].emoji} {LANG_CONFIG[todayScene.lang].name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-moon-dim line-clamp-2">
                    {todayScene.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-emerald">
                    开始学习 <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ) : (
          <div className="glass-card p-6 text-center text-moon-dim">暂无推荐场景</div>
        )}
      </section>

      {/* 创作工坊入口 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-moon">创作工坊</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WORKSHOPS.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            >
              <Link
                to={w.to}
                className="glass-card p-6 h-full flex flex-col gap-3 hover:border-emerald/40 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center">
                  <w.icon className="w-6 h-6 text-emerald" />
                </div>
                <h3 className="text-lg font-semibold text-moon group-hover:text-emerald transition-colors">
                  {w.title}
                </h3>
                <p className="text-sm text-moon-dim">{w.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 场景课程预览 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-moon">场景课程</h2>
          <Link
            to="/scenes"
            className="text-sm text-emerald hover:text-emerald/80 flex items-center gap-1 transition-colors"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-card p-5 space-y-3">
                <div className="skeleton h-6 w-1/2" />
                <div className="skeleton h-4 w-full" />
              </div>
            ))}
          </div>
        ) : previewScenes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewScenes.map((scene, i) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              >
                <Link
                  to={`/scenes/${scene.id}`}
                  className="glass-card p-5 flex items-center gap-4 hover:border-emerald/40 group"
                >
                  <div className="text-3xl shrink-0 select-none">{scene.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-moon group-hover:text-emerald transition-colors">
                        {scene.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
                        {scene.level}
                      </span>
                    </div>
                    <p className="text-xs text-moon-dim line-clamp-1 mt-1">
                      {scene.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-moon-dim group-hover:text-emerald transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-moon-dim">暂无场景课程</div>
        )}
      </section>
    </div>
  );
}
