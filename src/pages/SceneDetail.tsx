import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type SceneCourse } from '@/utils/api';
import { speakJa } from '@/utils/jaSpeaker';
import { ArrowLeft, BookOpen, Languages, Volume2, Sparkles } from 'lucide-react';

// 详情骨架屏
function DetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="skeleton h-64 md:h-80 w-full rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SceneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scene, setScene] = useState<SceneCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [speakingExample, setSpeakingExample] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<SceneCourse>(`/scenes/${id}`)
      .then((res) => {
        // 兼容直接返回对象与 { success, data } 包装两种返回结构
        const detail = (res as unknown as { data?: SceneCourse }).data ?? res;
        setScene(detail);
      })
      .catch(() => setScene(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-enter max-w-4xl mx-auto">
        <DetailSkeleton />
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="page-enter max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-emerald/10 text-moon-dim hover:text-moon transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="glass-card p-12 text-center text-moon-dim">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">课程不存在或已下架</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-4xl mx-auto space-y-10">
      {/* 顶部 Banner */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
        {scene.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${scene.imageUrl})` }}
          />
        )}
        {/* 渐变遮罩，底部加深以保证文字可读 */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/20" />

        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-night/40 backdrop-blur text-moon hover:bg-night/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* 标题信息 */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6">
          <div className="flex items-end gap-3">
            <span className="text-5xl leading-none">{scene.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl font-bold text-moon">
                {scene.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald/20 text-emerald">
                  {scene.level}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-moon-dim">
                  Day {scene.day}
                </span>
              </div>
            </div>
          </div>
          <p className="text-moon-dim mt-3 max-w-2xl">{scene.description}</p>
        </div>
      </div>

      {/* 单词学习区 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald" />
          <h2 className="font-serif text-xl font-semibold text-moon">单词学习</h2>
          <span className="text-sm text-moon-dim">({scene.words.length})</span>
        </div>

        {scene.words.length === 0 ? (
          <p className="text-moon-dim text-sm">暂无单词</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scene.words.map((word, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => {
                  setSpeakingExample(null);
                  setSpeakingWord(word.word);
                  speakJa(word.word)
                    .finally(() => setSpeakingWord(null));
                }}
                className={`glass-card p-4 text-left relative group cursor-pointer transition-all duration-200 ${
                  speakingWord === word.word
                    ? 'border-emerald/60 ring-1 ring-emerald/30'
                    : 'hover:border-emerald/40'
                }`}
              >
                <Volume2
                  className={`absolute top-3 right-3 w-4 h-4 transition-all duration-200 pointer-events-none ${
                    speakingWord === word.word
                      ? 'text-emerald animate-pulse'
                      : 'text-moon-dim/40 group-hover:text-emerald'
                  }`}
                />
                {/* 片假名注音 */}
                <p className="text-xs text-emerald mb-1">{word.reading}</p>
                {/* 日语原文 */}
                <p className="font-serif text-2xl font-semibold text-moon">
                  {word.word}
                </p>
                {/* 罗马音 */}
                <p className="text-xs text-moon-dim mt-0.5">{word.romaji}</p>
                {/* 词性标签 */}
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-white/5 text-moon-dim mt-2">
                  {word.pos}
                </span>
                {/* 中文释义 */}
                <p className="text-sm text-moon mt-2">{word.meaning}</p>
                {/* 例句 */}
                {word.example && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-start gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSpeakingWord(null);
                          setSpeakingExample(word.example);
                          speakJa(word.example)
                            .finally(() => setSpeakingExample(null));
                        }}
                        className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          speakingExample === word.example
                            ? 'bg-emerald/15 text-emerald'
                            : 'bg-white/5 text-moon-dim/50 hover:bg-emerald/10 hover:text-emerald'
                        }`}
                        title="朗读例句"
                      >
                        <Volume2 size={13} />
                      </button>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className={`text-xs ${
                          speakingExample === word.example ? 'text-emerald' : 'text-moon-dim'
                        }`}>{word.example}</p>
                        {word.exampleTrans && (
                          <p className="text-xs text-moon-dim/60">{word.exampleTrans}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 语法详解区 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-emerald" />
          <h2 className="font-serif text-xl font-semibold text-moon">语法详解</h2>
        </div>

        {scene.grammars.length === 0 ? (
          <p className="text-moon-dim text-sm">暂无语法</p>
        ) : (
          <div className="space-y-4">
            {scene.grammars.map((grammar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-card p-5 border-l-2 border-emerald"
              >
                {/* 句型 */}
                <p className="font-serif text-xl font-semibold text-emerald">
                  {grammar.pattern}
                </p>
                {/* 语法解释 */}
                <p className="text-sm text-moon-dim mt-2 leading-relaxed">
                  {grammar.explanation}
                </p>
                {/* 例句 */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSpeakingExample(grammar.example);
                        speakJa(grammar.example)
                          .finally(() => setSpeakingExample(null));
                      }}
                      className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        speakingExample === grammar.example
                          ? 'bg-emerald/15 text-emerald'
                          : 'bg-white/5 text-moon-dim hover:bg-emerald/10 hover:text-emerald'
                      }`}
                      title="朗读例句"
                    >
                      <Volume2 size={13} />
                    </button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={`text-sm ${
                        speakingExample === grammar.example ? 'text-emerald' : 'text-moon'
                      }`}>{grammar.example}</p>
                      <p className="text-xs text-moon-dim">{grammar.exampleTrans}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 底部操作区 */}
      <div className="flex justify-center pt-2 pb-4">
        <Link
          to="/create/video"
          className="btn-glow px-8 py-3 flex items-center gap-2"
        >
          <Sparkles size={18} />
          <span>开始创作</span>
        </Link>
      </div>
    </div>
  );
}
