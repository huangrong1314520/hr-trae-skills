import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, LANG_CONFIG, LEVEL_LABELS } from '@/utils/api';
import { Mic, Clock, MessageSquare } from 'lucide-react';

interface DubLine {
  id: number;
  lineIndex: number;
  originalText: string;
  translationText: string;
}

interface DubMaterial {
  id: number;
  language: string;
  title: string;
  source: string;
  coverImage: string | null;
  level: string;
  type: string;
  duration: number;
  lines: DubLine[];
}

interface MaterialsResponse {
  success: boolean;
  data: DubMaterial[];
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

const TYPE_LABELS: Record<string, string> = {
  anime: '动漫',
  drama: '日剧',
  movie: '电影',
};

const langGradientMap: Record<string, string> = {
  en: 'from-indigo-light/30 to-indigo-light/10',
  ja: 'from-sakura/30 to-sakura/10',
  ko: 'from-celadon/30 to-celadon/10',
  th: 'from-teak/30 to-teak/10',
};

const langTextMap: Record<string, string> = {
  en: 'text-indigo-light',
  ja: 'text-sakura',
  ko: 'text-celadon',
  th: 'text-teak',
};

function SkeletonCard() {
  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="skeleton h-40 w-full !rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-14 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function DubMaterials() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('ja');
  const [selectedLevel, setSelectedLevel] = useState('全部');
  const [selectedType, setSelectedType] = useState('全部');
  const [materials, setMaterials] = useState<DubMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const langs = ['en', 'ja', 'ko', 'th'];
  const levels = ['全部', 'beginner', 'intermediate', 'advanced'];
  const types = ['全部', 'anime', 'drama', 'movie'];

  useEffect(() => {
    setLoading(true);
    api
      .get<MaterialsResponse>(`/dub/materials?lang=${selectedLang}`)
      .then((res) => {
        if (res.success) {
          setMaterials(res.data || []);
        }
      })
      .catch(() => {
        setMaterials([]);
      })
      .finally(() => setLoading(false));
  }, [selectedLang]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (selectedLevel !== '全部' && m.level !== selectedLevel) return false;
      if (selectedType !== '全部' && m.type !== selectedType) return false;
      return true;
    });
  }, [materials, selectedLevel, selectedType]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-moon">配音工坊</h1>
        <p className="text-moon-dim">选择素材，开始你的配音之旅</p>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="input-night w-auto min-w-[120px]"
        >
          {levels.map((lv) => (
            <option key={lv} value={lv}>
              {lv === '全部' ? '全部等级' : LEVEL_LABELS[lv] || lv}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="input-night w-auto min-w-[120px]"
        >
          {types.map((tp) => (
            <option key={tp} value={tp}>
              {tp === '全部' ? '全部类型' : TYPE_LABELS[tp] || tp}
            </option>
          ))}
        </select>
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
      {!loading && filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-moon-dim">
          <Mic size={48} className="mb-4 opacity-30" />
          <p className="text-lg">暂无素材</p>
        </div>
      )}

      {/* Materials Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(`/dub/${m.id}`)}
              className="glass-card p-0 overflow-hidden cursor-pointer group"
            >
              {/* Cover Image Placeholder */}
              <div
                className={`h-40 bg-gradient-to-br ${langGradientMap[m.language] || 'from-emerald/30 to-emerald/10'} flex items-center justify-center`}
              >
                <span className="text-5xl opacity-40">
                  {LANG_CONFIG[m.language]?.emoji || '🎬'}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-serif text-lg font-semibold text-moon group-hover:text-emerald transition-colors line-clamp-1">
                  {m.title}
                </h3>
                <p className="text-sm text-moon-dim">{m.source}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      langTextMap[m.language] || 'text-emerald'
                    } border-current/30 bg-current/5`}
                  >
                    {LEVEL_LABELS[m.level] || m.level}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border border-moon-dim/30 text-moon-dim bg-white/5">
                    {TYPE_LABELS[m.type] || m.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-moon-dim pt-1">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {m.lines?.length || 0} 句
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(m.duration || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}