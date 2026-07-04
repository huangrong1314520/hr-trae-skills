import { useState, useEffect, useRef, useCallback } from 'react';
import { api, LANG_CONFIG } from '@/utils/api';
import { Eraser, RotateCcw, Check, Palette, ArrowLeft, Trash2 } from 'lucide-react';

interface Char {
  id: number;
  character: string;
  romaji: string;
  meaning: string;
}

interface HandwritingWork {
  id: number;
  characterText: string;
  imageUrl: string;
  user?: { username: string };
  createdAt?: string;
}

const WRITE_LANGS = ['ja', 'ko', 'th'];

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export default function Write() {
  const [activeLang, setActiveLang] = useState('ja');
  const [chars, setChars] = useState<Char[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState<Char | null>(null);
  const [works, setWorks] = useState<HandwritingWork[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  // Drawing state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [penColor, setPenColor] = useState('#e8e4dc');
  const [penWidth] = useState(3);
  const [isErasing, setIsErasing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setLoading(true);
    api.get<{ success: boolean; data: Char[] }>(`/handwriting/chars?lang=${activeLang}`)
      .then((res) => {
        if (res.success) setChars(res.data);
      })
      .catch(() => setChars([]))
      .finally(() => setLoading(false));
  }, [activeLang]);

  useEffect(() => {
    setWorksLoading(true);
    api.get<{ success: boolean; data: HandwritingWork[] }>(`/handwriting/works?lang=${activeLang}`)
      .then((res) => {
        if (res.success) setWorks(res.data);
      })
      .catch(() => setWorks([]))
      .finally(() => setWorksLoading(false));
  }, [activeLang]);

  useEffect(() => {
    if (selectedChar && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, [selectedChar]);

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // 鼠标事件（桌面端）
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedChar) return;
    e.preventDefault();
    const point = getCanvasPoint(e.clientX, e.clientY);
    const color = isErasing ? '#0f0f1a' : penColor;
    const width = isErasing ? 20 : penWidth;
    setCurrentStroke({ points: [point], color, width });
  }, [selectedChar, isErasing, penColor, penWidth, getCanvasPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentStroke) return;
    e.preventDefault();
    const point = getCanvasPoint(e.clientX, e.clientY);
    setCurrentStroke((prev) => prev ? { ...prev, points: [...prev.points, point] } : null);
  }, [currentStroke, getCanvasPoint]);

  const handleMouseUp = useCallback(() => {
    if (!currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
  }, [currentStroke]);

  // 触摸事件（移动端）
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!selectedChar) return;
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    const color = isErasing ? '#0f0f1a' : penColor;
    const width = isErasing ? 20 : penWidth;
    setCurrentStroke({ points: [point], color, width });
  }, [selectedChar, isErasing, penColor, penWidth, getCanvasPoint]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!currentStroke) return;
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    setCurrentStroke((prev) => prev ? { ...prev, points: [...prev.points, point] } : null);
  }, [currentStroke, getCanvasPoint]);

  const handleTouchEnd = useCallback(() => {
    if (!currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
  }, [currentStroke]);

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!selectedChar) return;
    const svg = buildSvgString();
    try {
      await api.post('/handwriting/works', {
        characterText: selectedChar.character,
        imageUrl: svg,
      });
      setStrokes([]);
      setCurrentStroke(null);
      setSelectedChar(null);
      // Refresh works
      const res = await api.get<{ success: boolean; data: HandwritingWork[] }>(`/handwriting/works?lang=${activeLang}`);
      if (res.success) setWorks(res.data);
    } catch {
      // silently fail
    }
  };

  const buildSvgString = () => {
    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;
    const paths = allStrokes.map((s) => {
      if (s.points.length === 0) return '';
      const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).filter(Boolean).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize.width}" height="${canvasSize.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">${paths}</svg>`;
  };

  return (
    <div className="page-enter space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-moon">手写练习室</h1>
        <p className="text-moon-dim mt-1 text-sm">练习书写，感受文字之美</p>
      </div>

      {/* Language Tabs */}
      <div className="flex gap-2">
        {WRITE_LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => { setActiveLang(lang); setSelectedChar(null); }}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeLang === lang
                ? 'bg-emerald/15 text-emerald border border-emerald/20'
                : 'text-moon-dim hover:text-moon hover:bg-emerald/5'
            }`}
          >
            {LANG_CONFIG[lang]?.emoji} {LANG_CONFIG[lang]?.name}
          </button>
        ))}
      </div>

      {/* Practice Mode or Character Grid */}
      {selectedChar ? (
        <div className="glass-card p-6 space-y-4">
          <button
            onClick={() => { setSelectedChar(null); setStrokes([]); setCurrentStroke(null); }}
            className="flex items-center gap-1 text-moon-dim hover:text-moon transition-colors text-sm"
          >
            <ArrowLeft size={16} /> 返回
          </button>

          <div className="flex items-center gap-4">
            <div className="text-8xl font-serif text-moon/30 select-none leading-none">
              {selectedChar.character}
            </div>
            <div>
              <p className="text-lg text-moon">{selectedChar.romaji}</p>
              <p className="text-sm text-moon-dim">{selectedChar.meaning}</p>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="relative w-full aspect-[4/3] rounded-xl bg-night/60 border border-emerald/10 cursor-crosshair overflow-hidden touch-none select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${canvasSize.width || 400} ${canvasSize.height || 300}`}
            >
              {strokes.map((s, i) => (
                <path
                  key={i}
                  d={s.points.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentStroke && currentStroke.points.length > 0 && (
                <path
                  d={currentStroke.points.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-moon-dim">颜色</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => { setPenColor(e.target.value); setIsErasing(false); }}
                className="w-8 h-8 rounded-lg border border-emerald/20 bg-transparent cursor-pointer"
              />
            </div>
            <button
              onClick={() => setIsErasing(!isErasing)}
              className={`p-2 rounded-lg transition-colors ${isErasing ? 'bg-emerald/20 text-emerald' : 'text-moon-dim hover:text-moon hover:bg-emerald/5'}`}
              title="橡皮擦"
            >
              <Eraser size={18} />
            </button>
            <button
              onClick={handleUndo}
              className="p-2 rounded-lg text-moon-dim hover:text-moon hover:bg-emerald/5 transition-colors"
              title="撤销"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-moon-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="清除"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex-1" />
            <button onClick={handleSave} className="btn-glow px-6 py-2 text-sm flex items-center gap-2">
              <Check size={16} /> 完成
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Character Grid */}
          {loading ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl skeleton" />
              ))}
            </div>
          ) : chars.length === 0 ? (
            <div className="glass-card p-12 text-center text-moon-dim">
              <p>暂无字符数据</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {chars.map((char) => (
                <button
                  key={char.id}
                  onClick={() => { setSelectedChar(char); setStrokes([]); setCurrentStroke(null); }}
                  className="aspect-square rounded-xl glass-card flex flex-col items-center justify-center hover:border-emerald/40 transition-all duration-200 group"
                >
                  <span className="text-2xl font-serif text-moon group-hover:text-emerald transition-colors">
                    {char.character}
                  </span>
                  <span className="text-xs text-moon-dim mt-1">{char.romaji}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Gallery */}
      <div>
        <h2 className="text-lg font-bold text-moon mb-4">作品展示</h2>
        {worksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" />
            ))}
          </div>
        ) : works.length === 0 ? (
          <div className="glass-card p-8 text-center text-moon-dim text-sm">
            暂无作品，快去练习吧
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {works.map((work) => (
              <div key={work.id} className="glass-card p-3 space-y-2">
                <div
                  className="aspect-square rounded-lg bg-night/40 flex items-center justify-center overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: work.imageUrl }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-moon-dim">{work.characterText}</span>
                  {work.user && (
                    <span className="text-xs text-moon-dim">{work.user.username}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}