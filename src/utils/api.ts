const API_BASE = '/api';

type ApiResponse<T> = { success: boolean; data: T; error?: string };

/* ========== 本地存储工具 ========== */
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

/* ========== 语言配置 ========== */
export const LANG_CONFIG: Record<string, { name: string; emoji: string; color: string; active: boolean }> = {
  ja: { name: '日本語', emoji: '🇯🇵', color: '#e8a0b4', active: true },
  ko: { name: '한국어', emoji: '🇰🇷', color: '#7eb8a0', active: false },
  th: { name: 'ภาษาไทย', emoji: '🇹🇭', color: '#c8985a', active: false },
  en: { name: 'English', emoji: '🇬🇧', color: '#5a8ec8', active: false },
  yue: { name: '粵語', emoji: '🇭🇰', color: '#a088c8', active: false },
  es: { name: 'Español', emoji: '🇪🇸', color: '#e8c85a', active: false },
};

/* ========== 场景课程数据 ========== */
export interface SceneWord {
  word: string;        // 日语原文
  reading: string;         // 片假名注音
  romaji: string;         // 罗马音
  pos: string;            // 词性
  meaning: string;        // 中文释义
  example?: string;       // 例句
  exampleTrans?: string;  // 例句翻译
}

export interface SceneGrammar {
  pattern: string;        // 语法句型
  explanation: string;    // 语法解释
  example: string;        // 例句
  exampleTrans: string;   // 例句翻译
}

export interface SceneCourse {
  id: string;
  lang: string;
  title: string;
  icon: string;
  description: string;
  level: string;
  day: number;             // 第几天
  words: SceneWord[];
  grammars: SceneGrammar[];
  imageUrl?: string;
}

const sceneCourses: SceneCourse[] = [
  {
    id: 'ja-fruits',
    lang: 'ja',
    title: '水果',
    icon: '🍎',
    description: '学习各种水果的日语表达，从常见的苹果到日本特有的水果',
    level: 'N5',
    day: 1,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20fruits%20assortment%20flat%20lay%20photography%20apples%20strawberries%20persimmons%20on%20wooden%20table&image_size=landscape_4_3',
    words: [
      { word: 'りんご', reading: 'リンゴ', romaji: 'ringo', pos: '名词', meaning: '苹果', example: 'りんごを食べます。', exampleTrans: '吃苹果。' },
      { word: 'みかん', reading: 'ミカン', romaji: 'mikan', pos: '名词', meaning: '橘子', example: 'みかんは甘いです。', exampleTrans: '橘子很甜。' },
      { word: 'いちご', reading: 'イチゴ', romaji: 'ichigo', pos: '名词', meaning: '草莓', example: 'いちごが大好きです。', exampleTrans: '我最喜欢草莓了。' },
      { word: 'バナナ', reading: 'バナナ', romaji: 'banana', pos: '名词', meaning: '香蕉', example: 'バナナを買いました。', exampleTrans: '买了香蕉。' },
      { word: 'ぶどう', reading: 'ブドウ', romaji: 'budou', pos: '名词', meaning: '葡萄', example: 'ぶどうは秋が旬です。', exampleTrans: '葡萄秋天当季。' },
      { word: 'もも', reading: 'モモ', romaji: 'momo', pos: '名词', meaning: '桃子', example: 'ももを食べたいです。', exampleTrans: '想吃桃子。' },
      { word: 'すいか', reading: 'スイカ', romaji: 'suika', pos: '名词', meaning: '西瓜', example: '夏はすいかが美味しいです。', exampleTrans: '夏天西瓜很好吃。' },
      { word: 'なし', reading: 'ナシ', romaji: 'nashi', pos: '名词', meaning: '梨', example: 'なしを剥いてください。', exampleTrans: '请削梨皮。' },
    ],
    grammars: [
      { pattern: '〜は〜です', explanation: '基本判断句型。「は」提示主题，「です」表示敬体断定。', example: 'これはりんごです。', exampleTrans: '这是苹果。' },
      { pattern: '〜を食べます', explanation: '「を」标记他动词的宾语，表示动作的对象。', example: 'みかんを食べます。', exampleTrans: '吃橘子。' },
      { pattern: '〜が好きです', explanation: '表示喜好。「が」标记喜欢的对象。', example: 'いちごが好きです。', exampleTrans: '喜欢草莓。' },
    ],
  },
  {
    id: 'ja-restaurant',
    lang: 'ja',
    title: '餐厅点餐',
    icon: '🍽️',
    description: '从进店到点餐、结账的完整流程，掌握餐厅场景用语',
    level: 'N5',
    day: 2,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20restaurant%20interior%20izakaya%20warm%20lighting%20menu%20on%20table&image_size=landscape_4_3',
    words: [
      { word: 'メニュー', reading: 'メニュー', romaji: 'menyuu', pos: '名词', meaning: '菜单', example: 'メニューをください。', exampleTrans: '请给我菜单。' },
      { word: '注文', reading: 'チュウモン', romaji: 'chuumon', pos: '名词/する动词', meaning: '点餐', example: '注文をお願いします。', exampleTrans: '我要点餐。' },
      { word: 'お水', reading: 'オミズ', romaji: 'omizu', pos: '名词', meaning: '水', example: 'お水をお願いします。', exampleTrans: '请给我水。' },
      { word: 'お会計', reading: 'オカイケイ', romaji: 'okaikei', pos: '名词', meaning: '结账', example: 'お会計をお願いします。', exampleTrans: '请结账。' },
      { word: '定食', reading: 'テイショク', romaji: 'teishoku', pos: '名词', meaning: '套餐', example: '定食を一つください。', exampleTrans: '请给我一份套餐。' },
      { word: '美味しい', reading: 'オイシイ', romaji: 'oishii', pos: 'い形容词', meaning: '好吃的', example: 'とても美味しいです。', exampleTrans: '非常好吃。' },
      { word: '注文する', reading: 'チュウモンスル', romaji: 'chuumon suru', pos: 'する动词', meaning: '下单', example: 'これを注文します。', exampleTrans: '点这个。' },
    ],
    grammars: [
      { pattern: '〜をお願いします', explanation: '礼貌请求句型。请求对方做某事或提供某物。', example: 'メニューをお願いします。', exampleTrans: '请给我菜单。' },
      { pattern: '〜をください', explanation: '请求给予某物。「を」标记宾语，「ください」表示请给我。', example: 'お水をください。', exampleTrans: '请给我水。' },
      { pattern: '〜を一つください', explanation: '数量表达。「一つ」表示一个，可替换为二つ、三つ等。', example: '定食を一つください。', exampleTrans: '请给我一份套餐。' },
    ],
  },
  {
    id: 'ja-subway',
    lang: 'ja',
    title: '坐地铁',
    icon: '🚇',
    description: '东京地铁出行全流程：购票、问路、换乘',
    level: 'N4',
    day: 3,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tokyo%20subway%20station%20platform%20train%20arriving%20signage%20in%20Japanese&image_size=landscape_4_3',
    words: [
      { word: '切符', reading: 'キップ', romaji: 'kippu', pos: '名词', meaning: '车票', example: '切符を買います。', exampleTrans: '买车票。' },
      { word: '駅', reading: 'エキ', romaji: 'eki', pos: '名词', meaning: '车站', example: '次の駅で降ります。', exampleTrans: '在下一站下车。' },
      { word: '乗る', reading: 'ノル', romaji: 'noru', pos: '一段动词', meaning: '乘坐', example: '電車に乗ります。', exampleTrans: '坐电车。' },
      { word: '降りる', reading: 'オリル', romaji: 'oriru', pos: '一段动词', meaning: '下车', example: 'ここで降ります。', exampleTrans: '在这里下车。' },
      { word: '乗り換え', reading: 'ノリカエ', romaji: 'norikae', pos: '名词', meaning: '换乘', example: '乗り換えはありません。', exampleTrans: '不需要换乘。' },
      { word: '改札', reading: 'カイサツ', romaji: 'kaisatsu', pos: '名词', meaning: '检票口', example: '改札を出てください。', exampleTrans: '请出检票口。' },
      { word: '方面', reading: 'ホウメン', romaji: 'houmen', pos: '名词', meaning: '方向', example: '新宿方面の電車です。', exampleTrans: '是开往新宿方向的电车。' },
    ],
    grammars: [
      { pattern: '〜に乗ります', explanation: '表示乘坐交通工具。「に」标记乘坐的对象。', example: '電車に乗ります。', exampleTrans: '坐电车。' },
      { pattern: '〜で降ります', explanation: '表示在某个地点下车。「で」标记动作发生的场所。', example: '次の駅で降ります。', exampleTrans: '在下一站下车。' },
      { pattern: '〜まで', explanation: '表示到达的终点。常与「から」搭配使用。', example: '東京まで行きます。', exampleTrans: '去到东京。' },
    ],
  },
  {
    id: 'ja-greetings',
    lang: 'ja',
    title: '日常问候',
    icon: '👋',
    description: '从早到晚的日式问候语，掌握不同时段和场合的表达',
    level: 'N5',
    day: 4,
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20people%20bowing%20greeting%20each%20other%20morning%20street%20scene&image_size=landscape_4_3',
    words: [
      { word: 'おはよう', reading: 'オハヨウ', romaji: 'ohayou', pos: '感叹词', meaning: '早上好（ casual）', example: 'おはよう！', exampleTrans: '早上好！' },
      { word: 'こんにちは', reading: 'コンニチハ', romaji: 'konnichiwa', pos: '感叹词', meaning: '你好（白天）', example: 'こんにちは、元気ですか。', exampleTrans: '你好，你好吗？' },
      { word: 'こんばんは', reading: 'コンバンワ', romaji: 'konbanwa', pos: '感叹词', meaning: '晚上好', example: 'こんばんは、お元気ですか。', exampleTrans: '晚上好，您还好吗？' },
      { word: 'さようなら', reading: 'サヨウナラ', romaji: 'sayounara', pos: '感叹词', meaning: '再见', example: 'さようなら、また明日。', exampleTrans: '再见，明天见。' },
      { word: 'ありがとう', reading: 'アリガトウ', romaji: 'arigatou', pos: '感叹词', meaning: '谢谢', example: 'ありがとうございます。', exampleTrans: '非常感谢。' },
      { word: 'すみません', reading: 'スミマセン', romaji: 'sumimasen', pos: '感叹词', meaning: '不好意思/对不起', example: 'すみません、駅はどこですか。', exampleTrans: '不好意思，车站在哪里？' },
    ],
    grammars: [
      { pattern: '〜は〜ですか', explanation: '疑问判断句型。句尾加「か」构成疑问句。', example: 'あなたは学生ですか。', exampleTrans: '你是学生吗？' },
      { pattern: '〜ね', explanation: '终助词。表示确认、同意或轻微的感叹。', example: 'いい天気ですね。', exampleTrans: '天气真好啊。' },
    ],
  },
];

/* ========== 视频素材数据 ========== */
export interface VideoLine {
  id: number;
  start: number;    // 秒
  end: number;      // 秒
  japanese: string;     // 日语原文
  reading: string;      // 片假名注音
  romaji: string;       // 罗马音
  chinese: string;      // 中文翻译
}

export interface VideoWordAnalysis {
  word: string;
  reading: string;
  pos: string;
  meaning: string;
}

export interface VideoGrammarAnalysis {
  pattern: string;
  explanation: string;
}

export interface VideoMaterial {
  id: number;
  title: string;
  source: string;
  type: string;          // anime / drama / movie
  level: string;
  duration: number;
  videoUrl: string;
  thumbnail: string;
  lines: VideoLine[];
  wordAnalysis: VideoWordAnalysis[];
  grammarAnalysis: VideoGrammarAnalysis[];
}

const videoMaterials: VideoMaterial[] = [
  {
    id: 1,
    title: '鬼滅の刃 - 鎹鴉の伝令',
    source: '鬼滅の刃',
    type: 'anime',
    level: 'N3',
    duration: 90,
    videoUrl: 'https://www.youtube.com/embed/D5U54E8E4Bo',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Demon%20Slayer%20anime%20crow%20messenger%20scene%20dramatic%20sky&image_size=landscape_16_9',
    lines: [
      { id: 1, start: 0, end: 3, japanese: '来たぞ！来たぞ！新たな任務だ！', reading: 'キタゾ！キタゾ！アラタナニンムダ！', romaji: 'kitazo! kitazo! aratana ninmu da!', chinese: '来了！来了！新任务来了！' },
      { id: 2, start: 3, end: 6, japanese: '次の目的地は那田蜘蛛山だ！', reading: 'ツギノモクテキチハナダグモヤマダ！', romaji: 'tsugi no mokutekichi wa nada gumoyama da!', chinese: '下一个目的地是那田蜘蛛山！' },
      { id: 3, start: 6, end: 9, japanese: '気をつけて行けよ！', reading: 'キヲツケテイケヨ！', romaji: 'ki o tsukete ike yo!', chinese: '小心点去吧！' },
    ],
    wordAnalysis: [
      { word: '来た', reading: 'キタ', pos: '动词（过去）', meaning: '来了（来る的过去式）' },
      { word: 'ぞ', reading: 'ゾ', pos: '终助词', meaning: '男性用语，表示强调或吸引注意' },
      { word: '新たな', reading: 'アラタナ', pos: '连体词', meaning: '新的、前所未有的' },
      { word: '任務', reading: 'ニンム', pos: '名词', meaning: '任务、使命' },
      { word: 'だ', reading: 'ダ', pos: '助动词', meaning: '表示断定（简体）' },
      { word: '次', reading: 'ツギ', pos: '名词', meaning: '下一个' },
      { word: '目的地', reading: 'モクテキチ', pos: '名词', meaning: '目的地' },
      { word: '那田蜘蛛山', reading: 'ナダグモヤマ', pos: '专有名词', meaning: '那田蜘蛛山（地名）' },
      { word: '気をつけて', reading: 'キヲツケテ', pos: '惯用句', meaning: '小心、注意' },
      { word: '行け', reading: 'イケ', pos: '动词（命令形）', meaning: '去吧（行く的命令形）' },
      { word: 'よ', reading: 'ヨ', pos: '终助词', meaning: '表示提醒或强调' },
    ],
    grammarAnalysis: [
      { pattern: '〜だ！', explanation: '简体断定句。名词 + だ 表示「是〜」。动漫中常用于男性角色，语气强烈。' },
      { pattern: '気をつけて', explanation: '惯用表达。「気をつける」（注意）的て形，表示叮嘱对方小心。' },
      { pattern: '命令形 〜行け', explanation: '行く的命令形「行け」，表示强烈命令。动漫中常见，日常很少使用。' },
    ],
  },
  {
    id: 2,
    title: '千と千尋の神隠し - 名前を返して',
    source: '千と千尋の神隠し',
    type: 'anime',
    level: 'N4',
    duration: 60,
    videoUrl: 'https://www.youtube.com/embed/ByXuk9QqQkk',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Spirited%20Away%20anime%20scene%20Haku%20and%20Chihiro%20river%20spirit&image_size=landscape_16_9',
    lines: [
      { id: 4, start: 0, end: 3, japanese: 'ここで働かせてください！', reading: 'ココデハタラカセテクダサイ！', romaji: 'koko de hatarakasete kudasai!', chinese: '请让我在这里工作！' },
      { id: 5, start: 3, end: 6, japanese: '自分の名前を大切にね', reading: 'ジブンノナマエヲタイセツニネ', romaji: 'jibun no namae o taisetsu ni ne', chinese: '要珍惜自己的名字哦' },
    ],
    wordAnalysis: [
      { word: 'ここ', reading: 'ココ', pos: '代词', meaning: '这里' },
      { word: 'で', reading: 'デ', pos: '助词', meaning: '表示动作发生的场所' },
      { word: '働かせて', reading: 'ハタラカセテ', pos: '动词（使役て形）', meaning: '让（我）工作（働く的使役て形）' },
      { word: 'ください', reading: 'クダサイ', pos: '补助动词', meaning: '请' },
      { word: '自分', reading: 'ジブン', pos: '名词', meaning: '自己' },
      { word: '名前', reading: 'ナマエ', pos: '名词', meaning: '名字' },
      { word: 'を', reading: 'ヲ', pos: '助词', meaning: '标记宾语' },
      { word: '大切', reading: 'タイセツ', pos: 'な形容词', meaning: '珍惜、重要' },
      { word: 'に', reading: 'ニ', pos: '助词', meaning: '将な形容词变为副词' },
      { word: 'ね', reading: 'ネ', pos: '终助词', meaning: '表示叮嘱或寻求认同' },
    ],
    grammarAnalysis: [
      { pattern: '〜させてください', explanation: '使役 + てください。表示「请让我做某事」。働く → 働かせる（使役）→ 働かせて（て形）+ ください。' },
      { pattern: 'な形容詞 + にする', explanation: 'な形容词词干 + に + する，表示「使其变得〜」。大切 + に → 珍惜地对待。' },
    ],
  },
  {
    id: 3,
    title: '君の名は - 夕暮れの逢瀬',
    source: '君の名は。',
    type: 'anime',
    level: 'N3',
    duration: 80,
    videoUrl: 'https://www.youtube.com/embed/k1zwT0lDtA8',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Your%20Name%20anime%20sunset%20golden%20hour%20twilight%20scene%20beautiful%20sky&image_size=landscape_16_9',
    lines: [
      { id: 6, start: 0, end: 4, japanese: '夕暮れの逢瀬、大事な時間だ。', reading: 'ユウグレノオウセ、ダイジナジカンダ。', romaji: 'yuugure no ouse, daiji na jikan da.', chinese: '黄昏的相逢，是重要的时刻。' },
      { id: 7, start: 4, end: 8, japanese: 'もう会えないかもしれない。', reading: 'モウアエナイカモシレナイ。', romaji: 'mou aenai kamoshirenai.', chinese: '可能再也见不到了。' },
    ],
    wordAnalysis: [
      { word: '夕暮れ', reading: 'ユウグレ', pos: '名词', meaning: '黄昏、傍晚' },
      { word: '逢瀬', reading: 'オウセ', pos: '名词', meaning: '幽会、相逢（文学用语）' },
      { word: '大事', reading: 'ダイジ', pos: 'な形容词', meaning: '重要的' },
      { word: '時間', reading: 'ジカン', pos: '名词', meaning: '时间' },
      { word: 'もう', reading: 'モウ', pos: '副词', meaning: '再、已经' },
      { word: '会えない', reading: 'アエナイ', pos: '动词（否定）', meaning: '见不到（会える的否定）' },
      { word: 'かもしれない', reading: 'カモシレナイ', pos: '助动词', meaning: '也许、可能' },
    ],
    grammarAnalysis: [
      { pattern: '〜かもしれない', explanation: '表示推测，「也许、可能」。接续：动词普通形 / 名词 + かもしれない。语气比「だろう」不确定性更强。' },
      { pattern: '〜だ', explanation: '简体断定。名词 + だ。文学和动漫中常见，比「です」更直接。' },
    ],
  },
];

/* ========== 翻译任务 ========== */
const translateTasks = [
  { id: 1, language: 'ja', sourceLang: 'ja', targetLang: 'zh', sourceText: '今日はとてもいい天気ですね', sourceInfo: '日常会话', referenceTranslation: '今天天气真好啊', difficulty: 'beginner' },
  { id: 2, language: 'ja', sourceLang: 'ja', targetLang: 'zh', sourceText: '桜が満開で、公園はとても綺麗です。', sourceInfo: '春日描写', referenceTranslation: '樱花盛开，公园非常漂亮。', difficulty: 'intermediate' },
  { id: 3, language: 'ja', sourceLang: 'ja', targetLang: 'zh', sourceText: '電車が遅れたので、会社に遅刻してしまいました。', sourceInfo: '日常倾诉', referenceTranslation: '因为电车晚点，所以上班迟到了。', difficulty: 'intermediate' },
];

/* ========== 手写字符 ========== */
const charsByLang: Record<string, { id: number; character: string; romaji: string; meaning: string }[]> = {
  ja: [
    { id: 1, character: 'あ', romaji: 'a', meaning: '平假名 あ' },
    { id: 2, character: 'い', romaji: 'i', meaning: '平假名 い' },
    { id: 3, character: 'う', romaji: 'u', meaning: '平假名 う' },
    { id: 4, character: 'え', romaji: 'e', meaning: '平假名 え' },
    { id: 5, character: 'お', romaji: 'o', meaning: '平假名 お' },
    { id: 6, character: 'か', romaji: 'ka', meaning: '平假名 か' },
    { id: 7, character: 'き', romaji: 'ki', meaning: '平假名 き' },
    { id: 8, character: 'く', romaji: 'ku', meaning: '平假名 く' },
    { id: 9, character: 'け', romaji: 'ke', meaning: '平假名 け' },
    { id: 10, character: 'こ', romaji: 'ko', meaning: '平假名 こ' },
  ],
};

/* ========== Mock 请求处理 ========== */
function currentUser() {
  return getStored('mock-user', {
    id: 1,
    username: '创作者',
    bio: '用碎片时间创作日语内容。',
    nativeLanguage: 'zh',
    createdAt: new Date().toISOString(),
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

  // 场景课程
  if (path === '/scenes') {
    const lang = query.get('lang') || 'ja';
    return ok(sceneCourses.filter((s) => s.lang === lang)) as T;
  }
  const sceneMatch = path.match(/^\/scenes\/(.+)$/);
  if (sceneMatch) {
    return ok(sceneCourses.find((s) => s.id === sceneMatch[1]) || sceneCourses[0]) as T;
  }

  // 视频素材
  if (path === '/video/materials') {
    return ok(videoMaterials) as T;
  }
  const videoMatch = path.match(/^\/video\/materials\/(\d+)$/);
  if (videoMatch) {
    return ok(videoMaterials.find((m) => m.id === Number(videoMatch[1])) || videoMaterials[0]) as T;
  }

  // 翻译任务
  if (path === '/translate/daily') return ok(translateTasks[0]) as T;
  if (path === '/translate/tasks') {
    const lang = query.get('lang');
    return ok(translateTasks.filter((t) => !lang || t.language === lang)) as T;
  }
  if (path === '/translate/submit') {
    const list = getStored<any[]>('mock-translations', []);
    const task = translateTasks.find((t) => t.id === Number(body.taskId)) || translateTasks[0];
    list.unshift({ id: Date.now(), originalText: task.sourceText, translatedText: body.translatedText, likesCount: 0, createdAt: new Date().toISOString() });
    setStored('mock-translations', list);
    return ok({ submitted: true }) as T;
  }
  if (path === '/translate/community') {
    return ok(getStored('mock-translations', [])) as T;
  }
  const transLikeMatch = path.match(/^\/translate\/community\/(\d+)\/like$/);
  if (transLikeMatch) {
    const list = getStored<any[]>('mock-translations', []);
    const item = list.find((t) => t.id === Number(transLikeMatch[1]));
    if (item) { item.likesCount = (item.likesCount || 0) + 1; item.liked = true; setStored('mock-translations', list); }
    return ok({ liked: true }) as T;
  }

  // 手写练习
  if (path === '/handwriting/chars') return ok(charsByLang[query.get('lang') || 'ja'] || charsByLang.ja) as T;
  if (path === '/handwriting/works') {
    if (method === 'POST') {
      const list = getStored<any[]>('mock-handwriting', []);
      list.unshift({ id: Date.now(), language: body.language || 'ja', characterText: body.characterText, likesCount: 0, createdAt: new Date().toISOString() });
      setStored('mock-handwriting', list);
      return ok({ saved: true }) as T;
    }
    const lang = query.get('lang');
    const works = getStored<any[]>('mock-handwriting', []);
    return ok(lang ? works.filter((w) => w.language === lang) : works) as T;
  }

  // 我的作品
  if (path === '/works') {
    const dubWorks = getStored<any[]>('mock-dub-works', []);
    const translations = getStored<any[]>('mock-translations', []);
    const handwriting = getStored<any[]>('mock-handwriting', []);
    return ok({ dubWorks, translations, handwriting }) as T;
  }

  // 用户资料
  if (path === '/users/profile') {
    if (method === 'PUT') {
      const user = { ...currentUser(), ...body };
      setStored('mock-user', user);
      return ok(user) as T;
    }
    return ok(currentUser()) as T;
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
