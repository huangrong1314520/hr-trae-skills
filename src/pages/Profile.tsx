import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, LANG_CONFIG } from '@/utils/api';
import { Edit2, Save, X, User, Mic, Languages, Pencil } from 'lucide-react';

// 支持的语言列表（顺序：日/韩/泰/英/粤/西）
const SUPPORTED_LANGS = ['ja', 'ko', 'th', 'en', 'yue', 'es'];

interface UserProfile {
  id: number;
  username: string;
  bio: string;
  nativeLanguage: string;
  createdAt: string;
}

// 安全地从 localStorage 读取数组长度
function readListLength(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  // 作品数量统计（从 localStorage 读取）
  const [dubCount, setDubCount] = useState(0);
  const [transCount, setTransCount] = useState(0);
  const [handCount, setHandCount] = useState(0);

  // 获取用户信息与作品数量
  useEffect(() => {
    api
      .get<{ success: boolean; data: UserProfile }>('/users/profile')
      .then((res) => {
        if (res.success) {
          setProfile(res.data);
          setEditName(res.data.username || '');
          setEditBio(res.data.bio || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // 从 localStorage 读取作品数量
    setDubCount(readListLength('mock-dub-works'));
    setTransCount(readListLength('mock-translations'));
    setHandCount(readListLength('mock-handwriting'));
  }, []);

  // 保存资料
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put('/users/profile', { username: editName, bio: editBio });
      setProfile({ ...profile, username: editName, bio: editBio });
      setEditing(false);
    } catch {
      // 静默失败
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-enter space-y-8">
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full skeleton" />
            <div className="space-y-2">
              <div className="skeleton h-6 w-32" />
              <div className="skeleton h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-enter">
        <div className="glass-card p-12 text-center text-moon-dim">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>无法加载用户信息</p>
        </div>
      </div>
    );
  }

  // 统计卡片
  const stats = [
    { label: '配音作品', value: dubCount, icon: Mic },
    { label: '翻译作品', value: transCount, icon: Languages },
    { label: '手写作品', value: handCount, icon: Pencil },
  ];

  return (
    <div className="page-enter space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-moon">个人中心</h1>
        <p className="text-moon-dim mt-1 text-sm">管理你的创作档案</p>
      </div>

      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald/20 flex items-center justify-center text-emerald text-2xl font-bold shrink-0">
            {profile.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {editing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="用户名"
                  className="input-night !py-1.5 !px-3 text-lg font-bold max-w-[200px]"
                />
              ) : (
                <h2 className="text-xl font-bold text-moon">{profile.username}</h2>
              )}
              {!editing && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditName(profile.username);
                    setEditBio(profile.bio || '');
                  }}
                  className="p-1.5 rounded-lg hover:bg-emerald/10 text-moon-dim hover:text-emerald transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {editing ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="介绍一下自己..."
                  rows={3}
                  className="input-night resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-glow px-4 py-1.5 text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" /> {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 text-xs text-moon-dim hover:text-moon transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> 取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-moon mt-2">{profile.bio || '暂无简介'}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 作品统计 */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-moon">作品统计</h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="glass-card p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <s.icon className="w-5 h-5 text-emerald" />
              </div>
              <p className="text-2xl font-bold text-moon">{s.value}</p>
              <p className="text-xs text-moon-dim mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 语言列表 */}
      <section className="glass-card p-6">
        <h3 className="text-lg font-bold text-moon mb-4">学习语言</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SUPPORTED_LANGS.map((lang) => {
            const config = LANG_CONFIG[lang];
            if (!config) return null;
            const isActive = config.active;
            return (
              <div
                key={lang}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isActive
                    ? 'bg-emerald/10 border-emerald/30'
                    : 'bg-white/5 border-white/10 opacity-70'
                }`}
              >
                <span className="text-2xl">{config.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-moon truncate">{config.name}</p>
                  <span
                    className={`text-xs ${isActive ? 'text-emerald' : 'text-moon-dim'}`}
                  >
                    {isActive ? '学习中' : '即将开放'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
