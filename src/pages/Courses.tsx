import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, LANG_CONFIG, LEVEL_LABELS } from '@/utils/api';
import { BookOpen } from 'lucide-react';

interface Course {
  id: number;
  language: string;
  level: string;
  title: string;
  description: string;
  progress: number;
}

interface CoursesResponse {
  success: boolean;
  data: Course[];
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

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-2 w-full" />
      <div className="skeleton h-9 w-28 rounded-full" />
    </div>
  );
}

export default function Courses() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('en');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const langs = ['en', 'ja', 'ko', 'th'];

  useEffect(() => {
    setLoading(true);
    api
      .get<CoursesResponse>('/courses')
      .then((res) => {
        if (res.success) {
          setCourses(res.data || []);
        }
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) => c.language === selectedLang);

  const groupedByLevel = (['beginner', 'intermediate', 'advanced'] as const).reduce(
    (acc, level) => {
      const items = filteredCourses.filter((c) => c.level === level);
      if (items.length > 0) acc[level] = items;
      return acc;
    },
    {} as Record<string, Course[]>,
  );

  const langColorMap: Record<string, string> = {
    en: 'bg-indigo-light',
    ja: 'bg-sakura',
    ko: 'bg-celadon',
    th: 'bg-teak',
  };

  return (
    <div className="page-enter space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold text-moon">课程中心</h1>
        <p className="text-moon-dim">选择语种，开始你的学习之旅</p>
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

      {/* Loading State */}
      {loading && (
        <div className="space-y-8">
          {[1, 2, 3].map((_, gi) => (
            <div key={gi} className="space-y-4">
              <div className="skeleton h-6 w-20" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((_, ci) => (
                  <SkeletonCard key={ci} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-moon-dim">
          <BookOpen size={48} className="mb-4 opacity-30" />
          <p className="text-lg">暂无课程</p>
        </div>
      )}

      {/* Courses by Level */}
      {!loading &&
        Object.entries(groupedByLevel).map(([level, items]) => (
          <div key={level} className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-moon">
              {LEVEL_LABELS[level] || level}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((course) => (
                <div key={course.id} className="glass-card p-5 flex flex-col gap-3">
                  <h3 className="font-serif text-lg font-semibold text-moon">
                    {course.title}
                  </h3>
                  <p className="text-sm text-moon-dim line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-1">
                    <div className="flex items-center justify-between text-xs text-moon-dim mb-1.5">
                      <span>学习进度</span>
                      <span>{Math.round(course.progress * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${langColorMap[selectedLang] || 'bg-emerald'}`}
                        style={{ width: `${Math.round(course.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/courses/${course.language}/${course.level}/1`)
                    }
                    className="btn-glow mt-1 self-start px-6 py-2 text-sm"
                  >
                    {course.progress > 0 ? '继续学习' : '开始学习'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}