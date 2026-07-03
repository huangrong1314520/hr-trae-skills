import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft, Globe, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/hooks/useStore';
import { api, LANG_CONFIG } from '@/utils/api';

interface RegisterResponse {
  user: any;
  token: string;
}

const LANG_OPTIONS = Object.entries(LANG_CONFIG);

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [learningLanguages, setLearningLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const toggleLearningLang = (code: string) => {
    setLearningLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password || !nativeLanguage) {
      setError('请填写所有必填字段');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为 6 位');
      return;
    }

    if (learningLanguages.length === 0) {
      setError('请至少选择一门学习语言');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post<RegisterResponse>('/auth/register', {
        username: username.trim(),
        email: email.trim(),
        password,
        nativeLanguage,
        learningLanguages,
        bio: bio.trim() || undefined,
      });
      setAuth(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-night" />
      <div className="relative z-10 w-full max-w-md px-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-moon-dim hover:text-moon transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-5xl font-bold text-emerald mb-2">言夜</h1>
            <p className="text-moon-dim">创建你的语言学习账号</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon" htmlFor="username">
                用户名 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-dim" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-night pl-11"
                  placeholder="你的用户名"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon" htmlFor="email">
                邮箱 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-dim" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-night pl-11"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon" htmlFor="password">
                密码 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-dim" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-night pl-11"
                  placeholder="至少 6 位密码"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon" htmlFor="confirmPassword">
                确认密码 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-dim" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-night pl-11"
                  placeholder="再次输入密码"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon" htmlFor="nativeLanguage">
                <Globe className="inline w-4 h-4 mr-1 text-moon-dim" />
                母语 <span className="text-red-400">*</span>
              </label>
              <select
                id="nativeLanguage"
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="input-night"
                required
              >
                <option value="" disabled>请选择你的母语</option>
                {LANG_OPTIONS.map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.emoji} {config.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon">
                <Globe className="inline w-4 h-4 mr-1 text-moon-dim" />
                学习语言 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LANG_OPTIONS.map(([code, config]) => {
                  const isChecked = learningLanguages.includes(code);
                  return (
                    <label
                      key={code}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm
                        ${isChecked
                          ? 'border-emerald/50 bg-emerald/10 text-moon'
                          : 'border-white/5 bg-white/5 text-moon-dim hover:border-white/10 hover:text-moon'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLearningLang(code)}
                        className="sr-only"
                      />
                      <span>{config.emoji} {config.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-moon" htmlFor="bio">
                <MessageSquare className="inline w-4 h-4 mr-1 text-moon-dim" />
                个人简介
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-night h-20 resize-none"
                placeholder="介绍一下自己吧……"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-night/30 border-t-night rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  注册
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-moon-dim">
            <span>已有账号？</span>{' '}
            <Link to="/login" className="text-emerald hover:underline font-medium">
              登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}