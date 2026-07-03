import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { ArrowLeft, BookOpen, Languages, Headphones, Mic, Check, Play, Volume2 } from 'lucide-react';

interface UnitItem {
  id: number;
  type: 'vocab' | 'grammar' | 'listening' | 'speaking';
  content: unknown;
  answer?: string;
  options?: string[];
}

interface Unit {
  id: number;
  title: string;
}

interface UnitDetailResponse {
  success: boolean;
  data: {
    unit: Unit;
    items: UnitItem[];
  };
}

const STEPS = [
  { key: 'vocab', label: '词汇', icon: BookOpen },
  { key: 'grammar', label: '语法', icon: Languages },
  { key: 'listening', label: '听力', icon: Headphones },
  { key: 'speaking', label: '口语', icon: Mic },
];

function SkeletonContent() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { lang, level, unit } = useParams<{ lang: string; level: string; unit: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [unitData, setUnitData] = useState<UnitDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedScore, setRecordedScore] = useState<number | null>(null);

  const unitId = unit || '1';

  useEffect(() => {
    setLoading(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setSelectedAnswer(null);
    setRecordedScore(null);

    // 先获取课程列表，根据 lang+level 找到课程 ID
    api
      .get<{ success: boolean; data: { id: number; language: string; level: string }[] }>(
        `/courses?lang=${lang}&level=${level}`
      )
      .then((res) => {
        if (res.success && res.data.length > 0) {
          const courseId = res.data[0].id;
          return api.get<UnitDetailResponse>(`/courses/${courseId}/units/${unitId}`);
        }
        throw new Error('课程不存在');
      })
      .then((res) => {
        if (res?.success) {
          setUnitData(res.data);
        }
      })
      .catch(() => {
        setUnitData(null);
      })
      .finally(() => setLoading(false));
  }, [lang, level, unitId]);

  const currentItem = unitData?.items[currentStep];
  const totalSteps = unitData?.items.length || 4;

  const handleCompleteStep = () => {
    const nextStep = new Set(completedSteps);
    nextStep.add(currentStep);
    setCompletedSteps(nextStep);

    if (unitData && currentItem) {
      api.post('/progress', {
        unitId: unitData.unit.id,
        type: currentItem.type,
        completed: true,
        score: recordedScore ?? undefined,
      }).catch(() => {});
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedAnswer(null);
      setRecordedScore(null);
    }
  };

  const renderVocabContent = () => {
    const content = currentItem?.content as { term?: string; meaning?: string; examples?: string[] } | undefined;
    if (!content) return <p className="text-moon-dim">暂无词汇内容</p>;
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 text-center">
          <p className="font-serif text-3xl font-bold text-amber mb-2">{content.term || '—'}</p>
          <p className="text-moon text-lg">{content.meaning || '—'}</p>
        </div>
        {content.examples && content.examples.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-moon-dim font-medium">例句</p>
            {content.examples.map((ex, i) => (
              <div key={i} className="glass-card p-3 text-sm text-moon-dim">
                {ex}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGrammarContent = () => {
    const content = currentItem?.content as { explanation?: string; examples?: string[] } | undefined;
    if (!content) return <p className="text-moon-dim">暂无语法内容</p>;
    return (
      <div className="space-y-4">
        <div className="glass-card p-5">
          <p className="text-moon leading-relaxed">{content.explanation || '—'}</p>
        </div>
        {content.examples && content.examples.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-moon-dim font-medium">例句</p>
            {content.examples.map((ex, i) => (
              <div key={i} className="glass-card p-3 text-sm text-moon-dim">
                {ex}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderListeningContent = () => {
    const content = currentItem?.content as { sentence?: string } | undefined;
    const options = currentItem?.options || [];
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 text-center space-y-4">
          <button
            className="mx-auto w-14 h-14 rounded-full bg-amber/15 flex items-center justify-center text-amber hover:bg-amber/25 transition-colors"
            onClick={() => {}}
          >
            <Volume2 size={24} />
          </button>
          <p className="font-serif text-2xl text-moon">{content?.sentence || '—'}</p>
        </div>
        {options.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-moon-dim font-medium">选择正确答案</p>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedAnswer(opt)}
                className={`w-full text-left glass-card p-4 transition-all duration-200
                  ${selectedAnswer === opt
                    ? 'border-amber/50 bg-amber/10 text-amber'
                    : 'hover:border-amber/20 text-moon-dim'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSpeakingContent = () => {
    const content = currentItem?.content as { sentence?: string } | undefined;
    const handleRecord = () => {
      if (isRecording) {
        setIsRecording(false);
        const score = Math.floor(Math.random() * 36) + 60;
        setRecordedScore(score);
      } else {
        setIsRecording(true);
        setRecordedScore(null);
      }
    };

    return (
      <div className="space-y-8">
        <div className="glass-card p-8 text-center space-y-6">
          <p className="font-serif text-2xl text-moon">{content?.sentence || '—'}</p>

          <button
            onClick={handleRecord}
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${isRecording
                ? 'bg-red-500/20 text-red-400 recording-pulse'
                : 'bg-amber/15 text-amber hover:bg-amber/25'
              }`}
          >
            <Mic size={32} />
          </button>
          <p className="text-sm text-moon-dim">
            {isRecording ? '正在录音...' : '点击开始录音'}
          </p>

          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-amber/60 rounded-full animate-float"
                  style={{
                    height: `${Math.random() * 32 + 4}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {recordedScore !== null && (
          <div className="glass-card p-5 space-y-3">
            <p className="text-sm text-moon-dim font-medium">发音评分</p>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    recordedScore >= 80 ? 'bg-celadon' : recordedScore >= 60 ? 'bg-amber' : 'bg-sakura'
                  }`}
                  style={{ width: `${recordedScore}%` }}
                />
              </div>
              <span className="font-mono text-lg font-bold text-moon">{recordedScore}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!currentItem) return <p className="text-moon-dim">暂无学习内容</p>;
    switch (currentItem.type) {
      case 'vocab':
        return renderVocabContent();
      case 'grammar':
        return renderGrammarContent();
      case 'listening':
        return renderListeningContent();
      case 'speaking':
        return renderSpeakingContent();
      default:
        return <p className="text-moon-dim">未知内容类型</p>;
    }
  };

  return (
    <div className="page-enter space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/courses')}
          className="p-2 rounded-lg hover:bg-amber/10 text-moon-dim hover:text-moon transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-bold text-moon">
            {unitData?.unit?.title || '加载中...'}
          </h1>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isCompleted = completedSteps.has(i);
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => {
                  if (isCompleted || i < currentStep) {
                    setCurrentStep(i);
                    setSelectedAnswer(null);
                    setRecordedScore(null);
                  }
                }}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all flex-1
                  ${isActive
                    ? 'text-amber bg-amber/10'
                    : isCompleted
                      ? 'text-celadon hover:bg-white/5'
                      : 'text-moon-dim'
                  }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {isCompleted && (
                    <Check size={10} className="absolute -top-1 -right-1 text-celadon" />
                  )}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded-full ${
                    completedSteps.has(i) ? 'bg-celadon/50' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <SkeletonContent />
      ) : (
        <div className="glass-card p-6">{renderContent()}</div>
      )}

      {/* Complete Button */}
      {!loading && currentItem && (
        <div className="flex justify-end">
          <button
            onClick={handleCompleteStep}
            className="btn-glow px-8 py-2.5 flex items-center gap-2"
          >
            <Play size={16} />
            <span>{currentStep < totalSteps - 1 ? '完成，下一步' : '完成'}</span>
          </button>
        </div>
      )}
    </div>
  );
}