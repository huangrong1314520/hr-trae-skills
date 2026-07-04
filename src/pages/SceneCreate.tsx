import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type SceneCourse } from '@/utils/api';
import { speakJa } from '@/utils/jaSpeaker';
import {
  Volume2,
  Sparkles,
  Share2,
  Copy,
  Check,
  Image,
  Type,
  Hash,
  Heart,
  MessageCircle,
  Bookmark,
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Film,
  AlignLeft,
  X,
  Settings,
} from 'lucide-react';

export default function SceneCreate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scene, setScene] = useState<SceneCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [speakingExample, setSpeakingExample] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'post' | 'video'>('post');

  // 视频模式状态
  const [videoFullscreen, setVideoFullscreen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoTheme, setVideoTheme] = useState(0);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoShowExample, setVideoShowExample] = useState(true);

  useEffect(() => {
    api
      .get<SceneCourse>(`/scenes/${id}`)
      .then((res) => {
        const detail = (res as unknown as { data?: SceneCourse }).data ?? res;
        setScene(detail);
        generateDefaultContent(detail);
      })
      .catch(() => setScene(null))
      .finally(() => setLoading(false));
  }, [id]);

  function generateDefaultContent(sceneData: SceneCourse) {
    const wordList = sceneData.words.map((w) => w.word).join('、');
    const grammarList = sceneData.grammars.map((g) => g.pattern).join('、');
    
    setPostTitle(`🌸 日语学习｜${sceneData.title}场景单词&语法`);
    
    let content = `✨ 今日学习：${sceneData.title}
━━━━━━━━━━━━━━━━

📚 单词学习
${sceneData.words.map((w, i) => `${i + 1}. ${w.word}【${w.reading}】${w.meaning}`).join('\n')}

📝 语法要点
${sceneData.grammars.map((g, i) => `${i + 1}. ${g.pattern}\n   📌 ${g.explanation}\n   🗣️ ${g.example}\n   👉 ${g.exampleTrans}`).join('\n\n')}

💡 学习心得：今天学会了${sceneData.title}相关的${sceneData.words.length}个单词和${sceneData.grammars.length}个语法点！`;
    
    setPostContent(content);
    
    setHashtags([
      `#日语学习`,
      `#${sceneData.title}日语`,
      `#日语N${sceneData.level.replace('N', '')}`,
      `#日语单词`,
      `#日语语法`,
      `#日本生活`,
    ]);
  }

  const templates = [
    {
      name: '清新日系',
      bg: 'bg-gradient-to-br from-pink-50 via-white to-purple-50',
      text: 'text-gray-800',
      accent: 'text-pink-500',
      border: 'border-pink-100',
    },
    {
      name: '简约白',
      bg: 'bg-white',
      text: 'text-gray-900',
      accent: 'text-emerald-500',
      border: 'border-gray-200',
    },
    {
      name: '深夜模式',
      bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
      text: 'text-slate-100',
      accent: 'text-cyan-400',
      border: 'border-slate-700',
    },
    {
      name: '抹茶绿',
      bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      text: 'text-gray-800',
      accent: 'text-emerald-600',
      border: 'border-emerald-100',
    },
  ];

  async function handleSpeakWord(word: string) {
    setSpeakingWord(word);
    await speakJa(word).finally(() => setSpeakingWord(null));
  }

  async function handleSpeakExample(example: string) {
    setSpeakingExample(example);
    await speakJa(example).finally(() => setSpeakingExample(null));
  }

  /* ========== 视频模式逻辑 ========== */
  const videoThemes = [
    {
      name: '清新粉紫',
      bg: 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100',
      text: 'text-gray-800',
      accent: 'text-pink-500',
      subText: 'text-gray-500',
      cardBg: 'bg-white/70 backdrop-blur-sm',
      progress: 'bg-pink-400',
    },
    {
      name: '深夜蓝',
      bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
      text: 'text-white',
      accent: 'text-cyan-400',
      subText: 'text-slate-400',
      cardBg: 'bg-white/10 backdrop-blur-md',
      progress: 'bg-cyan-400',
    },
    {
      name: '抹茶绿',
      bg: 'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50',
      text: 'text-gray-800',
      accent: 'text-emerald-600',
      subText: 'text-gray-500',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      progress: 'bg-emerald-500',
    },
    {
      name: '温暖橙',
      bg: 'bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-50',
      text: 'text-gray-800',
      accent: 'text-orange-500',
      subText: 'text-gray-500',
      cardBg: 'bg-white/70 backdrop-blur-sm',
      progress: 'bg-orange-400',
    },
  ];

  // 构建视频播放列表 + 时间轴
  function buildVideoPlaylist() {
    if (!scene) return { items: [] as any[], totalDuration: 0, durations: [] as number[] };
    const items: { type: 'word' | 'example'; text: string; reading?: string; meaning?: string; trans?: string; index: number; total: number; duration: number; startTime: number }[] = [];
    const durations: number[] = [];
    let t = 0;
    // 基础时长（毫秒）：单词3s，例句5s
    const baseWordDur = 3000;
    const baseExampleDur = 5000;

    scene.words.forEach((word, i) => {
      const wordDur = baseWordDur;
      items.push({
        type: 'word',
        text: word.word,
        reading: word.reading,
        meaning: word.meaning,
        index: i,
        total: scene.words.length,
        duration: wordDur,
        startTime: t,
      });
      durations.push(wordDur);
      t += wordDur;

      if (word.example && videoShowExample) {
        const exDur = baseExampleDur;
        items.push({
          type: 'example',
          text: word.example,
          trans: word.exampleTrans,
          index: i,
          total: scene.words.length,
          duration: exDur,
          startTime: t,
        });
        durations.push(exDur);
        t += exDur;
      }
    });

    return { items, totalDuration: t, durations };
  }

  const { items: videoPlaylist, totalDuration: videoTotalDuration } = buildVideoPlaylist();
  const currentVideoItem = videoPlaylist[videoIndex];

  // 播放状态 ref
  const playingRef = useRef(false);
  const currentIdxRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const fullscreenProgressRef = useRef<HTMLDivElement>(null);
  const progressRafRef = useRef<number | null>(null);
  const itemStartTimeRef = useRef(0);  // 当前条目开始播放的时间戳
  const itemProgressRef = useRef(0);  // 暂停时当前条目的已播放进度（0~1）

  // 更新进度条
  function updateProgress(pct: number) {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${pct}%`;
    }
    if (fullscreenProgressRef.current) {
      fullscreenProgressRef.current.style.width = `${pct}%`;
    }
  }

  // 进度条 RAF 循环（仅用于显示进度，不驱动播放）
  function progressTick() {
    if (!playingRef.current) return;

    const item = videoPlaylist[currentIdxRef.current];
    if (!item) {
      videoStop();
      return;
    }

    const elapsed = (performance.now() - itemStartTimeRef.current) * videoSpeed;
    const itemPct = Math.min(1, elapsed / item.duration);
    const totalPct = ((item.startTime + item.duration * itemPct) / videoTotalDuration) * 100;

    updateProgress(Math.min(100, totalPct));
    progressRafRef.current = requestAnimationFrame(progressTick);
  }

  // 播放指定索引的条目
  function playItem(idx: number) {
    if (idx >= videoPlaylist.length) {
      // 播放完毕
      videoStop();
      return;
    }

    const item = videoPlaylist[idx];
    if (!item) {
      videoStop();
      return;
    }

    currentIdxRef.current = idx;
    setVideoIndex(idx);
    itemStartTimeRef.current = performance.now();
    itemProgressRef.current = 0;

    // 发音状态
    if (item.type === 'word') setSpeakingWord(item.text);
    else setSpeakingExample(item.text);

    // 播放音频
    speakJa(item.text)
      .catch(() => {
        // 音频失败也继续
      })
      .finally(() => {
        if (item.type === 'word') setSpeakingWord(null);
        else setSpeakingExample(null);
      });

    // 按固定时长切换到下一条（确保节奏稳定）
    const duration = item.duration / videoSpeed;
    setTimeout(() => {
      if (playingRef.current) {
        playItem(idx + 1);
      }
    }, duration);
  }

  // 开始/继续播放
  function videoPlay() {
    if (videoPlaylist.length === 0) return;
    if (playingRef.current) return;

    playingRef.current = true;
    setVideoPlaying(true);

    // 从头开始或从当前位置继续
    const startIdx = videoIndex >= videoPlaylist.length ? 0 : videoIndex;
    itemStartTimeRef.current = performance.now();

    // 启动进度条动画
    progressRafRef.current = requestAnimationFrame(progressTick);

    // 立即播放（在用户点击的同步回调中，确保移动端能播）
    playItem(startIdx);
  }

  // 暂停
  function videoPause() {
    if (!playingRef.current) return;
    playingRef.current = false;
    setVideoPlaying(false);

    // 停止进度条
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }

    // 取消音频
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch { /* ignore */ }

    // 记录当前进度位置
    const item = videoPlaylist[currentIdxRef.current];
    if (item) {
      const elapsed = (performance.now() - itemStartTimeRef.current) * videoSpeed;
      itemProgressRef.current = Math.min(1, elapsed / item.duration);
    }
  }

  // 停止
  function videoStop() {
    playingRef.current = false;
    setVideoPlaying(false);

    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }

    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch { /* ignore */ }
  }

  // 重置
  function videoReset() {
    videoStop();
    currentIdxRef.current = 0;
    setVideoIndex(0);
    itemProgressRef.current = 0;
    requestAnimationFrame(() => updateProgress(0));
  }

  // 下一个
  function videoNext() {
    if (videoIndex < videoPlaylist.length - 1) {
      videoSeekTo(videoIndex + 1);
    }
  }

  // 上一个
  function videoPrev() {
    if (videoIndex > 0) {
      videoSeekTo(videoIndex - 1);
    }
  }

  // 切换播放/暂停
  function toggleVideoPlay() {
    if (videoPlaying) {
      videoPause();
    } else {
      videoPlay();
    }
  }

  // 跳转到指定条目
  function videoSeekTo(idx: number) {
    if (idx < 0 || idx >= videoPlaylist.length) return;

    const wasPlaying = playingRef.current;
    // 先停止当前播放
    videoStop();

    currentIdxRef.current = idx;
    setVideoIndex(idx);
    itemProgressRef.current = 0;

    // 更新进度条
    const item = videoPlaylist[idx];
    if (item && videoTotalDuration > 0) {
      updateProgress((item.startTime / videoTotalDuration) * 100);
    }

    // 如果之前在播放，继续播放
    if (wasPlaying) {
      videoPlay();
    } else {
      // 暂停状态下跳转，也播一下音频（用户交互触发，移动端可播）
      const item = videoPlaylist[idx];
      if (item) {
        if (item.type === 'word') setSpeakingWord(item.text);
        else setSpeakingExample(item.text);
        speakJa(item.text).finally(() => {
          if (item.type === 'word') setSpeakingWord(null);
          else setSpeakingExample(null);
        });
      }
    }
  }

  // 清理
  useEffect(() => {
    return () => {
      videoStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当例句开关变化时，重置
  useEffect(() => {
    videoReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoShowExample]);

  // 全屏
  function toggleFullscreen() {
    if (!videoFullscreen) {
      setVideoFullscreen(true);
    } else {
      setVideoFullscreen(false);
      videoStop();
    }
  }

  async function copyPost() {
    const fullPost = `${postTitle}\n\n${postContent}\n\n${hashtags.join(' ')}`;
    await navigator.clipboard.writeText(fullPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-emerald/30 border-t-emerald rounded-full"
        />
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-moon-dim">场景不存在</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald hover:underline">
          返回首页
        </button>
      </div>
    );
  }

  const currentTemplate = templates[selectedTemplate];
  const currentVideoTheme = videoThemes[videoTheme];

  // 视频全屏模式
  if (videoFullscreen && scene) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${currentVideoTheme.bg}`}
      >
        {/* 关闭按钮 */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 进度条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
          <div
            ref={fullscreenProgressRef}
            className={`h-full ${currentVideoTheme.progress}`}
            style={{ width: '0%' }}
          />
        </div>

        {/* 视频内容区 - 9:16 竖屏比例 */}
        <div className="relative w-full max-w-md aspect-[9/16] mx-4">
          <AnimatePresence mode="wait">
            {currentVideoItem && (
              <motion.div
                key={videoIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${currentVideoTheme.cardBg} rounded-3xl shadow-2xl`}
              >
                {/* 场景标题 */}
                <div className={`text-sm mb-8 ${currentVideoTheme.subText}`}>
                  {scene.icon} {scene.title} · {currentVideoItem.index + 1}/{currentVideoItem.total}
                </div>

                {currentVideoItem.type === 'word' ? (
                  <>
                    {/* 单词标签 */}
                    <div className={`px-4 py-1 rounded-full text-sm mb-4 ${currentVideoTheme.accent} bg-current/10`}>
                      单词
                    </div>
                    {/* 日语单词 */}
                    <p className={`font-serif text-5xl font-bold mb-3 ${currentVideoTheme.text} text-center`}>
                      {currentVideoItem.text}
                    </p>
                    {/* 注音 */}
                    {currentVideoItem.reading && (
                      <p className={`text-lg mb-4 ${currentVideoTheme.accent}`}>
                        {currentVideoItem.reading}
                      </p>
                    )}
                    {/* 释义 */}
                    {currentVideoItem.meaning && (
                      <p className={`text-xl ${currentVideoTheme.subText} text-center`}>
                        {currentVideoItem.meaning}
                      </p>
                    )}
                    {/* 发音动画 */}
                    <motion.div
                      animate={speakingWord === currentVideoItem.text ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: speakingWord === currentVideoItem.text ? Infinity : 0 }}
                      className={`mt-8 w-16 h-16 rounded-full flex items-center justify-center ${currentVideoTheme.accent} bg-current/10`}
                    >
                      <Volume2 size={28} />
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* 例句标签 */}
                    <div className={`px-4 py-1 rounded-full text-sm mb-4 ${currentVideoTheme.accent} bg-current/10`}>
                      例句
                    </div>
                    {/* 例句 */}
                    <p className={`font-serif text-2xl leading-relaxed mb-4 ${currentVideoTheme.text} text-center`}>
                      {currentVideoItem.text}
                    </p>
                    {/* 翻译 */}
                    {currentVideoItem.trans && (
                      <p className={`text-base ${currentVideoTheme.subText} text-center`}>
                        {currentVideoItem.trans}
                      </p>
                    )}
                    {/* 发音动画 */}
                    <motion.div
                      animate={speakingExample === currentVideoItem.text ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: speakingExample === currentVideoItem.text ? Infinity : 0 }}
                      className={`mt-8 w-16 h-16 rounded-full flex items-center justify-center ${currentVideoTheme.accent} bg-current/10`}
                    >
                      <Volume2 size={28} />
                    </motion.div>
                  </>
                )}

                {/* 底部水印 */}
                <div className={`absolute bottom-6 text-xs ${currentVideoTheme.subText} opacity-50`}>
                  🌸 日语学习打卡
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部控制栏 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={videoPrev}
            disabled={videoIndex === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoIndex === 0
                ? 'bg-black/10 text-black/30 cursor-not-allowed'
                : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={toggleVideoPlay}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
              videoPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {videoPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button
            onClick={videoNext}
            disabled={videoIndex >= videoPlaylist.length - 1}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoIndex >= videoPlaylist.length - 1
                ? 'bg-black/10 text-black/30 cursor-not-allowed'
                : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* 左下角速度 */}
        <div className="absolute bottom-8 left-8 flex items-center gap-2">
          <Settings size={16} className="text-white/50" />
          <select
            value={videoSpeed}
            onChange={(e) => setVideoSpeed(Number(e.target.value))}
            className="bg-black/20 text-white text-sm px-2 py-1 rounded border-0 outline-none cursor-pointer"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        {/* 右下角进度 */}
        <div className="absolute bottom-8 right-8 text-white/50 text-sm">
          {videoIndex + 1} / {videoPlaylist.length}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/scenes/${id}`)}
            className="flex items-center gap-2 text-moon-dim hover:text-emerald transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回学习</span>
          </button>
          <h1 className="font-serif text-xl font-semibold text-moon flex items-center gap-2">
            <Sparkles className="text-emerald" size={20} />
            {scene.title}创作
          </h1>
          <div className="w-20" />
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit mx-auto">
          <button
            onClick={() => setActiveTab('post')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'post'
                ? 'bg-emerald/15 text-emerald'
                : 'text-moon-dim hover:text-moon'
            }`}
          >
            <AlignLeft size={16} />
            图文帖子
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-emerald/15 text-emerald'
                : 'text-moon-dim hover:text-moon'
            }`}
          >
            <Film size={16} />
            视频模式
          </button>
        </div>

        {/* 图文帖子 Tab */}
        {activeTab === 'post' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：内容编辑区 */}
          <div className="space-y-4">
            {/* 模板选择 */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-emerald" size={18} />
                <span className="font-medium text-moon">选择模板</span>
              </div>
              <div className="flex gap-2">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTemplate(i)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === i
                        ? 'border-emerald shadow-lg shadow-emerald/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ backgroundColor: tpl.bg === 'bg-white' ? '#fff' : undefined }}
                  >
                    <div className={`w-full h-8 rounded mb-2 ${tpl.bg}`} />
                    <span className="text-xs text-moon-dim">{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 标题输入 */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="text-emerald" size={18} />
                <span className="font-medium text-moon">帖子标题</span>
              </div>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-moon placeholder-moon-dim/50 focus:outline-none focus:border-emerald/50"
                placeholder="输入帖子标题..."
              />
            </div>

            {/* 正文编辑 */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="text-emerald" size={18} />
                <span className="font-medium text-moon">帖子内容</span>
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={12}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-moon placeholder-moon-dim/50 focus:outline-none focus:border-emerald/50 resize-none font-mono text-sm"
                placeholder="输入帖子内容..."
              />
            </div>

            {/* 标签编辑 */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="text-emerald" size={18} />
                <span className="font-medium text-moon">话题标签</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-emerald/10 text-emerald text-sm flex items-center gap-1 cursor-pointer hover:bg-emerald/20"
                    onClick={() => setHashtags(hashtags.filter((_, j) => j !== i))}
                  >
                    {tag}
                    <span className="text-xs opacity-60">×</span>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val && !hashtags.includes(val) && !hashtags.includes(`#${val}`)) {
                      setHashtags([...hashtags, val.startsWith('#') ? val : `#${val}`]);
                      e.currentTarget.value = '';
                    }
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-moon placeholder-moon-dim/50 focus:outline-none focus:border-emerald/50 text-sm"
                placeholder="输入标签后按回车添加..."
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => generateDefaultContent(scene)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/20 text-moon-dim hover:border-emerald/50 hover:text-emerald transition-all"
              >
                <RefreshCw size={16} />
                重置内容
              </button>
              <button
                onClick={copyPost}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-all"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? '已复制' : '复制文案'}
              </button>
            </div>
          </div>

          {/* 右侧：预览区 + 快速参考 */}
          <div className="space-y-4">
            {/* 预览卡片 */}
            <div className={`${currentTemplate.bg} ${currentTemplate.border} border rounded-2xl p-6 shadow-xl`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  🇯🇵
                </div>
                <div>
                  <p className={`font-medium ${currentTemplate.text}`}>日语学习者</p>
                  <p className="text-xs text-gray-400">今天 12:00</p>
                </div>
              </div>
              
              <h2 className={`text-lg font-semibold mb-3 ${currentTemplate.text}`}>
                {postTitle || '🌸 日语学习｜场景单词&语法'}
              </h2>
              
              <div className={`whitespace-pre-wrap text-sm leading-relaxed mb-4 ${currentTemplate.text}`}>
                {postContent || '✨ 今日学习内容...'}
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className={`text-xs ${currentTemplate.accent} hover:underline cursor-pointer`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* 互动栏 */}
              <div className="flex items-center justify-between text-gray-500">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm hover:text-red-500 transition-colors">
                    <Heart size={18} />
                    <span>128</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors">
                    <MessageCircle size={18} />
                    <span>24</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm hover:text-yellow-500 transition-colors">
                    <Bookmark size={18} />
                    <span>36</span>
                  </button>
                </div>
                <button className="flex items-center gap-1 text-sm hover:text-gray-600 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* 快速参考 - 单词 */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bookmark className="text-emerald" size={18} />
                <span className="font-medium text-moon">快速参考</span>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-moon-dim">单词</h3>
                {scene.words.slice(0, 5).map((word, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleSpeakWord(word.word)}
                  >
                    <Volume2
                      className={`w-4 h-4 shrink-0 ${
                        speakingWord === word.word
                          ? 'text-emerald animate-pulse'
                          : 'text-moon-dim/40'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-moon truncate">{word.word}</p>
                      <p className="text-xs text-moon-dim truncate">{word.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-3">
                <h3 className="text-sm font-medium text-moon-dim">语法</h3>
                {scene.grammars.slice(0, 3).map((grammar, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleSpeakExample(grammar.example)}
                  >
                    <Volume2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        speakingExample === grammar.example
                          ? 'text-emerald animate-pulse'
                          : 'text-moon-dim/40'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-emerald truncate">{grammar.pattern}</p>
                      <p className="text-xs text-moon-dim truncate">{grammar.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* 视频模式 Tab */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：设置区 */}
            <div className="space-y-4">
              {/* 主题选择 */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-emerald" size={18} />
                  <span className="font-medium text-moon">选择主题</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {videoThemes.map((theme, i) => (
                    <button
                      key={i}
                      onClick={() => setVideoTheme(i)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        videoTheme === i
                          ? 'border-emerald shadow-lg shadow-emerald/20'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-full h-12 rounded mb-2 ${theme.bg}`} />
                      <span className="text-xs text-moon-dim">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 播放设置 */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="text-emerald" size={18} />
                  <span className="font-medium text-moon">播放设置</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-moon-dim">播放速度</span>
                    <select
                      value={videoSpeed}
                      onChange={(e) => setVideoSpeed(Number(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-moon focus:outline-none focus:border-emerald/50"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x (正常)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-moon-dim">包含例句</span>
                    <button
                      onClick={() => {
                        setVideoShowExample(!videoShowExample);
                        videoReset();
                      }}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        videoShowExample ? 'bg-emerald' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                          videoShowExample ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 播放列表 */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Film className="text-emerald" size={18} />
                  <span className="font-medium text-moon">播放列表</span>
                  <span className="text-xs text-moon-dim ml-auto">
                    共 {videoPlaylist.length} 条
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {videoPlaylist.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => videoSeekTo(i)}
                      className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-all ${
                        videoIndex === i
                          ? 'bg-emerald/10 border border-emerald/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                        item.type === 'word'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {item.type === 'word' ? '单词' : '例句'}
                      </span>
                      <span className="text-sm text-moon truncate flex-1">
                        {item.text}
                      </span>
                      <span className="text-xs text-moon-dim shrink-0">
                        {i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={videoReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/20 text-moon-dim hover:border-emerald/50 hover:text-emerald transition-all"
                >
                  <RefreshCw size={16} />
                  重置
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-all"
                >
                  <Maximize2 size={16} />
                  全屏播放
                </button>
              </div>
            </div>

            {/* 右侧：预览区 */}
            <div className="flex flex-col items-center">
              <div className="text-sm text-moon-dim mb-3">预览效果（9:16 竖屏）</div>
              {/* 竖屏预览框 */}
              <div className={`relative w-full max-w-xs aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ${currentVideoTheme.bg}`}>
                <AnimatePresence mode="wait">
                  {currentVideoItem && (
                    <motion.div
                      key={videoIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className={`absolute inset-0 flex flex-col items-center justify-center p-6 ${currentVideoTheme.cardBg}`}
                    >
                      {/* 场景标题 */}
                      <div className={`text-xs mb-6 ${currentVideoTheme.subText}`}>
                        {scene.icon} {scene.title} · {currentVideoItem.index + 1}/{currentVideoItem.total}
                      </div>

                      {currentVideoItem.type === 'word' ? (
                        <>
                          <div className={`px-3 py-1 rounded-full text-xs mb-3 ${currentVideoTheme.accent} bg-current/10`}>
                            单词
                          </div>
                          <p className={`font-serif text-3xl font-bold mb-2 ${currentVideoTheme.text} text-center`}>
                            {currentVideoItem.text}
                          </p>
                          {currentVideoItem.reading && (
                            <p className={`text-sm mb-2 ${currentVideoTheme.accent}`}>
                              {currentVideoItem.reading}
                            </p>
                          )}
                          {currentVideoItem.meaning && (
                            <p className={`text-base ${currentVideoTheme.subText} text-center`}>
                              {currentVideoItem.meaning}
                            </p>
                          )}
                          <motion.div
                            animate={speakingWord === currentVideoItem.text ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.5, repeat: speakingWord === currentVideoItem.text ? Infinity : 0 }}
                            className={`mt-6 w-12 h-12 rounded-full flex items-center justify-center ${currentVideoTheme.accent} bg-current/10`}
                          >
                            <Volume2 size={20} />
                          </motion.div>
                        </>
                      ) : (
                        <>
                          <div className={`px-3 py-1 rounded-full text-xs mb-3 ${currentVideoTheme.accent} bg-current/10`}>
                            例句
                          </div>
                          <p className={`font-serif text-lg leading-relaxed mb-3 ${currentVideoTheme.text} text-center`}>
                            {currentVideoItem.text}
                          </p>
                          {currentVideoItem.trans && (
                            <p className={`text-sm ${currentVideoTheme.subText} text-center`}>
                              {currentVideoItem.trans}
                            </p>
                          )}
                          <motion.div
                            animate={speakingExample === currentVideoItem.text ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.5, repeat: speakingExample === currentVideoItem.text ? Infinity : 0 }}
                            className={`mt-6 w-12 h-12 rounded-full flex items-center justify-center ${currentVideoTheme.accent} bg-current/10`}
                          >
                            <Volume2 size={20} />
                          </motion.div>
                        </>
                      )}

                      {/* 底部水印 */}
                      <div className={`absolute bottom-4 text-xs ${currentVideoTheme.subText} opacity-50`}>
                        🌸 日语学习打卡
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 进度条 */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/10">
                  <div
                    ref={progressBarRef}
                    className={`h-full ${currentVideoTheme.progress}`}
                    style={{ width: '0%' }}
                  />
                </div>

                {/* 迷你控制栏 */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/30 backdrop-blur-sm flex items-center justify-between">
                  <button
                    onClick={videoPrev}
                    disabled={videoIndex === 0}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      videoIndex === 0
                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={toggleVideoPlay}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                      videoPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {videoPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                  <button
                    onClick={videoNext}
                    disabled={videoIndex >= videoPlaylist.length - 1}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      videoIndex >= videoPlaylist.length - 1
                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <SkipForward size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-moon-dim mt-3 text-center">
                💡 点击「全屏播放」进入全屏模式<br />
                用手机录屏即可保存为视频
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
