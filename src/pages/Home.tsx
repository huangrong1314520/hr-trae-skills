import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { api, LANG_CONFIG, type SceneCourse } from '@/utils/api';
import { getJaAudioDataUri } from '@/utils/audioData';
import { Clapperboard, Languages, Pencil, ArrowRight, Sparkles, Calendar, Volume2 } from 'lucide-react';

// 日语发音工具（与 SceneDetail 页相同的实现）
let homeAudioEl: HTMLAudioElement | null = null;

function getHomeAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!homeAudioEl) {
    homeAudioEl = new Audio();
    homeAudioEl.preload = 'auto';
    homeAudioEl.volume = 1;
  }
  return homeAudioEl;
}

function speakJa(text: string) {
  const audio = getHomeAudio();
  if (!audio) return;
  try { audio.pause(); } catch { /* ignore */ }
  audio.currentTime = 0;
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch { /* ignore */ }

  // 优先使用内嵌 base64 音频（本地，秒播）
  const embeddedUrl = getJaAudioDataUri(text);
  if (embeddedUrl) {
    audio.src = embeddedUrl;
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => fallbackBrowserSpeech(text));
    }
    return;
  }

  // 没有内嵌音频时，直接使用浏览器内置语音合成（最可靠，不依赖网络）
  fallbackBrowserSpeech(text);
}

function fallbackBrowserSpeech(text: string) {
  try {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.85;
      // 尝试使用日语语音引擎
      const voices = synth.getVoices();
      const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
      if (jaVoice) u.voice = jaVoice;
      synth.speak(u);
    }
  } catch { /* ignore */ }
}

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
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<SceneCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [speakingSceneId, setSpeakingSceneId] = useState<string | null>(null);

  // 朗读场景：优先找有内嵌音频的单词，否则用浏览器语音合成
  const handleSpeakScene = (scene: SceneCourse) => {
    // 找第一个有内嵌音频的单词，没有就用第一个单词
    const wordWithAudio = scene.words?.find((w) => getJaAudioDataUri(w.word));
    const text = wordWithAudio?.word || scene.words?.[0]?.word || scene.title;
    setSpeakingSceneId(scene.id);
    speakJa(text);

    const audio = getHomeAudio();
    const clear = () => {
      setSpeakingSceneId(null);
      audio?.removeEventListener('ended', clear);
      audio?.removeEventListener('error', clear);
    };
    if (audio) {
      audio.addEventListener('ended', clear);
      audio.addEventListener('error', clear);
    }
    // 兜底定时器
    setTimeout(() => setSpeakingSceneId(null), 3000);
  };

  // 获取场景课程列表（首页无需登录检查，直接展示）
  useEffect(() => {
    api
      .get<SceneCourse[]>('/scenes')
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : (res as unknown as { success: boolean; data: SceneCourse[] }).data ?? [];
        setScenes(list);
      })
      .catch(() => setScenes([]))
      .finally(() => setLoading(false));
  }, []);

  // 今日推荐：每天随机一个场景
  const todayScene = useMemo(() => {
    if (scenes.length === 0) return undefined;
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    return scenes[Math.abs(hash) % scenes.length];
  }, [scenes]);
  // 预览：前 4 个场景课程
  const previewScenes = scenes.slice(0, 4);

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
            <div
              onClick={() => navigate(`/scenes/${todayScene.id}`)}
              className="glass-card p-6 block hover:border-emerald/40 group relative cursor-pointer"
            >
              {/* 发音按钮 — 独立于卡片点击 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeakScene(todayScene);
                }}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  speakingSceneId === todayScene.id
                    ? 'bg-emerald/20 text-emerald animate-pulse'
                    : 'bg-white/5 text-moon-dim hover:bg-emerald/10 hover:text-emerald'
                }`}
                title="朗读"
              >
                <Volume2 size={16} />
              </button>

              <div className="flex items-start gap-5">
                <div className="text-5xl md:text-6xl shrink-0 select-none">
                  {todayScene.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-2 pr-10">
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
            </div>
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
                <div
                  onClick={() => navigate(`/scenes/${scene.id}`)}
                  className="glass-card p-5 flex items-center gap-4 hover:border-emerald/40 group relative cursor-pointer"
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakScene(scene);
                    }}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      speakingSceneId === scene.id
                        ? 'bg-emerald/20 text-emerald animate-pulse'
                        : 'bg-white/5 text-moon-dim/60 hover:bg-emerald/10 hover:text-emerald'
                    }`}
                    title="朗读"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>
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
