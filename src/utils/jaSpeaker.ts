import { getJaAudioDataUri } from './audioData';

/* ========== 全局单例 ========== */
let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.volume = 1;
  }
  return audioEl;
}

/* ========== 语音合成 voice 缓存 ========== */
let voicesReady = false;
let voicesCache: SpeechSynthesisVoice[] = [];

function initVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  const load = () => {
    voicesCache = synth.getVoices();
    if (voicesCache.length > 0) voicesReady = true;
  };
  load();
  synth.onvoiceschanged = load;
}

if (typeof window !== 'undefined') {
  initVoices();
}

/* ========== 选择日语 voice ========== */
function pickJaVoice(): SpeechSynthesisVoice | null {
  if (!voicesReady || voicesCache.length === 0) {
    // 尝试重新获取
    if ('speechSynthesis' in window) {
      voicesCache = window.speechSynthesis.getVoices();
      if (voicesCache.length > 0) voicesReady = true;
    }
  }
  if (voicesCache.length === 0) return null;

  // 优先级：ja-JP → 任何 ja → 系统默认 → 第一个
  const jaJp = voicesCache.find((v) => v.lang === 'ja-JP');
  if (jaJp) return jaJp;
  const ja = voicesCache.find((v) => v.lang.startsWith('ja'));
  if (ja) return ja;
  const def = voicesCache.find((v) => v.default);
  if (def) return def;
  return voicesCache[0] || null;
}

/* ========== 浏览器语音合成朗读 ========== */
function browserSpeak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('speechSynthesis not available'));
      return;
    }
    const synth = window.speechSynthesis;

    // 避免频繁 cancel：只有在真的在说或有队列时才取消
    if (synth.speaking || synth.pending) {
      synth.cancel();
      // cancel 后稍微延迟再 speak，避免队列被打断导致无声
      setTimeout(() => doSpeak(), 50);
    } else {
      doSpeak();
    }

    function doSpeak() {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.85;
      u.pitch = 1;
      u.volume = 1;

      const voice = pickJaVoice();
      if (voice) u.voice = voice;

      let finished = false;
      const finish = (ok: boolean, err?: Error) => {
        if (finished) return;
        finished = true;
        if (ok) resolve();
        else reject(err || new Error('speak failed'));
      };

      u.onend = () => finish(true);
      u.onerror = (e) => finish(false, new Error(e.error || 'unknown'));

      // 超时保护：如果 10 秒内还没结束，强制结束
      const timeoutId = setTimeout(() => {
        if (!finished) {
          synth.cancel();
          finish(false, new Error('timeout'));
        }
      }, 10000);

      u.onend = () => {
        clearTimeout(timeoutId);
        finish(true);
      };
      u.onerror = (e) => {
        clearTimeout(timeoutId);
        finish(false, new Error(e.error || 'unknown'));
      };

      synth.speak(u);
    }
  });
}

/* ========== 主发音函数 ========== */
// 返回 Promise，方便调用方做状态管理
export function speakJa(text: string): Promise<void> {
  const audio = getAudio();

  // 停止当前音频播放
  if (audio) {
    try { audio.pause(); } catch { /* ignore */ }
    audio.currentTime = 0;
  }

  // 取消浏览器语音队列
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch { /* ignore */ }

  // 优先内嵌 base64 音频（秒播，最可靠）
  const embeddedUrl = getJaAudioDataUri(text);
  if (embeddedUrl && audio) {
    return new Promise((resolve, reject) => {
      audio!.src = embeddedUrl;
      let done = false;
      const finish = (ok: boolean, err?: Error) => {
        if (done) return;
        done = true;
        if (ok) resolve();
        else reject(err || new Error('audio play failed'));
      };

      const onEnded = () => { cleanup(); finish(true); };
      const onError = () => { cleanup(); finish(false, new Error('audio error')); };
      const cleanup = () => {
        audio!.removeEventListener('ended', onEnded);
        audio!.removeEventListener('error', onError);
      };

      audio!.addEventListener('ended', onEnded);
      audio!.addEventListener('error', onError);

      const p = audio!.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          cleanup();
          // 内嵌音频播放失败，回退浏览器语音
          browserSpeak(text).then(resolve).catch(reject);
        });
      }
    });
  }

  // 无内嵌音频，直接用浏览器语音合成
  return browserSpeak(text);
}

/* ========== 检查某个文本是否有内嵌音频 ========== */
export function hasEmbeddedAudio(text: string): boolean {
  return !!getJaAudioDataUri(text);
}
