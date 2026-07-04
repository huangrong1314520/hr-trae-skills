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

    function doSpeak() {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.9;   // 略慢于正常，便于学习
      u.pitch = 1;
      u.volume = 1;

      const voice = pickJaVoice();
      if (voice) u.voice = voice;

      let finished = false;
      const finish = (ok: boolean) => {
        if (finished) return;
        finished = true;
        if (ok) resolve();
        else reject(new Error('speak failed'));
      };

      const timeoutId = setTimeout(() => {
        if (!finished) {
          try { synth.cancel(); } catch { /* ignore */ }
          finish(false);
        }
      }, 15000);

      u.onend = () => { clearTimeout(timeoutId); finish(true); };
      u.onerror = () => { clearTimeout(timeoutId); finish(false); };

      synth.speak(u);
    }

    // 避免频繁 cancel：只有在真的在说或有队列时才取消
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setTimeout(doSpeak, 80);
    } else {
      doSpeak();
    }
  });
}

/* ========== 播放内嵌 base64 音频 ========== */
function playEmbeddedAudio(audio: HTMLAudioElement, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplay', onCanPlay);
      if (ok) resolve();
      else reject(new Error('audio failed'));
    };

    const onEnded = () => finish(true);
    const onError = () => finish(false);
    const onCanPlay = () => {
      // 确保音频可以播放后再 play
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => finish(false));
      }
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplay', onCanPlay);

    // 设置 src 并触发加载
    audio.src = src;
    audio.load();

    // 超时保护：8秒内没结束就失败
    setTimeout(() => {
      if (!done) finish(false);
    }, 8000);
  });
}

/* ========== 主发音函数 ========== */
// 策略：
// - 短文本（单词，<=10字符）：优先内嵌音频（秒播、声调准确）
// - 长文本（例句，>10字符）：优先浏览器语音合成（更自然、有语调变化和停顿）
//   浏览器语音不可用时回退内嵌音频
export function speakJa(text: string): Promise<void> {
  const audio = getAudio();

  // 停止当前播放
  if (audio) {
    try { audio.pause(); } catch { /* ignore */ }
  }
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch { /* ignore */ }

  const isLongText = text.length > 10;
  const embeddedUrl = getJaAudioDataUri(text);

  // 长文本（例句）：优先浏览器语音合成（更自然，有语调变化和停顿）
  if (isLongText) {
    return browserSpeak(text).catch(() => {
      // 浏览器语音失败，回退内嵌音频
      if (embeddedUrl && audio) {
        return playEmbeddedAudio(audio, embeddedUrl);
      }
      return Promise.reject(new Error('no audio available'));
    });
  }

  // 短文本（单词）：优先内嵌音频（秒播、声调准确）
  if (embeddedUrl && audio) {
    return playEmbeddedAudio(audio, embeddedUrl).catch(() => {
      // 内嵌音频失败，回退浏览器语音
      return browserSpeak(text);
    });
  }

  // 无内嵌音频，直接用浏览器语音
  return browserSpeak(text);
}

/* ========== 检查某个文本是否有内嵌音频 ========== */
export function hasEmbeddedAudio(text: string): boolean {
  return !!getJaAudioDataUri(text);
}
