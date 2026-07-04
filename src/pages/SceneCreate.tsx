import { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
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
      </div>
    </div>
  );
}
