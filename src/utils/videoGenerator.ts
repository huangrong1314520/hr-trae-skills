import { getJaAudioDataUri } from './audioData';

export interface VideoItem {
  type: 'word' | 'example';
  text: string;
  reading?: string;
  meaning?: string;
  trans?: string;
  duration: number;
}

export interface VideoTheme {
  name: string;
  bgTop: string;
  bgBottom: string;
  textColor: string;
  accentColor: string;
  subTextColor: string;
  cardBg: string;
  progressColor: string;
}

export const videoThemes: VideoTheme[] = [
  {
    name: '清新粉紫',
    bgTop: '#fce7f3',
    bgBottom: '#e0e7ff',
    textColor: '#1f2937',
    accentColor: '#ec4899',
    subTextColor: '#6b7280',
    cardBg: 'rgba(255,255,255,0.7)',
    progressColor: '#f472b6',
  },
  {
    name: '深夜蓝',
    bgTop: '#0f172a',
    bgBottom: '#1e1b4b',
    textColor: '#f1f5f9',
    accentColor: '#22d3ee',
    subTextColor: '#94a3b8',
    cardBg: 'rgba(255,255,255,0.1)',
    progressColor: '#22d3ee',
  },
  {
    name: '抹茶绿',
    bgTop: '#ecfdf5',
    bgBottom: '#d1fae5',
    textColor: '#1f2937',
    accentColor: '#059669',
    subTextColor: '#6b7280',
    cardBg: 'rgba(255,255,255,0.8)',
    progressColor: '#10b981',
  },
  {
    name: '温暖橙',
    bgTop: '#fff7ed',
    bgBottom: '#fef3c7',
    textColor: '#1f2937',
    accentColor: '#f97316',
    subTextColor: '#6b7280',
    cardBg: 'rgba(255,255,255,0.7)',
    progressColor: '#fb923c',
  },
];

interface GenerateOptions {
  items: VideoItem[];
  theme: VideoTheme;
  sceneTitle: string;
  sceneIcon: string;
  totalWords: number;
  fps?: number;
  width?: number;
  height?: number;
  onProgress?: (percent: number) => void;
  audioEnabled?: boolean;
}

export async function generateSceneVideo(options: GenerateOptions): Promise<Blob> {
  const {
    items,
    theme,
    sceneTitle,
    sceneIcon,
    totalWords,
    fps = 30,
    width = 720,
    height = 1280,
    onProgress,
    audioEnabled = true,
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);
  const totalFrames = Math.floor((totalDuration / 1000) * fps);
  const frameDuration = 1000 / fps;

  // 视频流
  const videoStream = canvas.captureStream(fps);

  // 音频
  let audioCtx: AudioContext | null = null;
  let destNode: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = videoStream;

  if (audioEnabled) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      destNode = audioCtx.createMediaStreamDestination();
      combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...destNode.stream.getAudioTracks(),
      ]);
    } catch (e) {
      console.warn('Audio not available, video only:', e);
    }
  }

  // MediaRecorder
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  let mimeType = '';
  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      mimeType = type;
      break;
    }
  }

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: mimeType || 'video/webm',
    videoBitsPerSecond: 2_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
      if (audioCtx) audioCtx.close();
      resolve(blob);
    };
    recorder.onerror = (e) => reject(e);

    recorder.start(1000);

    let currentFrame = 0;
    let audioPlayed = new Set<number>();

    function drawFrame() {
      const currentTime = currentFrame * frameDuration;

      // 找当前条目
      let acc = 0;
      let itemIdx = 0;
      let itemProgress = 0;
      for (let i = 0; i < items.length; i++) {
        if (currentTime < acc + items[i].duration) {
          itemIdx = i;
          itemProgress = (currentTime - acc) / items[i].duration;
          break;
        }
        acc += items[i].duration;
        itemIdx = i;
      }
      if (itemIdx >= items.length) itemIdx = items.length - 1;

      const item = items[itemIdx];

      // 画背景
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, theme.bgTop);
      grad.addColorStop(1, theme.bgBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 进度条
      const totalProgress = currentTime / totalDuration;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, width, 4);
      ctx.fillStyle = theme.progressColor;
      ctx.fillRect(0, 0, width * Math.min(1, totalProgress), 4);

      // 卡片区域
      const cardX = width * 0.08;
      const cardY = height * 0.12;
      const cardW = width * 0.84;
      const cardH = height * 0.76;
      const cardRadius = 40;

      // 圆角矩形卡片
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
      ctx.fillStyle = theme.cardBg;
      ctx.fill();
      ctx.restore();

      // 场景标题
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.subTextColor;
      ctx.font = `400 ${width * 0.035}px sans-serif`;
      ctx.fillText(
        `${sceneIcon} ${sceneTitle} · ${Math.floor(itemIdx / 2) + 1}/${totalWords}`,
        width / 2,
        cardY + height * 0.08
      );

      // 标签
      const labelText = item.type === 'word' ? '单词' : '例句';
      const labelW = width * 0.18;
      const labelH = height * 0.04;
      const labelX = width / 2 - labelW / 2;
      const labelY = cardY + height * 0.13;

      ctx.beginPath();
      roundRect(ctx, labelX, labelY, labelW, labelH, labelH / 2);
      ctx.fillStyle = hexToRgba(theme.accentColor, 0.15);
      ctx.fill();

      ctx.fillStyle = theme.accentColor;
      ctx.font = `500 ${width * 0.03}px sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, width / 2, labelY + labelH / 2);
      ctx.textBaseline = 'alphabetic';

      // 入场动画：前 15% 淡入+上移，后 15% 淡出+下移
      let opacity = 1;
      let offsetY = 0;
      const fadePortion = 0.15;
      if (itemProgress < fadePortion) {
        const t = itemProgress / fadePortion;
        opacity = t;
        offsetY = (1 - t) * 30;
      } else if (itemProgress > 1 - fadePortion) {
        const t = (itemProgress - (1 - fadePortion)) / fadePortion;
        opacity = 1 - t;
        offsetY = -t * 30;
      }

      ctx.save();
      ctx.globalAlpha = opacity;

      if (item.type === 'word') {
        // 日语单词
        ctx.fillStyle = theme.textColor;
        ctx.font = `700 ${width * 0.1}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(item.text, width / 2, cardY + height * 0.32 + offsetY);

        // 注音
        if (item.reading) {
          ctx.fillStyle = theme.accentColor;
          ctx.font = `400 ${width * 0.05}px sans-serif`;
          ctx.fillText(item.reading, width / 2, cardY + height * 0.4 + offsetY);
        }

        // 释义
        if (item.meaning) {
          ctx.fillStyle = theme.subTextColor;
          ctx.font = `400 ${width * 0.05}px sans-serif`;
          ctx.fillText(item.meaning, width / 2, cardY + height * 0.48 + offsetY);
        }

        // 喇叭图标（发音时跳动）
        const volSize = width * 0.08;
        const volX = width / 2 - volSize / 2;
        const volY = cardY + height * 0.58 + offsetY;

        // 喇叭圆背景
        ctx.beginPath();
        ctx.arc(width / 2, volY + volSize / 2, volSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(theme.accentColor, 0.15);
        ctx.fill();

        // 简单喇叭图形
        ctx.fillStyle = theme.accentColor;
        ctx.font = `500 ${volSize * 0.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔊', width / 2, volY + volSize / 2);
        ctx.textBaseline = 'alphabetic';

        // 播放音频（只播一次）
        if (audioEnabled && audioCtx && destNode && !audioPlayed.has(itemIdx) && itemProgress > 0.1) {
          audioPlayed.add(itemIdx);
          playAudioToStream(item.text, audioCtx, destNode).catch(() => {});
        }
      } else {
        // 例句
        ctx.fillStyle = theme.textColor;
        ctx.font = `500 ${width * 0.05}px serif`;
        ctx.textAlign = 'center';
        const lines = wrapText(ctx, item.text, cardW * 0.8);
        const lineHeight = width * 0.07;
        const startY = cardY + height * 0.3 + offsetY - (lines.length - 1) * lineHeight / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, width / 2, startY + i * lineHeight);
        });

        // 翻译
        if (item.trans) {
          ctx.fillStyle = theme.subTextColor;
          ctx.font = `400 ${width * 0.04}px sans-serif`;
          const transLines = wrapText(ctx, item.trans, cardW * 0.8);
          const transStartY = startY + lines.length * lineHeight + height * 0.03;
          transLines.forEach((line, i) => {
            ctx.fillText(line, width / 2, transStartY + i * width * 0.055);
          });
        }

        // 喇叭图标
        const volSize = width * 0.07;
        const volY = cardY + height * 0.6 + offsetY;

        ctx.beginPath();
        ctx.arc(width / 2, volY + volSize / 2, volSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(theme.accentColor, 0.15);
        ctx.fill();

        ctx.fillStyle = theme.accentColor;
        ctx.font = `500 ${volSize * 0.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔊', width / 2, volY + volSize / 2);
        ctx.textBaseline = 'alphabetic';

        // 播放音频
        if (audioEnabled && audioCtx && destNode && !audioPlayed.has(itemIdx) && itemProgress > 0.1) {
          audioPlayed.add(itemIdx);
          playAudioToStream(item.text, audioCtx, destNode).catch(() => {});
        }
      }

      ctx.restore();

      // 底部水印
      ctx.fillStyle = hexToRgba(theme.subTextColor, 0.5);
      ctx.font = `400 ${width * 0.025}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🌸 日语学习打卡', width / 2, cardY + cardH - height * 0.04);

      // 进度
      if (onProgress) {
        onProgress(Math.min(100, (currentFrame / totalFrames) * 100));
      }

      currentFrame++;

      if (currentFrame <= totalFrames) {
        requestAnimationFrame(drawFrame);
      } else {
        // 录制结束
        setTimeout(() => {
          recorder.stop();
        }, 500);
      }
    }

    // 开始
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    drawFrame();
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function playAudioToStream(
  text: string,
  audioCtx: AudioContext,
  destNode: MediaStreamAudioDestinationNode
): Promise<void> {
  const dataUri = getJaAudioDataUri(text);
  if (!dataUri) return;

  try {
    // 解码音频
    const response = await fetch(dataUri);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // 创建源并连接到目标（录制流）
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(destNode);

    // 也连接到输出（用户能听到）
    source.connect(audioCtx.destination);

    source.start(0);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
