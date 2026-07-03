import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, LANG_CONFIG } from '@/utils/api';
import { Users, Heart, MessageCircle, Send, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Group {
  id: number;
  language: string;
  name: string;
  description: string;
  memberCount: number;
}

interface Post {
  id: number;
  user: { id: number; username: string; avatarUrl: string | null };
  content: string;
  attachmentType: string | null;
  attachmentUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface CheckinDay {
  date: string;
  checked: boolean;
}

export default function GroupDetail() {
  const { lang } = useParams<{ lang: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Checkin
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState('');
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinDays, setCheckinDays] = useState<CheckinDay[]>([]);
  const [checkinMonth, setCheckinMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  // New post
  const [newPostContent, setNewPostContent] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Comment
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState('');

  const cfg = lang ? LANG_CONFIG[lang] : null;

  // Fetch group
  useEffect(() => {
    if (!lang) return;
    setGroupLoading(true);
    api.get<{ success: boolean; data: Group }>(`/groups/${lang}`)
      .then((res) => {
        if (res.success) setGroup(res.data);
      })
      .catch(() => setGroup(null))
      .finally(() => setGroupLoading(false));
  }, [lang]);

  // Fetch posts
  const fetchPosts = (pageNum: number) => {
    if (!lang) return;
    setPostsLoading(true);
    api.get<{ success: boolean; data: { posts: Post[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>(`/groups/${lang}/posts?page=${pageNum}`)
      .then((res) => {
        if (res.success) {
          if (pageNum === 1) {
            setPosts(res.data.posts);
          } else {
            setPosts((prev) => [...prev, ...res.data.posts]);
          }
          setHasMore(res.data.pagination && res.data.pagination.page < res.data.pagination.totalPages);
        }
      })
      .catch(() => {
        if (pageNum === 1) setPosts([]);
      })
      .finally(() => setPostsLoading(false));
  };

  useEffect(() => {
    fetchPosts(1);
    setPage(1);
  }, [lang]);

  // Generate checkin calendar
  useEffect(() => {
    const days: CheckinDay[] = [];
    const daysInMonth = new Date(checkinMonth.year, checkinMonth.month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${checkinMonth.year}-${String(checkinMonth.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      // Simulate random checkins for display
      days.push({ date: dateStr, checked: Math.random() > 0.6 });
    }
    setCheckinDays(days);
  }, [checkinMonth]);

  const handleCheckin = async () => {
    if (!lang) return;
    setCheckinSubmitting(true);
    try {
      await api.post(`/groups/${lang}/checkin`, { message: checkinMessage });
      setShowCheckinModal(false);
      setCheckinMessage('');
    } catch {
      // silently fail
    } finally {
      setCheckinSubmitting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!lang || !newPostContent.trim()) return;
    setPostSubmitting(true);
    try {
      await api.post(`/groups/${lang}/posts`, { content: newPostContent });
      setNewPostContent('');
      fetchPosts(1);
      setPage(1);
    } catch {
      // silently fail
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.post(`/groups/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
      );
    } catch {
      // silently fail
    }
  };

  const handleComment = async (postId: number) => {
    if (!commentContent.trim()) return;
    try {
      await api.post(`/groups/posts/${postId}/comment`, { content: commentContent });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
      setCommentingPostId(null);
      setCommentContent('');
    } catch {
      // silently fail
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const prevMonth = () => {
    setCheckinMonth((prev) => {
      if (prev.month === 1) return { year: prev.year - 1, month: 12 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setCheckinMonth((prev) => {
      if (prev.month === 12) return { year: prev.year + 1, month: 1 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  if (groupLoading) {
    return (
      <div className="page-enter space-y-6">
        <div className="glass-card p-6 space-y-4">
          <div className="h-8 w-48 skeleton" />
          <div className="h-4 w-32 skeleton" />
          <div className="h-4 w-full skeleton" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="page-enter">
        <div className="glass-card p-12 text-center text-moon-dim">
          <p>群组不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{cfg?.emoji || '🌐'}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-moon">{group.name}</h1>
            <p className="text-moon-dim text-sm mt-1">{group.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs text-moon-dim">
                <Users size={14} /> {group.memberCount} 位成员
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCheckinModal(true)}
            className="btn-glow px-5 py-2.5 text-sm flex items-center gap-2 shrink-0"
          >
            <Check size={16} /> 今日打卡
          </button>
        </div>
      </div>

      {/* Checkin Calendar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-amber/10 text-moon-dim hover:text-moon transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-moon">
            {checkinMonth.year}年{checkinMonth.month}月
          </span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-amber/10 text-moon-dim hover:text-moon transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
            <div key={d} className="text-center text-xs text-moon-dim py-1">{d}</div>
          ))}
          {checkinDays.map((day, i) => (
            <div
              key={i}
              className={`text-center text-xs py-1.5 rounded-md ${
                day.checked
                  ? 'bg-amber/15 text-amber'
                  : 'text-moon-dim'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* New Post */}
      <div className="glass-card p-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-amber/20 flex items-center justify-center text-amber text-sm font-bold shrink-0">
            {group.name[0]}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="分享你的学习心得..."
              rows={2}
              className="input-night resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || postSubmitting}
                className="btn-glow px-4 py-1.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} /> {postSubmitting ? '发布中...' : '发动态'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Feed */}
      <div className="space-y-4">
        {postsLoading && page === 1 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full skeleton" />
                <div className="h-4 w-20 skeleton" />
              </div>
              <div className="h-16 w-full skeleton" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center text-moon-dim">
            <p>暂无动态，来发第一条吧</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="glass-card p-4 space-y-3">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber/20 flex items-center justify-center text-amber text-sm font-bold">
                    {post.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-moon">{post.user.username}</p>
                    <p className="text-xs text-moon-dim">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-moon leading-relaxed">{post.content}</p>

                {/* Attachment badge */}
                {post.attachmentType && (
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                    {post.attachmentType === 'dub' ? '配音作品' :
                     post.attachmentType === 'writing' ? '手写作品' :
                     post.attachmentType === 'translation' ? '翻译作品' : post.attachmentType}
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-amber/10">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-xs text-moon-dim hover:text-red-400 transition-colors"
                  >
                    <Heart size={14} /> {post.likesCount}
                  </button>
                  <button
                    onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1 text-xs text-moon-dim hover:text-amber transition-colors"
                  >
                    <MessageCircle size={14} /> {post.commentsCount}
                  </button>
                </div>

                {/* Comment input */}
                {commentingPostId === post.id && (
                  <div className="flex gap-2 pt-2">
                    <input
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="写评论..."
                      className="input-night flex-1 py-2 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComment(post.id);
                      }}
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={!commentContent.trim()}
                      className="btn-glow px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      发送
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={postsLoading}
                  className="text-sm text-moon-dim hover:text-amber transition-colors disabled:opacity-50"
                >
                  {postsLoading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Checkin Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-card p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-moon">今日打卡</h3>
            <p className="text-sm text-moon-dim">记录你今天的学习状态</p>
            <textarea
              value={checkinMessage}
              onChange={(e) => setCheckinMessage(e.target.value)}
              placeholder="今天学了什么？"
              rows={3}
              className="input-night resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowCheckinModal(false); setCheckinMessage(''); }}
                className="px-4 py-2 text-sm text-moon-dim hover:text-moon transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCheckin}
                disabled={checkinSubmitting}
                className="btn-glow px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Calendar size={14} /> {checkinSubmitting ? '打卡中...' : '确认打卡'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}