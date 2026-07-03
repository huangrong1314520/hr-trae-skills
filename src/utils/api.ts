const API_BASE = '/api';

type ApiResponse<T> = { success: boolean; data: T; error?: string };

const languages = ['en', 'ja', 'ko', 'th'] as const;
const levels = ['beginner', 'intermediate', 'advanced'] as const;

const LANG_NAME: Record<string, string> = {
  en: '英语',
  ja: '日语',
  ko: '韩语',
  th: '泰语',
};

const LEVEL_LABELS_FALLBACK: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

const courses = languages.flatMap((language, langIndex) =>
  levels.map((level, levelIndex) => ({
    id: langIndex * 3 + levelIndex + 1,
    language,
    level,
    title: `${LANG_NAME[language]}${LEVEL_LABELS_FALLBACK[level]}`,
    description: `${LANG_NAME[language]} ${LEVEL_LABELS_FALLBACK[level]}课程，覆盖词汇、语法、听力、口语训练`,
    progress: levelIndex === 0 ? 35 : 0,
  })),
);

const groups = [
  { id: 1, language: 'en', name: 'English Corner', description: '英语口语、写作和日常表达打卡群', memberCount: 128 },
  { id: 2, language: 'ja', name: '日本語交流群', description: '日语配音、台词翻译、动漫对白练习', memberCount: 256 },
  { id: 3, language: 'ko', name: '한국어 스터디', description: '韩语句子、韩剧台词和发音练习', memberCount: 98 },
  { id: 4, language: 'th', name: 'กลุ่มเรียนภาษาไทย', description: '泰语手写、日常句子和发音打卡', memberCount: 76 },
  { id: 5, language: 'yue', name: '粵語交流群', description: '粤语日常表达、港剧对白和歌曲分享', memberCount: 64 },
];

const materials = [
  { id: 1, language: 'ja', title: '鬼滅の刃 - 鎹鴉の伝令', source: '鬼滅の刃', level: 'intermediate', type: 'anime', duration: 90, lines: [
    { id: 1, lineIndex: 0, originalText: '来たぞ！来たぞ！新たな任務だ！', translationText: '来了！来了！新任务来了！' },
    { id: 2, lineIndex: 1, originalText: '次の目的地は那田蜘蛛山だ！', translationText: '下一个目的地是那田蜘蛛山！' },
    { id: 3, lineIndex: 2, originalText: '気をつけて行けよ！', translationText: '小心点去吧！' },
  ] },
  { id: 2, language: 'ja', title: '千と千尋の神隠し - 名前を返して', source: '千と千尋の神隠し', level: 'beginner', type: 'anime', duration: 60, lines: [
    { id: 4, lineIndex: 0, originalText: 'ここで働かせてください！', translationText: '请让我在这里工作！' },
    { id: 5, lineIndex: 1, originalText: '自分の名前を大切にね', translationText: '要珍惜自己的名字哦' },
  ] },
  { id: 3, language: 'en', title: 'Friends - I’ll be there for you', source: 'Friends', level: 'intermediate', type: 'drama', duration: 120, lines: [
    { id: 6, lineIndex: 0, originalText: "I'll be there for you.", translationText: '我会在你身边。' },
    { id: 7, lineIndex: 1, originalText: 'So no one told you life was gonna be this way.', translationText: '没人告诉你生活会是这样。' },
  ] },
  { id: 4, language: 'ko', title: '오징어 게임 - 무궁화 꽃이 피었습니다', source: '오징어 게임', level: 'intermediate', type: 'drama', duration: 80, lines: [
    { id: 8, lineIndex: 0, originalText: '무궁화 꽃이 피었습니다', translationText: '木槿花开了。' },
  ] },
  { id: 5, language: 'th', title: 'สิ่งเล็กๆ ที่เรียกว่ารัก', source: '初恋这件小事', level: 'beginner', type: 'movie', duration: 70, lines: [
    { id: 9, lineIndex: 0, originalText: 'เราชอบพี่นะ', translationText: '我喜欢你。' },
  ] },
];

const translateTasks = [
  { id: 1, language: 'ja', sourceLang: 'ja', targetLang: 'zh', sourceText: '今日はとてもいい天気ですね', sourceInfo: '日常会话', referenceTranslation: '今天天气真好啊', difficulty: 'beginner' },
  { id: 2, language: 'en', sourceLang: 'en', targetLang: 'zh', sourceText: 'Not all those who wander are lost.', sourceInfo: 'J.R.R. Tolkien', referenceTranslation: '并非所有流浪者都迷失了方向。', difficulty: 'intermediate' },
  { id: 3, language: 'ko', sourceLang: 'ko', targetLang: 'zh', sourceText: '오늘 하루도 화이팅!', sourceInfo: '日常应援', referenceTranslation: '今天也要加油！', difficulty: 'beginner' },
  { id: 4, language: 'th', sourceLang: 'th', targetLang: 'zh', sourceText: 'ชีวิตคือการเดินทาง', sourceInfo: '泰语短句', referenceTranslation: '人生是一场旅程。', difficulty: 'beginner' },
];

const badges = [
  { id: 1, name: '初来乍到', description: '完成首次打卡', icon: '🌟', category: 'streak', unlocked: true, unlockedAt: new Date().toISOString() },
  { id: 2, name: '连续打卡7天', description: '连续打卡7天', icon: '🔥', category: 'streak', unlocked: false },
  { id: 3, name: '配音达人', description: '完成10个配音作品', icon: '🎤', category: 'dub', unlocked: true, unlockedAt: new Date().toISOString() },
  { id: 4, name: '翻译之星', description: '完成10次翻译', icon: '📝', category: 'translate', unlocked: false },
  { id: 5, name: '书写达人', description: '完成10次手写练习', icon: '✍️', category: 'writing', unlocked: false },
  { id: 6, name: '社交达人', description: '加入3个学习小组', icon: '💬', category: 'social', unlocked: true, unlockedAt: new Date().toISOString() },
];

const charsByLang: Record<string, { id: number; character: string; romaji: string; meaning: string }[]> = {
  ja: [
    { id: 1, character: 'あ', romaji: 'a', meaning: '平假名 a' },
    { id: 2, character: 'か', romaji: 'ka', meaning: '平假名 ka' },
    { id: 3, character: 'さ', romaji: 'sa', meaning: '平假名 sa' },
    { id: 4, character: 'た', romaji: 'ta', meaning: '平假名 ta' },
  ],
  ko: [
    { id: 5, character: '가', romaji: 'ga', meaning: '韩文字母组合 ga' },
    { id: 6, character: '나', romaji: 'na', meaning: '韩文字母组合 na' },
    { id: 7, character: '다', romaji: 'da', meaning: '韩文字母组合 da' },
  ],
  th: [
    { id: 8, character: 'ก', romaji: 'ko kai', meaning: '泰语字母 ก' },
    { id: 9, character: 'ข', romaji: 'kho khai', meaning: '泰语字母 ข' },
    { id: 10, character: 'ค', romaji: 'kho khwai', meaning: '泰语字母 ค' },
  ],
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function currentUser() {
  return getStored('mock-user', {
    id: 1,
    username: '语言之夜',
    email: 'demo@langnight.app',
    avatarUrl: null,
    avatar_url: null,
    nativeLanguage: 'zh',
    native_language: 'zh',
    bio: '用碎片时间练口语、写文字、配台词。',
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    languages: [
      { language: 'en', level: 'advanced' },
      { language: 'ja', level: 'intermediate' },
      { language: 'ko', level: 'beginner' },
      { language: 'th', level: 'beginner' },
    ],
  });
}

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

function parseQuery(url: string) {
  const [path, queryString = ''] = url.split('?');
  return { path, query: new URLSearchParams(queryString) };
}

function mockRequest<T>(url: string, options: RequestInit = {}): T {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(String(options.body)) : {};
  const { path, query } = parseQuery(url);

  if (path === '/auth/login' || path === '/auth/register') {
    const user = { ...currentUser(), username: body.username || currentUser().username, email: body.email || currentUser().email };
    setStored('mock-user', user);
    localStorage.setItem('token', 'mock-token');
    return ok({ token: 'mock-token', user }) as T;
  }
  if (path === '/auth/me') return ok(currentUser()) as T;

  if (path === '/courses') {
    const lang = query.get('lang');
    const level = query.get('level');
    return ok(courses.filter((c) => (!lang || c.language === lang) && (!level || c.level === level))) as T;
  }
  const unitMatch = path.match(/^\/courses\/(\d+)\/units\/(\d+)$/);
  if (unitMatch) {
    const unitId = Number(unitMatch[2]);
    return ok({
      unit: { id: unitId, title: ['基础词汇', '实用语法', '综合练习'][unitId - 1] || '综合练习' },
      items: [
        { id: 1, type: 'vocab', content: JSON.stringify({ term: 'こんにちは', meaning: '你好', examples: ['こんにちは、いい天気ですね。'] }), answer: 'こんにちは' },
        { id: 2, type: 'grammar', content: JSON.stringify({ explanation: '基础句型：主语 + は + 内容 + です。', examples: ['私は学生です。', '今日はいい天気です。'] }), answer: 'です' },
        { id: 3, type: 'listening', content: JSON.stringify({ sentence: '私は毎朝コーヒーを飲みます', answer: 'コーヒー', options: ['お茶', 'コーヒー', '水'] }), answer: 'コーヒー', options: JSON.stringify(['お茶', 'コーヒー', '水']) },
        { id: 4, type: 'speaking', content: JSON.stringify({ sentence: '日本語を勉強するのはとても楽しいです。' }), answer: '日本語を勉強するのはとても楽しいです。' },
      ],
    }) as T;
  }
  if (path === '/progress') return ok({ completed: true }) as T;

  if (path === '/dub/materials') {
    const lang = query.get('lang');
    const level = query.get('level');
    const type = query.get('type');
    return ok(materials.filter((m) => (!lang || m.language === lang) && (!level || m.level === level) && (!type || m.type === type))) as T;
  }
  const materialMatch = path.match(/^\/dub\/materials\/(\d+)$/);
  if (materialMatch) return ok(materials.find((m) => m.id === Number(materialMatch[1])) || materials[0]) as T;
  if (path === '/dub/works') {
    if (method === 'POST') return ok({ id: Date.now(), ...body }) as T;
    return ok(getStored('mock-dub-works', [
      { id: 1, user: { username: '夜读者' }, material: { title: '鬼滅の刃 - 鎹鴉の伝令', source: '鬼滅の刃' }, overallScore: 88, likesCount: 12, createdAt: new Date().toISOString() },
    ])) as T;
  }
  if (path.includes('/like')) return ok({ liked: true }) as T;

  if (path === '/translate/daily') return ok(translateTasks[0]) as T;
  if (path === '/translate/tasks') {
    const lang = query.get('lang');
    return ok(translateTasks.filter((t) => !lang || t.language === lang)) as T;
  }
  if (path === '/translate/community') {
    return ok(getStored('mock-translations', [
      { id: 1, user: { username: '翻译星人' }, originalText: '今日はとてもいい天気ですね', translatedText: '今天真是个好天气呢。', likesCount: 6, createdAt: new Date().toISOString() },
    ])) as T;
  }
  if (path === '/translate/submit') {
    const list = getStored<any[]>('mock-translations', []);
    const task = translateTasks.find((t) => t.id === Number(body.taskId)) || translateTasks[0];
    list.unshift({ id: Date.now(), user: { username: currentUser().username }, originalText: task.sourceText, translatedText: body.translatedText, likesCount: 0, createdAt: new Date().toISOString() });
    setStored('mock-translations', list);
    return ok({ submitted: true }) as T;
  }

  if (path === '/groups') return ok(groups) as T;
  const groupMatch = path.match(/^\/groups\/([^/]+)$/);
  if (groupMatch) return ok(groups.find((g) => g.language === groupMatch[1]) || groups[0]) as T;
  const postsMatch = path.match(/^\/groups\/([^/]+)\/posts$/);
  if (postsMatch) {
    if (method === 'POST') return ok({ id: Date.now(), ...body }) as T;
    return ok({ posts: getStored('mock-posts', [
      { id: 1, user: { username: '配音练习生' }, content: '今晚练了鎹鸦的台词，感觉语速终于跟上了！', attachmentType: 'dub', likesCount: 8, createdAt: new Date().toISOString() },
      { id: 2, user: { username: '泰语手写中' }, content: '今天写了 ก ข ค，笔画还需要继续练。', attachmentType: 'handwriting', likesCount: 5, createdAt: new Date().toISOString() },
    ]), pagination: { page: 1, totalPages: 1 } }) as T;
  }
  if (path.includes('/checkin') || path.includes('/join') || path.includes('/comment')) return ok({ done: true }) as T;

  if (path === '/achievements') return ok(badges) as T;
  if (path === '/achievements/stats') return ok({ totalCheckins: 7, totalDubWorks: 3, totalTranslations: 5, streak: 4 }) as T;
  if (path === '/achievements/leaderboard') {
    const board = [
      { user: { username: '语言之夜' }, count: 18 },
      { user: { username: '配音练习生' }, count: 12 },
      { user: { username: '翻译星人' }, count: 9 },
    ];
    return ok({ checkins: board, dubWorks: board, translations: board }) as T;
  }

  if (path === '/handwriting/chars') return ok(charsByLang[query.get('lang') || 'ja'] || charsByLang.ja) as T;
  if (path === '/handwriting/works') {
    if (method === 'POST') {
      const list = getStored<any[]>('mock-handwriting', []);
      list.unshift({ id: Date.now(), user: { username: currentUser().username }, language: body.language || 'ja', characterText: body.characterText, likesCount: 0, createdAt: new Date().toISOString() });
      setStored('mock-handwriting', list);
      return ok({ saved: true }) as T;
    }
    return ok(getStored('mock-handwriting', [])) as T;
  }

  if (path === '/users/profile') {
    if (method === 'PUT') {
      const user = { ...currentUser(), ...body };
      setStored('mock-user', user);
      return ok(user) as T;
    }
    return ok({ ...currentUser(), stats: { totalCheckins: 7, totalDubWorks: 3, totalTranslations: 5, streak: 4 } }) as T;
  }

  return ok({}) as T;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return mockRequest<T>(url, options);
    }
    const data = await res.json();

    if (!res.ok) {
      return mockRequest<T>(url, options);
    }
    return data;
  } catch {
    return mockRequest<T>(url, options);
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

export const LANG_CONFIG: Record<string, { name: string; emoji: string; color: string }> = {
  en: { name: 'English', emoji: '🇬🇧', color: '#5a8ec8' },
  ja: { name: '日本語', emoji: '🇯🇵', color: '#e8a0b4' },
  ko: { name: '한국어', emoji: '🇰🇷', color: '#7eb8a0' },
  th: { name: 'ภาษาไทย', emoji: '🇹🇭', color: '#c8985a' },
  yue: { name: '粵語', emoji: '🇭🇰', color: '#a088c8' },
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};
