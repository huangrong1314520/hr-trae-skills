import { useState, useEffect } from 'react';
import { api, LANG_CONFIG } from '@/utils/api';
import { Heart, ChevronDown, ChevronUp, RefreshCw, Send } from 'lucide-react';

interface DailyTask {
  id: number;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  sourceInfo: string;
  referenceTranslation: string;
}

interface CommunityTranslation {
  id: number;
  sourceText: string;
  translation: string;
  referenceTranslation?: string;
  sourceInfo?: string;
  sourceLang?: string;
  targetLang?: string;
  user?: { id: number; username: string; avatarUrl: string | null };
  likesCount: number;
  liked?: boolean;
}

export default function Translate() {
  const [activeTab, setActiveTab] = useState<'daily' | 'community'>('daily');
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [userTranslation, setUserTranslation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Community tab
  const [communityLang, setCommunityLang] = useState('ja');
  const [translations, setTranslations] = useState<CommunityTranslation[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchDaily = async () => {
    setDailyLoading(true);
    setSubmitted(false);
    setUserTranslation('');
    setShowReference(false);
    try {
      const res = await api.get<{ success: boolean; data: DailyTask }>('/translate/daily');
      if (res.success) setDailyTask(res.data);
    } catch {
      setDailyTask(null);
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, []);

  useEffect(() => {
    if (activeTab === 'community') {
      setCommunityLoading(true);
      api.get<{ success: boolean; data: CommunityTranslation[] }>(`/translate/community?lang=${communityLang}`)
        .then((res) => {
          if (res.success) setTranslations(res.data);
        })
        .catch(() => setTranslations([]))
        .finally(() => setCommunityLoading(false));
    }
  }, [activeTab, communityLang]);

  const handleSubmit = async () => {
    if (!userTranslation.trim() || !dailyTask) return;
    setSubmitting(true);
    try {
      await api.post('/translate/submit', {
        dailyId: dailyTask.id,
        translation: userTranslation,
      });
      setSubmitted(true);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await api.post(`/translate/community/${id}/like`);
      setTranslations((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, likesCount: t.liked ? t.likesCount - 1 : t.likesCount + 1, liked: !t.liked } : t
        )
      );
    } catch {
      // silently fail
    }
  };

  const COMMUNITY_LANGS = ['en', 'ja', 'ko', 'th', 'yue'];

  return (
    <div className="page-enter space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-moon">翻译卡片</h1>
        <p className="text-moon-dim mt-1 text-sm">每日一译，精进语言能力</p>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'daily'
              ? 'bg-amber/15 text-amber border border-amber/20'
              : 'text-moon-dim hover:text-moon hover:bg-amber/5'
          }`}
        >
          每日翻译
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'community'
              ? 'bg-amber/15 text-amber border border-amber/20'
              : 'text-moon-dim hover:text-moon hover:bg-amber/5'
          }`}
        >
          社区互评
        </button>
      </div>

      {/* Daily Translation Tab */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {dailyLoading ? (
            <div className="glass-card p-8 space-y-4">
              <div className="h-8 w-32 skeleton" />
              <div className="h-24 w-full skeleton" />
              <div className="h-32 w-full skeleton" />
            </div>
          ) : dailyTask ? (
            <>
              {/* Source Text Card */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber/10 text-amber border border-amber/20">
                    {LANG_CONFIG[dailyTask.sourceLang]?.emoji} {LANG_CONFIG[dailyTask.sourceLang]?.name}
                    {' → '}
                    {LANG_CONFIG[dailyTask.targetLang]?.emoji} {LANG_CONFIG[dailyTask.targetLang]?.name}
                  </span>
                </div>
                <p className="text-2xl font-serif text-moon leading-relaxed">{dailyTask.sourceText}</p>
                {dailyTask.sourceInfo && (
                  <p className="text-sm text-moon-dim">—— {dailyTask.sourceInfo}</p>
                )}
              </div>

              {/* Translation Input */}
              {!submitted ? (
                <div className="glass-card p-6 space-y-4">
                  <textarea
                    value={userTranslation}
                    onChange={(e) => setUserTranslation(e.target.value)}
                    placeholder="在此输入你的翻译..."
                    rows={4}
                    className="input-night resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={!userTranslation.trim() || submitting}
                      className="btn-glow px-6 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} /> {submitting ? '提交中...' : '提交翻译'}
                    </button>
                    <button
                      onClick={fetchDaily}
                      className="flex items-center gap-1 text-moon-dim hover:text-moon transition-colors text-sm"
                    >
                      <RefreshCw size={16} /> 换一题
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Submitted Result */}
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        已提交
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-moon-dim mb-1">你的翻译</p>
                      <p className="text-moon">{userTranslation}</p>
                    </div>

                    {/* Reference Translation */}
                    <div>
                      <button
                        onClick={() => setShowReference(!showReference)}
                        className="flex items-center gap-1 text-sm text-amber hover:text-amber/80 transition-colors"
                      >
                        参考译文 {showReference ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {showReference && (
                        <p className="mt-2 p-3 rounded-lg bg-amber/5 border border-amber/10 text-moon text-sm">
                          {dailyTask.referenceTranslation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setActiveTab('community'); setCommunityLang(dailyTask.sourceLang); }}
                      className="btn-glow px-6 py-2 text-sm"
                    >
                      查看社区翻译
                    </button>
                    <button
                      onClick={fetchDaily}
                      className="flex items-center gap-1 text-moon-dim hover:text-moon transition-colors text-sm"
                    >
                      <RefreshCw size={16} /> 换一题
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center text-moon-dim">
              <p>暂无每日翻译任务</p>
              <button onClick={fetchDaily} className="btn-glow px-6 py-2 text-sm mt-4">刷新</button>
            </div>
          )}
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          {/* Language Filter */}
          <div className="flex gap-2 flex-wrap">
            {COMMUNITY_LANGS.map((lang) => (
              <button
                key={lang}
                onClick={() => setCommunityLang(lang)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  communityLang === lang
                    ? 'bg-amber/15 text-amber border border-amber/20'
                    : 'text-moon-dim hover:text-moon hover:bg-amber/5'
                }`}
              >
                {LANG_CONFIG[lang]?.emoji} {LANG_CONFIG[lang]?.name}
              </button>
            ))}
          </div>

          {/* Translations List */}
          {communityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-4 space-y-3">
                  <div className="h-4 w-48 skeleton" />
                  <div className="h-6 w-full skeleton" />
                  <div className="h-4 w-32 skeleton" />
                </div>
              ))}
            </div>
          ) : translations.length === 0 ? (
            <div className="glass-card p-12 text-center text-moon-dim">
              <p>暂无社区翻译</p>
            </div>
          ) : (
            <div className="space-y-3">
              {translations.map((t) => (
                <div
                  key={t.id}
                  className="glass-card p-4 cursor-pointer hover:border-amber/30 transition-all duration-200"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-amber/20 flex items-center justify-center text-amber text-xs font-bold">
                      {t.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-moon">{t.user?.username || '匿名用户'}</span>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(t.id); }}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        t.liked ? 'text-red-400' : 'text-moon-dim hover:text-red-400'
                      }`}
                    >
                      <Heart size={14} fill={t.liked ? 'currentColor' : 'none'} />
                      {t.likesCount}
                    </button>
                  </div>
                  <p className="text-sm text-moon-dim mb-1">
                    原文：<span className="text-moon">{t.sourceText}</span>
                  </p>
                  <p className="text-sm text-moon">{t.translation}</p>

                  {expandedId === t.id && (
                    <div className="mt-3 pt-3 border-t border-amber/10 space-y-2">
                      {t.sourceInfo && (
                        <p className="text-xs text-moon-dim">来源：{t.sourceInfo}</p>
                      )}
                      {t.referenceTranslation && (
                        <div>
                          <p className="text-xs text-moon-dim mb-1">参考译文</p>
                          <p className="text-xs text-moon bg-amber/5 p-2 rounded-lg">{t.referenceTranslation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}