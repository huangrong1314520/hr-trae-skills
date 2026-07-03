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

/* ========== 工具函数 ========== */
// 秒数转 mm:ss
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// 将视频链接转换为可嵌入的 URL（支持 YouTube / Bilibili）
function toEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  // 已是 embed 链接
  if (/youtube\.com\/embed\//.test(trimmed)) return trimmed;
  // YouTube 普通链接或短链
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Bilibili 视频
  const biliMatch = trimmed.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (biliMatch) return `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&high_quality=1`;
  return trimmed;
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

  /* ----- 字幕与面板状态 ----- */
  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [showWords, setShowWords] = useState(true);
  const [showGrammar, setShowGrammar] = useState(true);

  /* ----- 保存状态 ----- */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const videoSectionRef = useRef<HTMLDivElement>(null);

  /* ----- 默认加载素材库列表 ----- */
  useEffect(() => {
    setMaterialsLoading(true);
    api
      .get<{ success: boolean; data: VideoMaterial[] }>('/video/materials')
      .then((res) => {
        if (res.success) setMaterials(res.data || []);
      })
      .catch(() => setMaterials([]))
      .finally(() => setMaterialsLoading(false));
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
    if (!linkInput.trim()) return;
    setLinkUrl(linkInput.trim());
    scrollToVideo();
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
              <div className="flex gap-2">
                <input
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="粘贴 YouTube / Bilibili 等视频链接"
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
              {linkUrl && (
                <p className="text-xs text-moon-dim flex items-center gap-1.5">
                  <Check size={13} className="text-emerald" />
                  已加载：{linkUrl}
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
    </div>
  );
}
