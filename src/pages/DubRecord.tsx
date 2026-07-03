import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/utils/api';
import { ArrowLeft, Mic, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface DubLine {
  id: number;
  lineIndex: number;
  originalText: string;
  translationText: string;
}

interface Material {
  id: number;
  title: string;
  source: string;
  lines: DubLine[];
}

interface MaterialResponse {
  success: boolean;
  data: Material;
}

function SkeletonContent() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-4 w-1/3" />
      <div className="glass-card p-8 space-y-4">
        <div className="skeleton h-10 w-3/4 mx-auto" />
        <div className="skeleton h-6 w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export default function DubRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedScore, setRecordedScore] = useState<number | null>(null);
  const [recordedLines, setRecordedLines] = useState<Set<number>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get<MaterialResponse>(`/dub/materials/${id}`)
      .then((res) => {
        if (res.success) {
          setMaterial(res.data);
        }
      })
      .catch(() => {
        setMaterial(null);
      })
      .finally(() => setLoading(false));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const lines = material?.lines || [];
  const currentLine = lines[currentLineIndex];
  const totalLines = lines.length;

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordedScore(null);
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const score = Math.floor(Math.random() * 36) + 60;
    setRecordedScore(score);
    setRecordedLines((prev) => new Set(prev).add(currentLineIndex));
  }, [currentLineIndex]);

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const goToLine = (index: number) => {
    if (index >= 0 && index < totalLines) {
      if (isRecording) stopRecording();
      setCurrentLineIndex(index);
      setRecordedScore(null);
      setElapsedSeconds(0);
    }
  };

  const handleSubmit = () => {
    api
      .post('/dub/works', { materialId: id, recordedLines: Array.from(recordedLines) })
      .then(() => {
        navigate('/dub/works');
      })
      .catch(() => {});
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-enter space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dub')}
          className="p-2 rounded-lg hover:bg-amber/10 text-moon-dim hover:text-moon transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl font-bold text-moon truncate">
            {material?.title || '加载中...'}
          </h1>
          {material?.source && (
            <p className="text-sm text-moon-dim">{material.source}</p>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonContent />
      ) : currentLine ? (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-moon-dim">
              第 {currentLineIndex + 1}/{totalLines} 句
            </span>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalLines }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    recordedLines.has(i)
                      ? 'bg-celadon'
                      : i === currentLineIndex
                        ? 'bg-amber'
                        : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Line Display */}
          <div className="glass-card p-8 text-center space-y-4">
            <p className="font-serif text-3xl font-bold text-moon leading-relaxed">
              {currentLine.originalText}
            </p>
            <p className="text-moon-dim text-lg">
              {currentLine.translationText}
            </p>
          </div>

          {/* Recording Area */}
          <div className="glass-card p-8 text-center space-y-6">
            {/* Waveform Animation */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-12">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-amber/60 rounded-full"
                    style={{
                      height: `${Math.sin(Date.now() / 200 + i * 0.5) * 20 + 24}px`,
                      animation: `float ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Record Button */}
            <button
              onClick={handleRecordToggle}
              className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                ${isRecording
                  ? 'bg-red-500/20 text-red-400 recording-pulse'
                  : 'bg-amber/15 text-amber hover:bg-amber/25'
                }`}
            >
              <Mic size={40} />
            </button>

            <div>
              {isRecording ? (
                <div className="space-y-1">
                  <p className="text-sakura font-medium">正在录音...</p>
                  <p className="text-sm text-moon-dim font-mono">{formatTime(elapsedSeconds)}</p>
                </div>
              ) : (
                <p className="text-sm text-moon-dim">
                  {recordedScore !== null ? '再次点击录音' : '点击按钮开始录音'}
                </p>
              )}
            </div>

            {/* Score Display */}
            {recordedScore !== null && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-sm text-moon-dim font-medium">发音评分</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        recordedScore >= 80
                          ? 'bg-celadon'
                          : recordedScore >= 60
                            ? 'bg-amber'
                            : 'bg-sakura'
                      }`}
                      style={{ width: `${recordedScore}%` }}
                    />
                  </div>
                  <span className="font-mono text-xl font-bold text-moon">
                    {recordedScore}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => goToLine(currentLineIndex - 1)}
              disabled={currentLineIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-moon-dim hover:text-moon hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              <span>上一句</span>
            </button>

            <button
              onClick={() => {
                if (recordedScore === null && !isRecording) {
                  handleRecordToggle();
                } else if (currentLineIndex < totalLines - 1) {
                  goToLine(currentLineIndex + 1);
                }
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-moon-dim hover:text-moon hover:bg-white/5 transition-colors"
            >
              <span>{currentLineIndex < totalLines - 1 ? '下一句' : '—'}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={recordedLines.size === 0}
              className="btn-glow px-10 py-3 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={18} />
              <span>完成配音</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-moon-dim">
          <Mic size={48} className="mb-4 opacity-30" />
          <p className="text-lg">暂无配音内容</p>
        </div>
      )}
    </div>
  );
}