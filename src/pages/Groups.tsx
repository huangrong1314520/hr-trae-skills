import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, LANG_CONFIG } from '@/utils/api';
import { Users, ArrowRight } from 'lucide-react';

interface Group {
  id: number;
  language: string;
  name: string;
  description: string;
  memberCount: number;
  coverImage: string | null;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get<{ success: boolean; data: Group[] }>('/groups')
      .then((res) => {
        if (res.success) setGroups(res.data);
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-moon">语种群组</h1>
        <p className="text-moon-dim mt-1 text-sm">加入群组，和语伴一起学习</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="h-10 w-10 rounded-xl skeleton" />
              <div className="h-5 w-32 skeleton" />
              <div className="h-4 w-full skeleton" />
              <div className="h-4 w-20 skeleton" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card p-12 text-center text-moon-dim">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p>暂无群组</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const cfg = LANG_CONFIG[group.language];
            return (
              <div
                key={group.id}
                className="glass-card p-6 flex flex-col hover:border-emerald/30 transition-all duration-200 group cursor-pointer"
                onClick={() => navigate(`/groups/${group.language}`)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: cfg?.color ? `${cfg.color}20` : 'rgba(240,160,80,0.1)' }}
                >
                  {cfg?.emoji || '🌐'}
                </div>

                <h3 className="text-lg font-bold text-moon mb-2">{group.name}</h3>
                <p className="text-sm text-moon-dim flex-1 mb-4 line-clamp-2">{group.description}</p>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-moon-dim">
                    <Users size={14} />
                    {group.memberCount} 位成员
                  </span>
                  <button className="flex items-center gap-1 text-sm text-emerald group-hover:gap-2 transition-all duration-200">
                    进入群组 <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}