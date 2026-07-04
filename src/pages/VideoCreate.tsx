import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type VideoMaterial } from '@/utils/api';
import {
  Library,
  Upload,
  Link2,
  Play,
  Save,
  ChevronDown,
  ChevronUp,
  Clock,
  Film,
  Sparkles,
  BookOpen,
  AlertCircle,
  Check,
  ExternalLink,
  Bookmark,
  Trash2,
  Folder,
  FolderOpen,
  X,
} from 'lucide-react';

/* ========== 类型与常量 ========== */
type TabKey = 'library' | 'upload' | 'link';

const TABS: { key: TabKey; label: string; icon: typeof Library }[] = [
  { key: 'library', label: '素材库', icon: Library },
  { key: 'upload', label: '上传视频', icon: Upload },
  { key: 'link', label: '粘贴链接', icon: Link2 },
];

const TYPE_LABELS: Record<string, string> = {
  anime: '动漫',
  drama: '日剧',
  movie: '电影',
};

/* ========== 收藏视频记录类型 ========== */
interface SavedVideo {
  id: string;
  url: string;           // 原始链接
  embedUrl: string;      // 嵌入播放URL
  title: string;         // 标题（用户可编辑）
  platform: string;      // 来源平台
  platformIcon: string;  // 平台图标
  category: string;      // 分类
  createdAt: string;     // 保存时间
}

/* ========== 本地存储工具 ========== */
const STORAGE_KEY = 'saved-videos';
const CATEGORIES_KEY = 'video-categories';

const DEFAULT_CATEGORIES = ['默认收藏', '动漫', '日剧', '教学', '音乐', '其他'];

function getSavedVideos(): SavedVideo[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : [];
  } catch { return []; }
}
function setSavedVideos(list: SavedVideo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function getCategories(): string[] {
  try {
    const v = localStorage.getItem(CATEGORIES_KEY);
    return v ? JSON.parse(v) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
}
function setCategories(list: string[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
}

/* ========== 支持的视频平台 ========== */
interface VideoPlatform {
  name: string;
  color: string;
  icon: string;
  patterns: RegExp[];
  // 将原始链接转为可嵌入播放的 URL
  toEmbed: (url: string) => string;
}

const VIDEO_PLATFORMS: VideoPlatform[] = [
  {
    name: 'YouTube',
    color: '#ff0000',
    icon: '▶',
    patterns: [
      /youtube\.com\/watch\?v=/i,
      /youtu\.be\//i,
      /youtube\.com\/embed\//i,
    ],
    toEmbed: (url) => {
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
      return m ? `https://www.youtube.com/embed/${m[1]}` : url;
    },
  },
  {
    name: 'Bilibili',
    color: '#fb7299',
    icon: '📺',
    patterns: [
      /bilibili\.com\/video\//i,
      /b23\.tv\//i,
    ],
    toEmbed: (url) => {
      const bv = url.match(/bilibili\.com\/video\/(BV[\w]+)/i);
      if (bv) return `https://player.bilibili.com/player.html?bvid=${bv[1]}&high_quality=1&autoplay=0`;
      const av = url.match(/bilibili\.com\/video\/av(\d+)/i);
      if (av) return `https://player.bilibili.com/player.html?aid=${av[1]}&high_quality=1&autoplay=0`;
      return url;
    },
  },
  {
    name: '抖音',
    color: '#000000',
    icon: '🎵',
    patterns: [
      /douyin\.com\//i,
      /iesdouyin\.com\//i,
      /v\.douyin\.com\//i,
    ],
    toEmbed: (url) => {
      const m = url.match(/\/video\/(\d+)/i) || url.match(/modal_id=(\d+)/i);
      if (m) return `https://open.douyin.com/player/video?vid=${m[1]}`;
      return url;
    },
  },
  {
    name: '小红书',
    color: '#ff2442',
    icon: '📕',
    patterns: [
      /xiaohongshu\.com\//i,
      /xhslink\.com\//i,
    ],
    toEmbed: (url) => url,
  },
  {
    name: '西瓜视频',
    color: '#ff5c38',
    icon: '🍉',
    patterns: [
      /ixigua\.com\//i,
    ],
    toEmbed: (url) => {
      const m = url.match(/ixigua\.com\/(\d+)/i);
      if (m) return `https://player.ixigua.com/player.html?video_id=${m[1]}`;
      return url;
    },
  },
  {
    name: 'Niconico',
    color: '#cc0000',
    icon: '🎬',
    patterns: [
      /nicovideo\.jp\//i,
      /nico\.ms\//i,
    ],
    toEmbed: (url) => {
      const m = url.match(/(?:watch\/|nico\.ms\/)([a-z]{2}\d+)/i);
      if (m) return `https://embed.nicovideo.jp/watch/${m[1]}`;
      return url;
    },
  },
];

/** 识别链接所属平台 */
function detectPlatform(url: string): VideoPlatform | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  for (const p of VIDEO_PLATFORMS) {
    if (p.patterns.some((re) => re.test(trimmed))) return p;
  }
  return null;
}

/** 将视频链接转换为可嵌入的 URL */
function toEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  const platform = detectPlatform(trimmed);
  if (platform) return platform.toEmbed(trimmed);
  return trimmed;
}

/** 判断平台是否支持嵌入播放 */
function isEmbeddable(url: string): boolean {
  const platform = detectPlatform(url);
  if (!platform) return true;
  if (platform.name === '小红书') return false;
  return true;
}

/* ========== 工具函数 ========== */
// 秒数转 mm:ss
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// 格式化日期
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// 从URL提取标题（简略）
function extractTitleFromUrl(url: string, platform: VideoPlatform | null): string {
  if (!platform) return url.slice(0, 40);
  // B站BV号
  const bv = url.match(/BV([\w]+)/);
  if (bv) return `B站视频 BV${bv[1]}`;
  // 抖音
  const dy = url.match(/\/video\/(\d+)/);
  if (dy) return `抖音视频 ${dy[1].slice(-6)}`;
  // YouTube
  const yt = url.match(/(?:v=|be\/)([\w-]+)/);
  if (yt) return `YouTube ${yt[1]}`;
  return `${platform.name}视频`;
}

export default function VideoCreate() {
  /* ----- 素材选择相关状态 ----- */
  const [activeTab, setActiveTab] = useState<TabKey>('library');
  const [materials, setMaterials] = useState<VideoMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<VideoMaterial | null>(null);

  /* ----- 上传相关状态 ----- */
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  /* ----- 链接相关状态 ----- */
  const [linkInput, setLinkInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<VideoPlatform | null>(null);
  const [linkError, setLinkError] = useState('');

  /* ----- 字幕与面板状态 ----- */
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [showWords, setShowWords] = useState(true);
  const [showGrammar, setShowGrammar] = useState(true);

  /* ----- 保存状态 ----- */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ----- 收藏视频相关状态 ----- */
  const [savedVideos, setSavedVideosState] = useState<SavedVideo[]>([]);
  const [categories, setCategoriesState] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSaveVideo, setPendingSaveVideo] = useState<{
    url: string;
    embedUrl: string;
    platform: VideoPlatform | null;
  } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [dialogCategory, setDialogCategory] = useState('默认收藏');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const videoSectionRef = useRef<HTMLDivElement>(null);

  /* ----- 默认加载素材库列表 & 本地收藏 ----- */
  useEffect(() => {
    setMaterialsLoading(true);
    api
      .get<{ success: boolean; data: VideoMaterial[] }>('/video/materials')
      .then((res) => {
        if (res.success) setMaterials(res.data || []);
      })
      .catch(() => setMaterials([]))
      .finally(() => setMaterialsLoading(false));

    // 加载本地收藏与分类
    setSavedVideosState(getSavedVideos());
    setCategoriesState(getCategories());
  }, []);

  /* ----- 上传文件 Object URL 清理，避免内存泄漏 ----- */
  useEffect(() => {
    return () => {
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    };
  }, [uploadedUrl]);

  /* ----- 滚动到视频播放区 ----- */
  const scrollToVideo = () => {
    setTimeout(() => {
      videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  /* ----- 选择素材库素材 ----- */
  const handleSelectMaterial = (m: VideoMaterial) => {
    setSelectedMaterial(m);
    setActiveLineId(null);
    scrollToVideo();
  };

  /* ----- 处理文件上传 ----- */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedUrl(URL.createObjectURL(file));
    scrollToVideo();
  };

  /* ----- 解析粘贴链接 ----- */
  const handleLoadLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    setLinkError('');
    const platform = detectPlatform(trimmed);
    setDetectedPlatform(platform);
    if (platform && !isEmbeddable(trimmed)) {
      // 不支持嵌入的平台，提示用户在新窗口打开
      setLinkUrl(trimmed);
      setLinkError(`${platform.name} 暂不支持站内播放，可点击下方按钮跳转观看`);
    } else {
      setLinkUrl(trimmed);
    }

    // 自动弹出"是否保存到收藏"对话框
    const embed = toEmbedUrl(trimmed);
    setPendingSaveVideo({ url: trimmed, embedUrl: embed, platform });
    setEditTitle(extractTitleFromUrl(trimmed, platform));
    setDialogCategory('默认收藏');
    setShowSaveDialog(true);

    scrollToVideo();
  };

  /* ----- 确认保存到收藏 ----- */
  const confirmSaveVideo = () => {
    if (!pendingSaveVideo) return;
    const newVideo: SavedVideo = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: pendingSaveVideo.url,
      embedUrl: pendingSaveVideo.embedUrl,
      title: editTitle.trim() || extractTitleFromUrl(pendingSaveVideo.url, pendingSaveVideo.platform),
      platform: pendingSaveVideo.platform?.name || '未知来源',
      platformIcon: pendingSaveVideo.platform?.icon || '🎬',
      category: dialogCategory,
      createdAt: new Date().toISOString(),
    };
    const updated = [newVideo, ...savedVideos];
    setSavedVideosState(updated);
    setSavedVideos(updated);
    setShowSaveDialog(false);
    setPendingSaveVideo(null);
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  /* ----- 取消保存 ----- */
  const cancelSaveVideo = () => {
    setShowSaveDialog(false);
    setPendingSaveVideo(null);
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  /* ----- 删除收藏视频 ----- */
  const handleDeleteSaved = (id: string) => {
    const updated = savedVideos.filter((v) => v.id !== id);
    setSavedVideosState(updated);
    setSavedVideos(updated);
  };

  /* ----- 新建分类 ----- */
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      setDialogCategory(name);
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      return;
    }
    const updated = [...categories, name];
    setCategoriesState(updated);
    setCategories(updated);
    setDialogCategory(name);
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  };

  /* ----- 从收藏列表点击播放 ----- */
  const handlePlaySaved = (v: SavedVideo) => {
    setLinkUrl(v.url);
    setLinkInput(v.url);
    setDetectedPlatform(detectPlatform(v.url));
    setActiveTab('link');
    setLinkError('');
    if (!isEmbeddable(v.url)) {
      setLinkError(`${v.platform} 暂不支持站内播放，可点击下方按钮跳转观看`);
    }
    scrollToVideo();
  };

  /* ----- 链接输入变化时实时识别平台 ----- */
  const handleLinkInput = (value: string) => {
    setLinkInput(value);
    setLinkError('');
    if (value.trim()) {
      const platform = detectPlatform(value);
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform(null);
    }
  };

  /* ----- 当前 Tab 是否已有可用视频 ----- */
  const hasVideo =
    (activeTab === 'library' && !!selectedMaterial) ||
    (activeTab === 'upload' && !!uploadedUrl) ||
    (activeTab === 'link' && !!linkUrl);

  /* ----- 是否为素材库来源（仅有字幕与语法分析数据） ----- */
  const isLibrarySource = activeTab === 'library' && !!selectedMaterial;

  /* ----- 保存为作品 ----- */
  const handleSave = async () => {
    let materialId: number | undefined;
    let title = '';
    if (activeTab === 'library' && selectedMaterial) {
      materialId = selectedMaterial.id;
      title = selectedMaterial.title;
    } else if (activeTab === 'upload' && uploadedFile) {
      title = uploadedFile.name;
    } else if (activeTab === 'link' && linkUrl) {
      title = linkUrl;
    } else {
      return;
    }
    setSaving(true);
    try {
      await api.post<{ success: boolean }>('/works', { type: 'video', materialId, title });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // 静默失败
    } finally {
      setSaving(false);
    }
  };

  /* ----- 渲染视频播放器 ----- */
  const renderVideoPlayer = () => {
    // 上传的视频用 <video> 播放
    if (activeTab === 'upload' && uploadedUrl) {
      return (
        <video
          src={uploadedUrl}
          controls
          className="w-full h-full object-contain bg-black"
        />
      );
    }
    // 素材库 / 粘贴链接用 iframe 嵌入
    let src = '';
    if (activeTab === 'library' && selectedMaterial) src = selectedMaterial.videoUrl;
    else if (activeTab === 'link' && linkUrl) src = toEmbedUrl(linkUrl);
    if (!src) return null;

    // 不支持嵌入的平台，显示跳转提示
    if (activeTab === 'link' && linkUrl && !isEmbeddable(linkUrl)) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-night-50 text-center px-6">
          <span className="text-4xl mb-4">{detectedPlatform?.icon || '🎬'}</span>
          <p className="text-moon text-lg font-medium mb-2">{detectedPlatform?.name} 视频</p>
          <p className="text-moon-dim text-sm mb-5">该平台暂不支持站内嵌入播放</p>
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow px-5 py-2 text-sm flex items-center gap-2"
          >
            <ExternalLink size={15} /> 新窗口打开观看
          </a>
        </div>
      );
    }

    return (
      <iframe
        src={src}
        title="video-player"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  return (
    <div className="page-enter space-y-8">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-serif text-3xl font-bold text-moon">视频创作</h1>
        <p className="text-moon-dim mt-1 text-sm">
          看视频学日语 · 中日双语字幕 + 片假名注音 + 深度语法分析
        </p>
      </motion.div>

      {/* ===== 1. 素材选择区 ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-4"
      >
        {/* Tab 切换 */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-emerald/15 text-emerald border border-emerald/30'
                    : 'text-moon-dim hover:text-moon border border-transparent hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab 内容 */}
        <div className="glass-card p-5">
          {/* 素材库 */}
          {activeTab === 'library' && (
            <>
              {/* ===== 我的收藏（视频创作素材区）===== */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark size={18} className="text-emerald" />
                  <h3 className="font-serif text-base font-semibold text-moon">我的收藏</h3>
                  <span className="text-xs text-moon-dim">
                    ({savedVideos.length} 个视频)
                  </span>
                </div>

                {/* 分类筛选 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setSelectedCategory('全部')}
                    className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                      selectedCategory === '全部'
                        ? 'bg-emerald/15 text-emerald border-emerald/40'
                        : 'text-moon-dim border-white/10 hover:text-moon hover:border-white/20'
                    }`}
                  >
                    <FolderOpen size={12} /> 全部
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                        selectedCategory === c
                          ? 'bg-emerald/15 text-emerald border-emerald/40'
                          : 'text-moon-dim border-white/10 hover:text-moon hover:border-white/20'
                      }`}
                    >
                      <Folder size={12} /> {c}
                    </button>
                  ))}
                </div>

                {/* 收藏视频列表 */}
                {savedVideos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-moon-dim border border-dashed border-white/10 rounded-xl">
                    <Bookmark size={28} className="mb-2 opacity-30" />
                    <p className="text-sm">还没有收藏的视频</p>
                    <p className="text-xs mt-1">在「粘贴链接」中粘贴视频链接即可保存到此处</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedVideos
                      .filter((v) => selectedCategory === '全部' || v.category === selectedCategory)
                      .map((v) => (
                        <div
                          key={v.id}
                          className="glass-card overflow-hidden group transition-all hover:border-emerald/40"
                        >
                          {/* 顶部播放区 */}
                          <div
                            onClick={() => handlePlaySaved(v)}
                            className="relative h-28 bg-gradient-to-br from-emerald/10 to-night-50 cursor-pointer flex items-center justify-center"
                          >
                            <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform">
                              {v.platformIcon}
                            </span>
                            <span
                              className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-night/70 text-moon border border-white/10"
                            >
                              {v.platform}
                            </span>
                            <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald/15 text-emerald border border-emerald/20">
                              {v.category}
                            </span>
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="w-10 h-10 rounded-full bg-emerald/90 flex items-center justify-center">
                                <Play size={18} className="text-night ml-0.5" />
                              </span>
                            </span>
                          </div>
                          {/* 信息 */}
                          <div className="p-3 space-y-1.5">
                            <h4 className="font-serif text-sm font-semibold text-moon line-clamp-1">
                              {v.title}
                            </h4>
                            <p className="text-xs text-moon-dim line-clamp-1">
                              来源：{v.url.length > 40 ? v.url.slice(0, 40) + '...' : v.url}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-moon-dim">
                                {formatDate(v.createdAt)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSaved(v.id);
                                }}
                                className="text-moon-dim hover:text-red-400 transition-colors"
                                title="删除收藏"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* 分隔线 */}
              <div className="border-t border-white/5 my-5" />

              {/* 平台素材库标题 */}
              <div className="flex items-center gap-2 mb-3">
                <Library size={18} className="text-emerald" />
                <h3 className="font-serif text-base font-semibold text-moon">平台素材库</h3>
              </div>

              {materialsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card overflow-hidden">
                      <div className="skeleton h-36 w-full !rounded-none" />
                      <div className="p-3 space-y-2">
                        <div className="skeleton h-4 w-3/4" />
                        <div className="skeleton h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-moon-dim">
                  <Film size={40} className="mb-3 opacity-30" />
                  <p>暂无视频素材</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((m) => {
                    const selected = selectedMaterial?.id === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMaterial(m)}
                        className={`glass-card overflow-hidden cursor-pointer group transition-all ${
                          selected ? 'border-emerald/60 ring-1 ring-emerald/30' : ''
                        }`}
                      >
                        {/* 缩略图 */}
                        <div className="relative h-36 bg-gradient-to-br from-emerald/15 to-night-50 overflow-hidden">
                          <img
                            src={m.thumbnail}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-night/70 text-emerald border border-emerald/20">
                            {TYPE_LABELS[m.type] || m.type}
                          </span>
                          {selected && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald flex items-center justify-center">
                              <Check size={14} className="text-night" />
                            </span>
                          )}
                        </div>
                        {/* 信息 */}
                        <div className="p-3 space-y-2">
                          <h3 className="font-serif text-sm font-semibold text-moon group-hover:text-emerald transition-colors line-clamp-1">
                            {m.title}
                          </h3>
                          <p className="text-xs text-moon-dim line-clamp-1">{m.source}</p>
                          <div className="flex items-center gap-2 text-xs text-moon-dim">
                            <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald">
                              {m.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {formatDuration(m.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* 上传视频 */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald/20 rounded-xl py-12 cursor-pointer hover:border-emerald/40 hover:bg-emerald/5 transition-all">
                <Upload size={36} className="text-emerald/60 mb-3" />
                <span className="text-moon text-sm">点击上传视频文件</span>
                <span className="text-moon-dim text-xs mt-1">支持 mp4 / webm / mov 等格式</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {uploadedUrl && uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-moon">
                  <Film size={16} className="text-emerald" />
                  <span className="line-clamp-1">{uploadedFile.name}</span>
                  <Check size={16} className="text-emerald ml-auto" />
                </div>
              )}
            </div>
          )}

          {/* 粘贴链接 */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              {/* 平台快捷标签 */}
              <div className="flex flex-wrap gap-2 mb-1">
                {VIDEO_PLATFORMS.map((p) => (
                  <span
                    key={p.name}
                    className="text-xs px-2 py-1 rounded-full border border-white/10 text-moon-dim flex items-center gap-1"
                    style={{ borderColor: detectedPlatform?.name === p.name ? p.color : undefined, color: detectedPlatform?.name === p.name ? p.color : undefined }}
                  >
                    <span>{p.icon}</span> {p.name}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={linkInput}
                  onChange={(e) => handleLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadLink()}
                  placeholder="粘贴 B站 / 抖音 / 小红书 / YouTube / Niconico 等视频链接"
                  className="input-night flex-1"
                />
                <button
                  onClick={handleLoadLink}
                  disabled={!linkInput.trim()}
                  className="btn-glow px-5 py-2 text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Link2 size={15} /> 解析
                </button>
              </div>

              {/* 平台识别提示 */}
              {detectedPlatform && (
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{ background: `${detectedPlatform.color}15`, color: detectedPlatform.color }}
                  >
                    <span>{detectedPlatform.icon}</span> 已识别：{detectedPlatform.name}
                  </span>
                  {isEmbeddable(linkInput) ? (
                    <span className="text-emerald flex items-center gap-1">
                      <Check size={12} /> 支持站内播放
                    </span>
                  ) : (
                    <span className="text-moon-dim">不支持站内播放</span>
                  )}
                </div>
              )}

              {/* 错误提示 */}
              {linkError && (
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <AlertCircle size={14} /> {linkError}
                </div>
              )}

              {/* 已加载提示 */}
              {linkUrl && !linkError && (
                <p className="text-xs text-moon-dim flex items-center gap-1.5">
                  <Check size={13} className="text-emerald" />
                  已加载：{linkUrl.length > 50 ? linkUrl.slice(0, 50) + '...' : linkUrl}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.section>

      {/* ===== 2 ~ 5. 视频播放 + 字幕 + 语法 + 保存 ===== */}
      <AnimatePresence>
        {hasVideo && (
          <motion.div
            ref={videoSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 scroll-mt-6"
          >
            {/* 视频播放区 */}
            <section>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-emerald/10">
                {renderVideoPlayer()}
              </div>
              {selectedMaterial && activeTab === 'library' && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <h2 className="font-serif text-lg text-moon">{selectedMaterial.title}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/10 text-emerald">
                    {selectedMaterial.level}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-moon-dim ml-auto">
                    <Clock size={12} />
                    {formatDuration(selectedMaterial.duration)}
                  </span>
                </div>
              )}
            </section>

            {/* 字幕展示区 */}
            <section className="space-y-3">
              <h3 className="text-moon font-semibold flex items-center gap-2">
                <Play size={16} className="text-emerald" /> 中日双语字幕
              </h3>
              {isLibrarySource && selectedMaterial ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedMaterial.lines.map((line) => {
                    const active = activeLineId === line.id;
                    return (
                      <div
                        key={line.id}
                        onClick={() => setActiveLineId(active ? null : line.id)}
                        className={`glass-card p-4 cursor-pointer transition-all ${
                          active ? 'border-emerald/50 bg-emerald/5' : ''
                        }`}
                      >
                        {/* 片假名注音（小字号绿色，显示在日文上方） */}
                        <p className="text-xs text-emerald mb-1">{line.reading}</p>
                        {/* 日语原文（大字号） */}
                        <p className="text-xl font-serif text-moon leading-snug mb-1">
                          {line.japanese}
                        </p>
                        {/* 罗马音 */}
                        <p className="text-xs text-moon-dim font-mono mb-2">{line.romaji}</p>
                        {/* 中文翻译 */}
                        <p className="text-sm text-moon-dim">{line.chinese}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-card p-8 flex flex-col items-center text-center text-moon-dim">
                  <AlertCircle size={32} className="mb-3 opacity-40" />
                  <p>请选择素材库中的素材以查看语法分析</p>
                </div>
              )}
            </section>

            {/* 深度语法分析区（仅素材库来源） */}
            {isLibrarySource && selectedMaterial && (
              <section className="space-y-3">
                <h3 className="text-moon font-semibold flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald" /> 深度语法分析
                </h3>

                {/* 单词分析面板 */}
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setShowWords((v) => !v)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 text-moon font-medium">
                      <BookOpen size={16} className="text-emerald" />
                      单词分析
                      <span className="text-xs text-moon-dim">
                        ({selectedMaterial.wordAnalysis.length})
                      </span>
                    </span>
                    {showWords ? (
                      <ChevronUp size={18} className="text-moon-dim" />
                    ) : (
                      <ChevronDown size={18} className="text-moon-dim" />
                    )}
                  </button>
                  {showWords && (
                    <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedMaterial.wordAnalysis.map((w, i) => (
                        <div key={i} className="glass-card p-3 space-y-1.5">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-lg font-serif text-moon">{w.word}</span>
                            <span className="text-xs text-emerald">{w.reading}</span>
                          </div>
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-emerald/10 text-emerald">
                            {w.pos}
                          </span>
                          <p className="text-sm text-moon-dim">{w.meaning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 语法分析面板 */}
                <div className="glass-card overflow-hidden">
                  <button
                    onClick={() => setShowGrammar((v) => !v)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <span className="flex items-center gap-2 text-moon font-medium">
                      <Sparkles size={16} className="text-emerald" />
                      语法分析
                      <span className="text-xs text-moon-dim">
                        ({selectedMaterial.grammarAnalysis.length})
                      </span>
                    </span>
                    {showGrammar ? (
                      <ChevronUp size={18} className="text-moon-dim" />
                    ) : (
                      <ChevronDown size={18} className="text-moon-dim" />
                    )}
                  </button>
                  {showGrammar && (
                    <div className="px-4 pb-4 space-y-3">
                      {selectedMaterial.grammarAnalysis.map((g, i) => (
                        <div key={i} className="glass-card p-4">
                          <p className="font-serif text-emerald mb-1">{g.pattern}</p>
                          <p className="text-sm text-moon-dim leading-relaxed">
                            {g.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 保存为作品 */}
            <section className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-glow px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  '保存中...'
                ) : saved ? (
                  <>
                    <Check size={16} /> 已保存
                  </>
                ) : (
                  <>
                    <Save size={16} /> 保存为作品
                  </>
                )}
              </button>
              {saved && (
                <span className="text-sm text-emerald">作品已保存到「我的作品」</span>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 保存到收藏对话框 ===== */}
      <AnimatePresence>
        {showSaveDialog && pendingSaveVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 backdrop-blur-sm p-4"
            onClick={cancelSaveVideo}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-md w-full p-6 space-y-4 relative"
            >
              {/* 关闭按钮 */}
              <button
                onClick={cancelSaveVideo}
                className="absolute top-4 right-4 text-moon-dim hover:text-moon transition-colors"
              >
                <X size={18} />
              </button>

              {/* 标题 */}
              <div className="flex items-center gap-2">
                <Bookmark size={20} className="text-emerald" />
                <h3 className="font-serif text-lg font-semibold text-moon">保存到我的收藏？</h3>
              </div>

              {/* 视频信息预览 */}
              <div className="glass-card p-3 flex items-center gap-3">
                <span className="text-2xl">{pendingSaveVideo.platform?.icon || '🎬'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-moon-dim">来源平台</p>
                  <p className="text-sm text-moon font-medium">
                    {pendingSaveVideo.platform?.name || '未知平台'}
                  </p>
                  <p className="text-xs text-moon-dim line-clamp-1 mt-0.5">
                    {pendingSaveVideo.url.length > 50
                      ? pendingSaveVideo.url.slice(0, 50) + '...'
                      : pendingSaveVideo.url}
                  </p>
                </div>
              </div>

              {/* 题目编辑 */}
              <div className="space-y-1.5">
                <label className="text-xs text-moon-dim flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald" /> 视频题目
                </label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="给这个视频起个名字..."
                  className="input-night w-full"
                  autoFocus
                />
              </div>

              {/* 分类选择 */}
              <div className="space-y-1.5">
                <label className="text-xs text-moon-dim flex items-center gap-1">
                  <Folder size={12} className="text-emerald" /> 选择分类
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDialogCategory(c)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        dialogCategory === c
                          ? 'bg-emerald/15 text-emerald border-emerald/40'
                          : 'text-moon-dim border-white/10 hover:text-moon hover:border-white/20'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNewCategoryInput((v) => !v)}
                    className="text-xs px-3 py-1 rounded-full border border-dashed border-emerald/30 text-emerald hover:bg-emerald/5 transition-all flex items-center gap-1"
                  >
                    + 新建
                  </button>
                </div>

                {/* 新建分类输入 */}
                {showNewCategoryInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      placeholder="输入新分类名"
                      className="input-night flex-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCategory}
                      className="btn-glow px-4 py-1.5 text-xs"
                    >
                      添加
                    </button>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={cancelSaveVideo}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm text-moon-dim border border-white/10 hover:bg-white/5 transition-all"
                >
                  不保存
                </button>
                <button
                  onClick={confirmSaveVideo}
                  className="flex-1 btn-glow px-4 py-2.5 text-sm flex items-center justify-center gap-1.5"
                >
                  <Bookmark size={15} /> 保存到素材区
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
