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

export const sceneCourses: SceneCourse[] = [
  {
    id: "ja-fruits",
    lang: "ja",
    title: "水果",
    icon: "🍎",
    description: "学习各种水果的日语表达，从常见的苹果到日本特有的水果",
    level: "N5",
    day: 1,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20fruits%20assortment%20flat%20lay%20photography%20apples%20strawberries%20persimmons%20on%20wooden%20table&image_size=landscape_4_3",
    words: [
      { word: "りんご", reading: "リンゴ", romaji: "ringo", pos: "名词", meaning: "苹果", example: "りんごを食べます。", exampleTrans: "吃苹果。" },
      { word: "みかん", reading: "ミカン", romaji: "mikan", pos: "名词", meaning: "橘子", example: "みかんは甘いです。", exampleTrans: "橘子很甜。" },
      { word: "いちご", reading: "イチゴ", romaji: "ichigo", pos: "名词", meaning: "草莓", example: "いちごが大好きです。", exampleTrans: "我最喜欢草莓了。" },
      { word: "バナナ", reading: "バナナ", romaji: "banana", pos: "名词", meaning: "香蕉", example: "バナナを買いました。", exampleTrans: "买了香蕉。" },
      { word: "ぶどう", reading: "ブドウ", romaji: "budou", pos: "名词", meaning: "葡萄", example: "ぶどうは秋が旬です。", exampleTrans: "葡萄秋天当季。" },
      { word: "もも", reading: "モモ", romaji: "momo", pos: "名词", meaning: "桃子", example: "ももを食べたいです。", exampleTrans: "想吃桃子。" },
      { word: "すいか", reading: "スイカ", romaji: "suika", pos: "名词", meaning: "西瓜", example: "夏はすいかが美味しいです。", exampleTrans: "夏天西瓜很好吃。" },
      { word: "なし", reading: "ナシ", romaji: "nashi", pos: "名词", meaning: "梨", example: "なしを剥いてください。", exampleTrans: "请削梨皮。" },
    ],
    grammars: [
      { pattern: "〜は〜です", explanation: "基本判断句型。「は」提示主题，「です」表示敬体断定。", example: "これはりんごです。", exampleTrans: "这是苹果。" },
      { pattern: "〜を食べます", explanation: "「を」标记他动词的宾语，表示动作的对象。", example: "みかんを食べます。", exampleTrans: "吃橘子。" },
      { pattern: "〜が好きです", explanation: "表示喜好。「が」标记喜欢的对象。", example: "いちごが好きです。", exampleTrans: "喜欢草莓。" },
    ],
  },
  {
    id: "ja-restaurant",
    lang: "ja",
    title: "餐厅点餐",
    icon: "🍽️",
    description: "从进店到点餐、结账的完整流程，掌握餐厅场景用语",
    level: "N5",
    day: 2,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20restaurant%20interior%20izakaya%20warm%20lighting%20menu%20on%20table&image_size=landscape_4_3",
    words: [
      { word: "メニュー", reading: "メニュー", romaji: "menyuu", pos: "名词", meaning: "菜单", example: "メニューをください。", exampleTrans: "请给我菜单。" },
      { word: "注文", reading: "チュウモン", romaji: "chuumon", pos: "名词/する动词", meaning: "点餐", example: "注文をお願いします。", exampleTrans: "我要点餐。" },
      { word: "お水", reading: "オミズ", romaji: "omizu", pos: "名词", meaning: "水", example: "お水をお願いします。", exampleTrans: "请给我水。" },
      { word: "お会計", reading: "オカイケイ", romaji: "okaikei", pos: "名词", meaning: "结账", example: "お会計をお願いします。", exampleTrans: "请结账。" },
      { word: "定食", reading: "テイショク", romaji: "teishoku", pos: "名词", meaning: "套餐", example: "定食を一つください。", exampleTrans: "请给我一份套餐。" },
      { word: "美味しい", reading: "オイシイ", romaji: "oishii", pos: "い形容词", meaning: "好吃的", example: "とても美味しいです。", exampleTrans: "非常好吃。" },
      { word: "注文する", reading: "チュウモンスル", romaji: "chuumon suru", pos: "する动词", meaning: "下单", example: "これを注文します。", exampleTrans: "点这个。" },
    ],
    grammars: [
      { pattern: "〜をお願いします", explanation: "礼貌请求句型。请求对方做某事或提供某物。", example: "メニューをお願いします。", exampleTrans: "请给我菜单。" },
      { pattern: "〜をください", explanation: "请求给予某物。「を」标记宾语，「ください」表示请给我。", example: "お水をください。", exampleTrans: "请给我水。" },
      { pattern: "〜を一つください", explanation: "数量表达。「一つ」表示一个，可替换为二つ、三つ等。", example: "定食を一つください。", exampleTrans: "请给我一份套餐。" },
    ],
  },
  {
    id: "ja-subway",
    lang: "ja",
    title: "坐地铁",
    icon: "🚇",
    description: "东京地铁出行全流程：购票、问路、换乘",
    level: "N4",
    day: 3,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tokyo%20subway%20station%20platform%20train%20arriving%20signage%20in%20Japanese&image_size=landscape_4_3",
    words: [
      { word: "切符", reading: "キップ", romaji: "kippu", pos: "名词", meaning: "车票", example: "切符を買います。", exampleTrans: "买车票。" },
      { word: "駅", reading: "エキ", romaji: "eki", pos: "名词", meaning: "车站", example: "次の駅で降ります。", exampleTrans: "在下一站下车。" },
      { word: "乗る", reading: "ノル", romaji: "noru", pos: "五段动词", meaning: "乘坐", example: "電車に乗ります。", exampleTrans: "坐电车。" },
      { word: "降りる", reading: "オリル", romaji: "oriru", pos: "一段动词", meaning: "下车", example: "ここで降ります。", exampleTrans: "在这里下车。" },
      { word: "乗り換え", reading: "ノリカエ", romaji: "norikae", pos: "名词", meaning: "换乘", example: "乗り換えはありません。", exampleTrans: "不需要换乘。" },
      { word: "改札", reading: "カイサツ", romaji: "kaisatsu", pos: "名词", meaning: "检票口", example: "改札を出てください。", exampleTrans: "请出检票口。" },
      { word: "方面", reading: "ホウメン", romaji: "houmen", pos: "名词", meaning: "方向", example: "新宿方面の電車です。", exampleTrans: "是开往新宿方向的电车。" },
    ],
    grammars: [
      { pattern: "〜に乗ります", explanation: "表示乘坐交通工具。「に」标记乘坐的对象。", example: "電車に乗ります。", exampleTrans: "坐电车。" },
      { pattern: "〜で降ります", explanation: "表示在某个地点下车。「で」标记动作发生的场所。", example: "次の駅で降ります。", exampleTrans: "在下一站下车。" },
      { pattern: "〜まで", explanation: "表示到达的终点。常与「から」搭配使用。", example: "東京まで行きます。", exampleTrans: "去到东京。" },
    ],
  },
  {
    id: "ja-greetings",
    lang: "ja",
    title: "日常问候",
    icon: "👋",
    description: "从早到晚的日式问候语，掌握不同时段和场合的表达",
    level: "N5",
    day: 4,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20people%20bowing%20greeting%20each%20other%20morning%20street%20scene&image_size=landscape_4_3",
    words: [
      { word: "おはよう", reading: "オハヨウ", romaji: "ohayou", pos: "感叹词", meaning: "早上好", example: "おはよう！", exampleTrans: "早上好！" },
      { word: "こんにちは", reading: "コンニチハ", romaji: "konnichiwa", pos: "感叹词", meaning: "你好", example: "こんにちは、元気ですか。", exampleTrans: "你好，你好吗？" },
      { word: "こんばんは", reading: "コンバンワ", romaji: "konbanwa", pos: "感叹词", meaning: "晚上好", example: "こんばんは、お元気ですか。", exampleTrans: "晚上好，您还好吗？" },
      { word: "さようなら", reading: "サヨウナラ", romaji: "sayounara", pos: "感叹词", meaning: "再见", example: "さようなら、また明日。", exampleTrans: "再见，明天见。" },
      { word: "ありがとう", reading: "アリガトウ", romaji: "arigatou", pos: "感叹词", meaning: "谢谢", example: "ありがとうございます。", exampleTrans: "非常感谢。" },
      { word: "すみません", reading: "スミマセン", romaji: "sumimasen", pos: "感叹词", meaning: "不好意思", example: "すみません、駅はどこですか。", exampleTrans: "不好意思，车站在哪里？" },
    ],
    grammars: [
      { pattern: "〜は〜ですか", explanation: "疑问判断句型。句尾加「か」构成疑问句。", example: "あなたは学生ですか。", exampleTrans: "你是学生吗？" },
      { pattern: "〜ね", explanation: "终助词。表示确认、同意或轻微的感叹。", example: "いい天気ですね。", exampleTrans: "天气真好啊。" },
    ],
  },
  {
    id: "ja-shopping",
    lang: "ja",
    title: "购物",
    icon: "🛍️",
    description: "在药妆店、百货商场购物的常用表达",
    level: "N4",
    day: 5,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20shopping%20street%20shibuya%20don%20quijote%20store%20colorful%20signs&image_size=landscape_4_3",
    words: [
      { word: "いくら", reading: "イクラ", romaji: "ikura", pos: "疑问词", meaning: "多少钱", example: "これはいくらですか。", exampleTrans: "这个多少钱？" },
      { word: "安い", reading: "ヤスイ", romaji: "yasui", pos: "い形容词", meaning: "便宜的", example: "もっと安いのはありますか。", exampleTrans: "有更便宜的吗？" },
      { word: "高い", reading: "タカイ", romaji: "takai", pos: "い形容词", meaning: "贵的", example: "ちょっと高いですね。", exampleTrans: "有点贵呢。" },
      { word: "試着", reading: "シチャク", romaji: "shichaku", pos: "名词/する动词", meaning: "试穿", example: "試着してもいいですか。", exampleTrans: "可以试穿吗？" },
      { word: "サイズ", reading: "サイズ", romaji: "saizu", pos: "名词", meaning: "尺寸", example: "Mサイズはありますか。", exampleTrans: "有M码吗？" },
      { word: "免税", reading: "メンゼイ", romaji: "menzei", pos: "名词", meaning: "免税", example: "免税でお願いします。", exampleTrans: "请帮我免税。" },
      { word: "袋", reading: "フクロ", romaji: "fukuro", pos: "名词", meaning: "袋子", example: "袋をください。", exampleTrans: "请给我袋子。" },
      { word: "レシート", reading: "レシート", romaji: "reshiito", pos: "名词", meaning: "收据", example: "レシートをください。", exampleTrans: "请给我收据。" },
    ],
    grammars: [
      { pattern: "〜はいくらですか", explanation: "询问价格的标准句型。", example: "このバッグはいくらですか。", exampleTrans: "这个包多少钱？" },
      { pattern: "〜てもいいですか", explanation: "请求许可。", example: "試着してもいいですか。", exampleTrans: "可以试穿吗？" },
      { pattern: "〜はありますか", explanation: "询问是否有某物。", example: "もっと大きいサイズはありますか。", exampleTrans: "有更大的尺寸吗？" },
    ],
  },
  {
    id: "ja-weather",
    lang: "ja",
    title: "天气",
    icon: "☀️",
    description: "描述天气的形容词和表达，从晴天到台风",
    level: "N5",
    day: 6,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japan%20four%20seasons%20cherry%20blossom%20spring%20autumn%20leaves%20winter%20snow%20summer%20beach&image_size=landscape_4_3",
    words: [
      { word: "天気", reading: "テンキ", romaji: "tenki", pos: "名词", meaning: "天气", example: "今日はいい天気ですね。", exampleTrans: "今天天气真好啊。" },
      { word: "晴れ", reading: "ハレ", romaji: "hare", pos: "名词", meaning: "晴天", example: "明日は晴れです。", exampleTrans: "明天是晴天。" },
      { word: "曇り", reading: "クモリ", romaji: "kumori", pos: "名词", meaning: "阴天", example: "今日は曇りです。", exampleTrans: "今天是阴天。" },
      { word: "雨", reading: "アメ", romaji: "ame", pos: "名词", meaning: "雨", example: "雨が降っています。", exampleTrans: "正在下雨。" },
      { word: "雪", reading: "ユキ", romaji: "yuki", pos: "名词", meaning: "雪", example: "雪が降ってきました。", exampleTrans: "开始下雪了。" },
      { word: "風", reading: "カゼ", romaji: "kaze", pos: "名词", meaning: "风", example: "風が強いです。", exampleTrans: "风很大。" },
      { word: "暑い", reading: "アツイ", romaji: "atsui", pos: "い形容词", meaning: "热的", example: "今日はとても暑いです。", exampleTrans: "今天非常热。" },
      { word: "寒い", reading: "サムイ", romaji: "samui", pos: "い形容词", meaning: "冷的", example: "冬は寒いです。", exampleTrans: "冬天很冷。" },
      { word: "台風", reading: "タイフウ", romaji: "taifuu", pos: "名词", meaning: "台风", example: "台風が近づいています。", exampleTrans: "台风正在靠近。" },
    ],
    grammars: [
      { pattern: "〜が降っています", explanation: "描述自然现象正在进行。", example: "雨が降っています。", exampleTrans: "正在下雨。" },
      { pattern: "〜が強いです", explanation: "描述某物强度大。", example: "風が強いです。", exampleTrans: "风很大。" },
      { pattern: "〜てきました", explanation: "表示变化开始发生。", example: "寒くなってきました。", exampleTrans: "开始变冷了。" },
    ],
  },
  {
    id: "ja-hospital",
    lang: "ja",
    title: "医院看病",
    icon: "🏥",
    description: "在日本看病就医的完整流程",
    level: "N3",
    day: 7,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20hospital%20clinic%20waiting%20room%20doctor%20examination%20clean%20modern&image_size=landscape_4_3",
    words: [
      { word: "病院", reading: "ビョウイン", romaji: "byouin", pos: "名词", meaning: "医院", example: "病院に行きます。", exampleTrans: "去医院。" },
      { word: "頭痛", reading: "ズツウ", romaji: "zutsuu", pos: "名词", meaning: "头痛", example: "頭痛がします。", exampleTrans: "头痛。" },
      { word: "熱", reading: "ネツ", romaji: "netsu", pos: "名词", meaning: "发烧", example: "熱があります。", exampleTrans: "发烧了。" },
      { word: "咳", reading: "セキ", romaji: "seki", pos: "名词", meaning: "咳嗽", example: "咳が出ます。", exampleTrans: "咳嗽。" },
      { word: "薬", reading: "クスリ", romaji: "kusuri", pos: "名词", meaning: "药", example: "薬をください。", exampleTrans: "请给我药。" },
      { word: "保険証", reading: "ホケンショウ", romaji: "hokenshou", pos: "名词", meaning: "保险证", example: "保険証を見せてください。", exampleTrans: "请出示保险证。" },
      { word: "予約", reading: "ヨヤク", romaji: "yoyaku", pos: "名词/する动词", meaning: "预约", example: "予約をしたいです。", exampleTrans: "我想预约。" },
    ],
    grammars: [
      { pattern: "〜がします", explanation: "表示身体感受到的症状。", example: "頭痛がします。", exampleTrans: "头痛。" },
      { pattern: "〜があります", explanation: "表示存在某种状态或症状。", example: "熱があります。", exampleTrans: "发烧了。" },
      { pattern: "〜を見せてください", explanation: "请求对方出示某物。", example: "保険証を見せてください。", exampleTrans: "请出示保险证。" },
    ],
  },
  {
    id: "ja-hotel",
    lang: "ja",
    title: "酒店入住",
    icon: "🏨",
    description: "预订、入住、退房的完整日语表达",
    level: "N4",
    day: 8,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20ryokan%20traditional%20inn%20tatami%20room%20futon%20sliding%20door%20warm%20lighting&image_size=landscape_4_3",
    words: [
      { word: "予約", reading: "ヨヤク", romaji: "yoyaku", pos: "名词/する动词", meaning: "预约", example: "予約を確認したいです。", exampleTrans: "我想确认预约。" },
      { word: "チェックイン", reading: "チェックイン", romaji: "chekkuin", pos: "名词/する动词", meaning: "入住", example: "チェックインをお願いします。", exampleTrans: "请帮我办理入住。" },
      { word: "チェックアウト", reading: "チェックアウト", romaji: "chekkuauto", pos: "名词/する动词", meaning: "退房", example: "チェックアウトは何時ですか。", exampleTrans: "退房是几点？" },
      { word: "部屋", reading: "ヘヤ", romaji: "heya", pos: "名词", meaning: "房间", example: "部屋の番号は何ですか。", exampleTrans: "房间号是多少？" },
      { word: "鍵", reading: "カギ", romaji: "kagi", pos: "名词", meaning: "钥匙", example: "鍵をください。", exampleTrans: "请给我钥匙。" },
      { word: "朝食", reading: "チョウショク", romaji: "choushoku", pos: "名词", meaning: "早餐", example: "朝食は何時からですか。", exampleTrans: "早餐几点开始？" },
      { word: "温泉", reading: "オンセン", romaji: "onsen", pos: "名词", meaning: "温泉", example: "温泉に入りたいです。", exampleTrans: "想泡温泉。" },
      { word: "パスポート", reading: "パスポート", romaji: "pasupooto", pos: "名词", meaning: "护照", example: "パスポートを見せてください。", exampleTrans: "请出示护照。" },
    ],
    grammars: [
      { pattern: "〜をお願いします", explanation: "请求服务时的万能句型。", example: "チェックインをお願いします。", exampleTrans: "请帮我办理入住。" },
      { pattern: "〜は何時ですか", explanation: "询问时间。", example: "チェックアウトは何時ですか。", exampleTrans: "退房是几点？" },
      { pattern: "〜たいです", explanation: "表示愿望。", example: "温泉に入りたいです。", exampleTrans: "想泡温泉。" },
    ],
  },
  {
    id: "ja-taxi",
    lang: "ja",
    title: "打车与问路",
    icon: "🚕",
    description: "日本出租车礼仪、打车用语、问路指路",
    level: "N4",
    day: 9,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tokyo%20taxi%20cab%20street%20city%20night%20neon%20signs%20Japanese%20urban&image_size=landscape_4_3",
    words: [
      { word: "タクシー", reading: "タクシー", romaji: "takushii", pos: "名词", meaning: "出租车", example: "タクシーを呼んでください。", exampleTrans: "请帮我叫出租车。" },
      { word: "ここ", reading: "ココ", romaji: "koko", pos: "代词", meaning: "这里", example: "ここで止めてください。", exampleTrans: "请在这里停。" },
      { word: "そこ", reading: "ソコ", romaji: "soko", pos: "代词", meaning: "那里", example: "そこを右に曲がってください。", exampleTrans: "请在那里右转。" },
      { word: "まっすぐ", reading: "マッスグ", romaji: "massugu", pos: "副词", meaning: "一直", example: "まっすぐ行ってください。", exampleTrans: "请直走。" },
      { word: "右", reading: "ミギ", romaji: "migi", pos: "名词", meaning: "右边", example: "右に曲がってください。", exampleTrans: "请右转。" },
      { word: "左", reading: "ヒダリ", romaji: "hidari", pos: "名词", meaning: "左边", example: "左側です。", exampleTrans: "在左边。" },
      { word: "交差点", reading: "コウサテン", romaji: "kousaten", pos: "名词", meaning: "十字路口", example: "次の交差点を左に曲がってください。", exampleTrans: "请在下一个十字路口左转。" },
      { word: "信号", reading: "シンゴウ", romaji: "shingou", pos: "名词", meaning: "红绿灯", example: "信号のところで止めてください。", exampleTrans: "请在红绿灯那里停。" },
      { word: "住所", reading: "ジュウショ", romaji: "juusho", pos: "名词", meaning: "地址", example: "この住所までお願いします。", exampleTrans: "请到这个地址。" },
    ],
    grammars: [
      { pattern: "〜てください", explanation: "请求对方做某事。", example: "まっすぐ行ってください。", exampleTrans: "请直走。" },
      { pattern: "〜を〜に曲がる", explanation: "表示转弯方向。", example: "次の交差点を右に曲がってください。", exampleTrans: "请在下一个十字路口右转。" },
      { pattern: "〜までお願いします", explanation: "告知目的地。", example: "東京駅までお願いします。", exampleTrans: "请到东京站。" },
    ],
  },
  {
    id: "ja-school",
    lang: "ja",
    title: "学校生活",
    icon: "🏫",
    description: "教室、图书馆、社团活动的日语表达",
    level: "N4",
    day: 10,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20school%20classroom%20students%20uniform%20cherry%20blossom%20outside%20window&image_size=landscape_4_3",
    words: [
      { word: "学校", reading: "ガッコウ", romaji: "gakkou", pos: "名词", meaning: "学校", example: "学校に行きます。", exampleTrans: "去学校。" },
      { word: "先生", reading: "センセイ", romaji: "sensei", pos: "名词", meaning: "老师", example: "先生に質問があります。", exampleTrans: "有问题想问老师。" },
      { word: "宿題", reading: "シュクダイ", romaji: "shukudai", pos: "名词", meaning: "作业", example: "宿題を忘れました。", exampleTrans: "忘带作业了。" },
      { word: "試験", reading: "シケン", romaji: "shiken", pos: "名词", meaning: "考试", example: "来週試験があります。", exampleTrans: "下周有考试。" },
      { word: "図書館", reading: "トショカン", romaji: "toshokan", pos: "名词", meaning: "图书馆", example: "図書館で勉強します。", exampleTrans: "在图书馆学习。" },
      { word: "部活", reading: "ブカツ", romaji: "bukatsu", pos: "名词", meaning: "社团活动", example: "部活に入りたいです。", exampleTrans: "想加入社团。" },
      { word: "友達", reading: "トモダチ", romaji: "tomodachi", pos: "名词", meaning: "朋友", example: "友達とランチを食べます。", exampleTrans: "和朋友一起吃午饭。" },
      { word: "教科書", reading: "キョウカショ", romaji: "kyoukasho", pos: "名词", meaning: "教科书", example: "教科書を忘れました。", exampleTrans: "忘带教科书了。" },
    ],
    grammars: [
      { pattern: "〜に〜があります", explanation: "表示在某处有某物或某事。", example: "先生に質問があります。", exampleTrans: "有问题想问老师。" },
      { pattern: "〜で勉強します", explanation: "で标记动作进行的场所。", example: "図書館で勉強します。", exampleTrans: "在图书馆学习。" },
      { pattern: "〜に入りたいです", explanation: "表示想加入某个组织。", example: "部活に入りたいです。", exampleTrans: "想加入社团。" },
    ],
  },
  {
    id: "ja-workplace",
    lang: "ja",
    title: "职场敬语",
    icon: "💼",
    description: "日本职场必备的敬语表达",
    level: "N3",
    day: 11,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20office%20business%20meeting%20salarymen%20suits%20conference%20room&image_size=landscape_4_3",
    words: [
      { word: "お世話になっております", reading: "オセワニナッテオリマス", romaji: "osewa ni natte orimasu", pos: "寒暄语", meaning: "承蒙关照", example: "いつもお世話になっております。", exampleTrans: "一直承蒙关照。" },
      { word: "申し訳ありません", reading: "モウシワケアリマセン", romaji: "moushiwake arimasen", pos: "寒暄语", meaning: "非常抱歉", example: "申し訳ありません、遅れました。", exampleTrans: "非常抱歉，我迟到了。" },
      { word: "よろしくお願いいたします", reading: "ヨロシクオネガイイタシマス", romaji: "yoroshiku onegai itashimasu", pos: "寒暄语", meaning: "请多关照", example: "これからよろしくお願いいたします。", exampleTrans: "今后请多多关照。" },
      { word: "失礼いたします", reading: "シツレイイタシマス", romaji: "shitsurei itashimasu", pos: "寒暄语", meaning: "告辞了", example: "お先に失礼いたします。", exampleTrans: "我先告辞了。" },
      { word: "承知いたしました", reading: "ショウチイタシマシタ", romaji: "shouchi itashimashita", pos: "寒暄语", meaning: "我知道了", example: "承知いたしました。すぐに対応します。", exampleTrans: "明白了。马上处理。" },
      { word: "会議", reading: "カイギ", romaji: "kaigi", pos: "名词", meaning: "会议", example: "午後2時から会議があります。", exampleTrans: "下午2点有会议。" },
      { word: "資料", reading: "シリョウ", romaji: "shiryou", pos: "名词", meaning: "资料", example: "資料を送ります。", exampleTrans: "我把资料发过去。" },
      { word: "確認", reading: "カクニン", romaji: "kakunin", pos: "名词/する动词", meaning: "确认", example: "確認していただけますか。", exampleTrans: "能请您确认一下吗？" },
    ],
    grammars: [
      { pattern: "お〜になります", explanation: "尊敬语。表示对对方动作的尊敬。", example: "お帰りになりますか。", exampleTrans: "您要回去了吗？" },
      { pattern: "〜させていただきます", explanation: "谦让语。请允许我做某事。", example: "ご説明させていただきます。", exampleTrans: "请允许我为您说明。" },
      { pattern: "〜ていただけますか", explanation: "请求对方做某事。", example: "確認していただけますか。", exampleTrans: "能请您确认一下吗？" },
    ],
  },
  {
    id: "ja-convenience",
    lang: "ja",
    title: "便利店",
    icon: "🏪",
    description: "在便利店买便当、加热、复印、取款",
    level: "N5",
    day: 12,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20convenience%20store%20konbini%20interior%20bento%20shelves%20bright%20lighting&image_size=landscape_4_3",
    words: [
      { word: "コンビニ", reading: "コンビニ", romaji: "konbini", pos: "名词", meaning: "便利店", example: "コンビニに行きます。", exampleTrans: "去便利店。" },
      { word: "お弁当", reading: "オベントウ", romaji: "obentou", pos: "名词", meaning: "便当", example: "お弁当を温めてください。", exampleTrans: "请帮我加热便当。" },
      { word: "温める", reading: "アタタメル", romaji: "atatameru", pos: "一段动词", meaning: "加热", example: "これを温めてください。", exampleTrans: "请帮我加热这个。" },
      { word: "おにぎり", reading: "オニギリ", romaji: "onigiri", pos: "名词", meaning: "饭团", example: "おにぎりを2つください。", exampleTrans: "请给我两个饭团。" },
      { word: "お箸", reading: "オハシ", romaji: "ohashi", pos: "名词", meaning: "筷子", example: "お箸をつけてください。", exampleTrans: "请放筷子。" },
      { word: "コピー", reading: "コピー", romaji: "kopii", pos: "名词/する动词", meaning: "复印", example: "コピーをお願いします。", exampleTrans: "请帮我复印。" },
      { word: "ATM", reading: "エーティーエム", romaji: "ee-tii-emu", pos: "名词", meaning: "ATM取款机", example: "ATMはどこですか。", exampleTrans: "ATM在哪里？" },
      { word: "レジ袋", reading: "レジブクロ", romaji: "rejibukuro", pos: "名词", meaning: "购物袋", example: "レジ袋をください。", exampleTrans: "请给我购物袋。" },
    ],
    grammars: [
      { pattern: "〜をつけてください", explanation: "请求附上某物。", example: "お箸をつけてください。", exampleTrans: "请放筷子。" },
      { pattern: "〜を温めてください", explanation: "请求加热。", example: "お弁当を温めてください。", exampleTrans: "请帮我加热便当。" },
      { pattern: "〜はどこですか", explanation: "询问地点。", example: "ATMはどこですか。", exampleTrans: "ATM在哪里？" },
    ],
  },
  {
    id: "ja-cafe",
    lang: "ja",
    title: "咖啡馆",
    icon: "☕",
    description: "在日本咖啡馆点单、选座位、续杯的完整表达",
    level: "N5",
    day: 13,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20kissaten%20cozy%20coffee%20shop%20latte%20art%20wooden%20interior%20warm%20atmosphere&image_size=landscape_4_3",
    words: [
      { word: "コーヒー", reading: "コーヒー", romaji: "koohii", pos: "名词", meaning: "咖啡", example: "コーヒーをください。", exampleTrans: "请给我咖啡。" },
      { word: "紅茶", reading: "コウチャ", romaji: "koucha", pos: "名词", meaning: "红茶", example: "紅茶はありますか。", exampleTrans: "有红茶吗？" },
      { word: "砂糖", reading: "サトウ", romaji: "satou", pos: "名词", meaning: "糖", example: "砂糖を入れます。", exampleTrans: "放糖。" },
      { word: "ミルク", reading: "ミルク", romaji: "miruku", pos: "名词", meaning: "牛奶", example: "ミルクをください。", exampleTrans: "请给我牛奶。" },
      { word: "席", reading: "セキ", romaji: "seki", pos: "名词", meaning: "座位", example: "席はありますか。", exampleTrans: "有空位吗？" },
      { word: "喫茶店", reading: "キッサテン", romaji: "kissaten", pos: "名词", meaning: "日式咖啡馆", example: "喫茶店に入ります。", exampleTrans: "进入咖啡馆。" },
      { word: "ケーキ", reading: "ケーキ", romaji: "keeki", pos: "名词", meaning: "蛋糕", example: "チョコレートケーキをください。", exampleTrans: "请给我巧克力蛋糕。" },
      { word: "おかわり", reading: "オカワリ", romaji: "okawari", pos: "名词", meaning: "续杯", example: "コーヒーのおかわりをください。", exampleTrans: "请再给我一杯咖啡。" },
    ],
    grammars: [
      { pattern: "〜をください", explanation: "点餐基本句型。", example: "コーヒーをください。", exampleTrans: "请给我咖啡。" },
      { pattern: "〜はありますか", explanation: "询问是否有某物。", example: "紅茶はありますか。", exampleTrans: "有红茶吗？" },
      { pattern: "〜に入ります", explanation: "表示进入某个场所。", example: "喫茶店に入ります。", exampleTrans: "进入咖啡馆。" },
    ],
  },
  {
    id: "ja-izakaya",
    lang: "ja",
    title: "居酒屋",
    icon: "🍶",
    description: "居酒屋点酒、下酒菜、干杯的完整日语",
    level: "N4",
    day: 14,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20izakaya%20restaurant%20lanterns%20sake%20bottles%20counter%20bar%20night&image_size=landscape_4_3",
    words: [
      { word: "ビール", reading: "ビール", romaji: "biiru", pos: "名词", meaning: "啤酒", example: "ビールを一本ください。", exampleTrans: "请给我一瓶啤酒。" },
      { word: "日本酒", reading: "ニホンシュ", romaji: "nihonshu", pos: "名词", meaning: "日本酒", example: "日本酒はおすすめは何ですか。", exampleTrans: "日本酒有什么推荐？" },
      { word: "お通し", reading: "オトオシ", romaji: "otooshi", pos: "名词", meaning: "开胃小菜", example: "お通しは何ですか。", exampleTrans: "开胃小菜是什么？" },
      { word: "枝豆", reading: "エダマメ", romaji: "edamame", pos: "名词", meaning: "毛豆", example: "枝豆を一つください。", exampleTrans: "请来一份毛豆。" },
      { word: "焼き鳥", reading: "ヤキトリ", romaji: "yakitori", pos: "名词", meaning: "烤鸡串", example: "焼き鳥が人気です。", exampleTrans: "烤鸡串很受欢迎。" },
      { word: "乾杯", reading: "カンパイ", romaji: "kanpai", pos: "名词/する动词", meaning: "干杯", example: "皆さん、乾杯しましょう！", exampleTrans: "大家干杯吧！" },
      { word: "おかわり", reading: "オカワリ", romaji: "okawari", pos: "名词", meaning: "再来一杯", example: "おかわりをお願いします。", exampleTrans: "请再来一杯。" },
      { word: "締め", reading: "シメ", romaji: "shime", pos: "名词", meaning: "收尾", example: "最後にラーメンで締めましょう。", exampleTrans: "最后吃碗拉面收尾吧。" },
    ],
    grammars: [
      { pattern: "〜を一本ください", explanation: "量词「本」用于细长物品。", example: "ビールを一本ください。", exampleTrans: "请给我一瓶啤酒。" },
      { pattern: "〜はおすすめは何ですか", explanation: "询问推荐菜品。", example: "今日のおすすめは何ですか。", exampleTrans: "今天的推荐是什么？" },
      { pattern: "〜しましょう", explanation: "劝诱形。让我们…吧。", example: "乾杯しましょう！", exampleTrans: "干杯吧！" },
    ],
  },
  {
    id: "ja-sushi",
    lang: "ja",
    title: "寿司店",
    icon: "🍣",
    description: "回转寿司、寿司店点单、常见寿司名",
    level: "N4",
    day: 15,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20sushi%20restaurant%20omakase%20chef%20preparing%20fresh%20fish%20counter&image_size=landscape_4_3",
    words: [
      { word: "寿司", reading: "スシ", romaji: "sushi", pos: "名词", meaning: "寿司", example: "寿司が大好きです。", exampleTrans: "非常喜欢寿司。" },
      { word: "回転寿司", reading: "カイテンズシ", romaji: "kaiten zushi", pos: "名词", meaning: "回转寿司", example: "回転寿司に行きましょう。", exampleTrans: "去吃回转寿司吧。" },
      { word: "マグロ", reading: "マグロ", romaji: "maguro", pos: "名词", meaning: "金枪鱼", example: "マグロを一皿ください。", exampleTrans: "来一盘金枪鱼。" },
      { word: "サーモン", reading: "サーモン", romaji: "saamon", pos: "名词", meaning: "三文鱼", example: "サーモンは人気です。", exampleTrans: "三文鱼很受欢迎。" },
      { word: "わさび", reading: "ワサビ", romaji: "wasabi", pos: "名词", meaning: "山葵", example: "わさび抜きでお願いします。", exampleTrans: "请不要放芥末。" },
      { word: "醤油", reading: "ショウユ", romaji: "shouyu", pos: "名词", meaning: "酱油", example: "醤油を少しつけます。", exampleTrans: "蘸一点酱油。" },
      { word: "おあがり", reading: "オアガリ", romaji: "oagari", pos: "名词", meaning: "茶", example: "おあがりをください。", exampleTrans: "请给我茶。" },
      { word: "お会計", reading: "オカイケイ", romaji: "okaikei", pos: "名词", meaning: "结账", example: "お会計をお願いします。", exampleTrans: "请结账。" },
    ],
    grammars: [
      { pattern: "〜が大好きです", explanation: "表示非常喜欢。", example: "寿司が大好きです。", exampleTrans: "非常喜欢寿司。" },
      { pattern: "〜抜きで", explanation: "表示去掉、不要。", example: "わさび抜きでお願いします。", exampleTrans: "请不要放芥末。" },
      { pattern: "〜を一皿ください", explanation: "量词「皿」用于一盘食物。", example: "マグロを一皿ください。", exampleTrans: "来一盘金枪鱼。" },
    ],
  },
  {
    id: "ja-ramen",
    lang: "ja",
    title: "拉面店",
    icon: "🍜",
    description: "拉面店点单、口味选择、加面的日语表达",
    level: "N5",
    day: 16,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20ramen%20shop%20tonkotsu%20ramen%20bowl%20steam%20shop%20interior&image_size=landscape_4_3",
    words: [
      { word: "ラーメン", reading: "ラーメン", romaji: "raamen", pos: "名词", meaning: "拉面", example: "ラーメンを食べに行きます。", exampleTrans: "去吃拉面。" },
      { word: "味噌ラーメン", reading: "ミソラーメン", romaji: "miso raamen", pos: "名词", meaning: "味噌拉面", example: "味噌ラーメンをください。", exampleTrans: "请给我味噌拉面。" },
      { word: "醤油ラーメン", reading: "ショウユラーメン", romaji: "shouyu raamen", pos: "名词", meaning: "酱油拉面", example: "醤油ラーメンは人気です。", exampleTrans: "酱油拉面很受欢迎。" },
      { word: "替え玉", reading: "カエダマ", romaji: "kaedama", pos: "名词", meaning: "加面", example: "替え玉をお願いします。", exampleTrans: "请加一份面。" },
      { word: "チャーシュー", reading: "チャーシュー", romaji: "chaashuu", pos: "名词", meaning: "叉烧", example: "チャーシューが美味しいです。", exampleTrans: "叉烧很好吃。" },
      { word: "のり", reading: "ノリ", romaji: "nori", pos: "名词", meaning: "海苔", example: "のりを追加します。", exampleTrans: "加上海苔。" },
      { word: "辛い", reading: "カライ", romaji: "karai", pos: "い形容词", meaning: "辣的", example: "辛いのは苦手です。", exampleTrans: "不太能吃辣。" },
      { word: "温かい", reading: "アタタカイ", romaji: "atatakai", pos: "い形容词", meaning: "热的", example: "温かいラーメンがいいです。", exampleTrans: "想吃热的拉面。" },
    ],
    grammars: [
      { pattern: "〜を食べに行きます", explanation: "去做某事。に行く＝去做…。", example: "ラーメンを食べに行きます。", exampleTrans: "去吃拉面。" },
      { pattern: "〜は苦手です", explanation: "表示不擅长、不喜欢。", example: "辛いのは苦手です。", exampleTrans: "不太能吃辣。" },
      { pattern: "〜がいいです", explanation: "表示选择、偏好。", example: "温かいのがいいです。", exampleTrans: "热的就好。" },
    ],
  },
  {
    id: "ja-bakery",
    lang: "ja",
    title: "面包店",
    icon: "🥐",
    description: "日式面包店选面包、结账、常用面包名",
    level: "N5",
    day: 17,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bakery%20shop%20fresh%20bread%20pastries%20display%20case%20morning%20light&image_size=landscape_4_3",
    words: [
      { word: "パン", reading: "パン", romaji: "pan", pos: "名词", meaning: "面包", example: "朝ごはんはパンです。", exampleTrans: "早饭吃面包。" },
      { word: "食パン", reading: "ショクパン", romaji: "shokupan", pos: "名词", meaning: "吐司面包", example: "食パンを一斤ください。", exampleTrans: "请给我一条吐司。" },
      { word: "アンパン", reading: "アンパン", romaji: "anpan", pos: "名词", meaning: "红豆包", example: "アンパンが大好きです。", exampleTrans: "非常喜欢红豆包。" },
      { word: "メロンパン", reading: "メロンパン", romaji: "melon pan", pos: "名词", meaning: "蜜瓜包", example: "メロンパンは人気です。", exampleTrans: "蜜瓜包很受欢迎。" },
      { word: "カレーパン", reading: "カレーパン", romaji: "karee pan", pos: "名词", meaning: "咖喱面包", example: "カレーパンを二つください。", exampleTrans: "请给我两个咖喱面包。" },
      { word: "トング", reading: "トング", romaji: "tongo", pos: "名词", meaning: "夹子", example: "トングで取ります。", exampleTrans: "用夹子取。" },
      { word: "袋", reading: "フクロ", romaji: "fukuro", pos: "名词", meaning: "袋子", example: "袋に入れてください。", exampleTrans: "请装进袋子里。" },
      { word: "焼きたて", reading: "ヤキタテ", romaji: "yakitate", pos: "名词", meaning: "刚烤好的", example: "焼きたてのパンは美味しいです。", exampleTrans: "刚烤好的面包很好吃。" },
    ],
    grammars: [
      { pattern: "朝ごはんは〜です", explanation: "早饭是…。", example: "朝ごはんはパンです。", exampleTrans: "早饭吃面包。" },
      { pattern: "〜を二つください", explanation: "数个数时用つ。", example: "カレーパンを二つください。", exampleTrans: "请给我两个咖喱面包。" },
      { pattern: "焼きたての〜", explanation: "刚做好的…。たて＝刚做完。", example: "焼きたてのパン", exampleTrans: "刚烤好的面包" },
    ],
  },
  {
    id: "ja-supermarket",
    lang: "ja",
    title: "超市",
    icon: "🛒",
    description: "超市购物、找商品、结账的日语表达",
    level: "N5",
    day: 18,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20supermarket%20grocery%20store%20fresh%20produce%20aisle&image_size=landscape_4_3",
    words: [
      { word: "スーパー", reading: "スーパー", romaji: "suupaa", pos: "名词", meaning: "超市", example: "スーパーで買い物します。", exampleTrans: "在超市购物。" },
      { word: "買い物", reading: "カイモノ", romaji: "kaimono", pos: "名词/する动词", meaning: "购物", example: "今日は買い物に行きます。", exampleTrans: "今天去购物。" },
      { word: "野菜", reading: "ヤサイ", romaji: "yasai", pos: "名词", meaning: "蔬菜", example: "野菜をたくさん買いました。", exampleTrans: "买了很多蔬菜。" },
      { word: "肉", reading: "ニク", romaji: "niku", pos: "名词", meaning: "肉", example: "肉はどこですか。", exampleTrans: "肉在哪里？" },
      { word: "魚", reading: "サカナ", romaji: "sakana", pos: "名词", meaning: "鱼", example: "魚が新鮮です。", exampleTrans: "鱼很新鲜。" },
      { word: "卵", reading: "タマゴ", romaji: "tamago", pos: "名词", meaning: "鸡蛋", example: "卵をパックでください。", exampleTrans: "请给我一盒鸡蛋。" },
      { word: "レジ", reading: "レジ", romaji: "reji", pos: "名词", meaning: "收银台", example: "レジはあちらです。", exampleTrans: "收银台在那边。" },
      { word: "割引", reading: "ワリビキ", romaji: "waribiki", pos: "名词", meaning: "打折", example: "これは割引ですか。", exampleTrans: "这个打折吗？" },
    ],
    grammars: [
      { pattern: "〜で買い物します", explanation: "在…购物。", example: "スーパーで買い物します。", exampleTrans: "在超市购物。" },
      { pattern: "〜をたくさん買いました", explanation: "买了很多…。", example: "野菜をたくさん買いました。", exampleTrans: "买了很多蔬菜。" },
      { pattern: "〜はあちらです", explanation: "…在那边。", example: "レジはあちらです。", exampleTrans: "收银台在那边。" },
    ],
  },
  {
    id: "ja-drugstore",
    lang: "ja",
    title: "药妆店",
    icon: "💊",
    description: "日本药妆店买药、化妆品、日用品的表达",
    level: "N4",
    day: 19,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20drugstore%20matsumoto%20kiyoshi%20cosmetics%20medicine%20shelves&image_size=landscape_4_3",
    words: [
      { word: "ドラッグストア", reading: "ドラッグストア", romaji: "doraggusutoa", pos: "名词", meaning: "药妆店", example: "ドラッグストアで買い物します。", exampleTrans: "在药妆店购物。" },
      { word: "薬", reading: "クスリ", romaji: "kusuri", pos: "名词", meaning: "药", example: "風邪薬はどこですか。", exampleTrans: "感冒药在哪里？" },
      { word: "風邪薬", reading: "カゼグスリ", romaji: "kazegusuri", pos: "名词", meaning: "感冒药", example: "風邪薬をください。", exampleTrans: "请给我感冒药。" },
      { word: "頭痛薬", reading: "ズツウグスリ", romaji: "zutsuugusuri", pos: "名词", meaning: "头痛药", example: "頭痛薬はありますか。", exampleTrans: "有头痛药吗？" },
      { word: "化粧品", reading: "ケショウヒン", romaji: "keshouhin", pos: "名词", meaning: "化妆品", example: "化粧品売り場はどこですか。", exampleTrans: "化妆品区在哪里？" },
      { word: "日焼け止め", reading: "ヒヤケドメ", romaji: "hiyakedome", pos: "名词", meaning: "防晒霜", example: "日焼け止めをください。", exampleTrans: "请给我防晒霜。" },
      { word: "マスク", reading: "マスク", romaji: "masuku", pos: "名词", meaning: "口罩", example: "マスクを買いました。", exampleTrans: "买了口罩。" },
      { word: "日用品", reading: "ニチヨウヒン", romaji: "nichiyouhin", pos: "名词", meaning: "日用品", example: "日用品も売っています。", exampleTrans: "也卖日用品。" },
    ],
    grammars: [
      { pattern: "〜はどこですか", explanation: "询问在哪里。", example: "風邪薬はどこですか。", exampleTrans: "感冒药在哪里？" },
      { pattern: "〜売り場はどこですか", explanation: "…区在哪里？", example: "化粧品売り場はどこですか。", exampleTrans: "化妆品区在哪里？" },
      { pattern: "〜も売っています", explanation: "也卖…。", example: "日用品も売っています。", exampleTrans: "也卖日用品。" },
    ],
  },
  {
    id: "ja-postoffice",
    lang: "ja",
    title: "邮局",
    icon: "📮",
    description: "在日本寄信、寄包裹、买邮票的表达",
    level: "N4",
    day: 20,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20post%20office%20red%20mail%20box%20counter%20service&image_size=landscape_4_3",
    words: [
      { word: "郵便局", reading: "ユウビンキョク", romaji: "yuubinkyoku", pos: "名词", meaning: "邮局", example: "郵便局に行きます。", exampleTrans: "去邮局。" },
      { word: "手紙", reading: "テガミ", romaji: "tegami", pos: "名词", meaning: "信", example: "手紙を出しに行きます。", exampleTrans: "去寄信。" },
      { word: "はがき", reading: "ハガキ", romaji: "hagaki", pos: "名词", meaning: "明信片", example: "はがきを何枚かください。", exampleTrans: "请给我几张明信片。" },
      { word: "切手", reading: "キッテ", romaji: "kitte", pos: "名词", meaning: "邮票", example: "切手を買いたいです。", exampleTrans: "想买邮票。" },
      { word: "荷物", reading: "ニモツ", romaji: "nimotsu", pos: "名词", meaning: "包裹", example: "荷物を送りたいです。", exampleTrans: "想寄包裹。" },
      { word: "速達", reading: "ソクタツ", romaji: "sokutatsu", pos: "名词", meaning: "快递", example: "速達でお願いします。", exampleTrans: "请寄快递。" },
      { word: "書留", reading: "カキトメ", romaji: "kakitome", pos: "名词", meaning: "挂号信", example: "書留にしてください。", exampleTrans: "请用挂号寄。" },
      { word: "料金", reading: "リョウキン", romaji: "ryoukin", pos: "名词", meaning: "费用", example: "料金はいくらですか。", exampleTrans: "费用是多少？" },
    ],
    grammars: [
      { pattern: "〜を出しに行きます", explanation: "去寄…。出す＝寄出。", example: "手紙を出しに行きます。", exampleTrans: "去寄信。" },
      { pattern: "〜を送りたいです", explanation: "想寄…。送る＝寄、送。", example: "荷物を送りたいです。", exampleTrans: "想寄包裹。" },
      { pattern: "〜でお願いします", explanation: "用…方式。", example: "速達でお願いします。", exampleTrans: "请寄快递。" },
    ],
  },
  {
    id: "ja-bank",
    lang: "ja",
    title: "银行",
    icon: "🏦",
    description: "开户、取钱、换钱、转账的日语表达",
    level: "N4",
    day: 21,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bank%20counter%20ATM%20interior%20modern%20clean&image_size=landscape_4_3",
    words: [
      { word: "銀行", reading: "ギンコウ", romaji: "ginkou", pos: "名词", meaning: "银行", example: "銀行に行きます。", exampleTrans: "去银行。" },
      { word: "口座", reading: "コウザ", romaji: "kouza", pos: "名词", meaning: "账户", example: "口座を開きたいです。", exampleTrans: "想开个账户。" },
      { word: "預金", reading: "ヨキン", romaji: "yokin", pos: "名词/する动词", meaning: "存款", example: "預金したいです。", exampleTrans: "想存款。" },
      { word: "おろす", reading: "オロス", romaji: "orosu", pos: "五段动词", meaning: "取钱", example: "お金をおろします。", exampleTrans: "取钱。" },
      { word: "振込", reading: "フリコミ", romaji: "furikomi", pos: "名词/する动词", meaning: "转账", example: "振込をお願いします。", exampleTrans: "请帮我转账。" },
      { word: "両替", reading: "リョウガエ", romaji: "ryougae", pos: "名词/する动词", meaning: "换钱", example: "ドルを円に両替したいです。", exampleTrans: "想把美元换成日元。" },
      { word: "通帳", reading: "ツウチョウ", romaji: "tsuuchou", pos: "名词", meaning: "存折", example: "通帳をなくしました。", exampleTrans: "把存折弄丢了。" },
      { word: "キャッシュカード", reading: "キャッシュカード", romaji: "kyasshu kaado", pos: "名词", meaning: "现金卡", example: "キャッシュカードを作ります。", exampleTrans: "办一张现金卡。" },
    ],
    grammars: [
      { pattern: "〜を開きたいです", explanation: "想开…。開く＝开、打开。", example: "口座を開きたいです。", exampleTrans: "想开个账户。" },
      { pattern: "お金をおろします", explanation: "取钱。おろす＝提取。", example: "銀行でお金をおろします。", exampleTrans: "在银行取钱。" },
      { pattern: "〜を〜に両替します", explanation: "把…换成…。", example: "ドルを円に両替します。", exampleTrans: "把美元换成日元。" },
    ],
  },
  {
    id: "ja-hair",
    lang: "ja",
    title: "理发店",
    icon: "💇",
    description: "理发店/美容院剪发、烫发、染发的表达",
    level: "N4",
    day: 22,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20hair%20salon%20stylist%20cutting%20hair%20modern%20salon&image_size=landscape_4_3",
    words: [
      { word: "美容室", reading: "ビヨウシツ", romaji: "biyoushitsu", pos: "名词", meaning: "美容院", example: "美容室に行きます。", exampleTrans: "去美容院。" },
      { word: "散髪", reading: "サンパツ", romaji: "sanpatsu", pos: "名词/する动词", meaning: "剪发", example: "散髪したいです。", exampleTrans: "想剪头发。" },
      { word: "髪", reading: "カミ", romaji: "kami", pos: "名词", meaning: "头发", example: "髪を短くしてください。", exampleTrans: "请把头发剪短。" },
      { word: "短く", reading: "ミジカク", romaji: "mijikaku", pos: "副词", meaning: "短地", example: "もっと短くしてください。", exampleTrans: "请再剪短一点。" },
      { word: "パーマ", reading: "パーマ", romaji: "paama", pos: "名词/する动词", meaning: "烫发", example: "パーマをかけたいです。", exampleTrans: "想烫发。" },
      { word: "カラー", reading: "カラー", romaji: "karaa", pos: "名词/する动词", meaning: "染发", example: "カラーをしたいです。", exampleTrans: "想染发。" },
      { word: "シャンプー", reading: "シャンプー", romaji: "shanpuu", pos: "名词/する动词", meaning: "洗头", example: "シャンプーをお願いします。", exampleTrans: "请帮我洗头。" },
      { word: "カット", reading: "カット", romaji: "katto", pos: "名词/する动词", meaning: "剪发", example: "カットだけでいいです。", exampleTrans: "只剪发就可以。" },
    ],
    grammars: [
      { pattern: "〜を〜くしてください", explanation: "把…弄成…状态。", example: "髪を短くしてください。", exampleTrans: "请把头发剪短。" },
      { pattern: "〜をかけたいです", explanation: "想做…。", example: "パーマをかけたいです。", exampleTrans: "想烫发。" },
      { pattern: "〜だけでいいです", explanation: "只…就可以。だけ＝只、仅仅。", example: "カットだけでいいです。", exampleTrans: "只剪发就可以。" },
    ],
  },
  {
    id: "ja-laundry",
    lang: "ja",
    title: "洗衣店",
    icon: "🧺",
    description: "投币洗衣店、干洗店的常用表达",
    level: "N5",
    day: 23,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20coin%20laundry%20laundromat%20washing%20machines%20clean%20bright&image_size=landscape_4_3",
    words: [
      { word: "コインランドリー", reading: "コインランドリー", romaji: "koin randorii", pos: "名词", meaning: "投币洗衣店", example: "コインランドリーに行きます。", exampleTrans: "去投币洗衣店。" },
      { word: "洗濯", reading: "センタク", romaji: "sentaku", pos: "名词/する动词", meaning: "洗衣服", example: "洗濯したいです。", exampleTrans: "想洗衣服。" },
      { word: "洗濯機", reading: "センタクキ", romaji: "sentakuki", pos: "名词", meaning: "洗衣机", example: "洗濯機の使い方は？", exampleTrans: "洗衣机怎么用？" },
      { word: "乾燥機", reading: "カンソウキ", romaji: "kansouki", pos: "名词", meaning: "烘干机", example: "乾燥機はありますか。", exampleTrans: "有烘干机吗？" },
      { word: "洗剤", reading: "センザイ", romaji: "senzai", pos: "名词", meaning: "洗衣液", example: "洗剤を入れます。", exampleTrans: "放入洗衣液。" },
      { word: "クリーニング", reading: "クリーニング", romaji: "kuriiningu", pos: "名词/する动词", meaning: "干洗", example: "スーツをクリーニングしたいです。", exampleTrans: "想干洗西装。" },
      { word: "仕上がり", reading: "シアガリ", romaji: "shiagari", pos: "名词", meaning: "完成", example: "仕上がりはいつですか。", exampleTrans: "什么时候能好？" },
      { word: "シミ", reading: "シミ", romaji: "shimi", pos: "名词", meaning: "污渍", example: "シミがついています。", exampleTrans: "沾了污渍。" },
    ],
    grammars: [
      { pattern: "〜の使い方は？", explanation: "…的用法是？", example: "洗濯機の使い方は？", exampleTrans: "洗衣机怎么用？" },
      { pattern: "〜を〜したいです", explanation: "想做…。", example: "スーツをクリーニングしたいです。", exampleTrans: "想干洗西装。" },
      { pattern: "〜がついています", explanation: "附着了…。つく＝附着。", example: "シミがついています。", exampleTrans: "沾了污渍。" },
    ],
  },
  {
    id: "ja-apartment",
    lang: "ja",
    title: "找房子",
    icon: "🏠",
    description: "在日本找房子、看房子、签约的表达",
    level: "N3",
    day: 24,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20real%20estate%20apartment%20interior%20modern%20room&image_size=landscape_4_3",
    words: [
      { word: "アパート", reading: "アパート", romaji: "apaato", pos: "名词", meaning: "公寓", example: "アパートを探しています。", exampleTrans: "正在找公寓。" },
      { word: "マンション", reading: "マンション", romaji: "manshon", pos: "名词", meaning: "高级公寓", example: "マンションに住みたいです。", exampleTrans: "想住高级公寓。" },
      { word: "家賃", reading: "ヤチン", romaji: "yachin", pos: "名词", meaning: "房租", example: "家賃はいくらですか。", exampleTrans: "房租是多少钱？" },
      { word: "敷金", reading: "シキキン", romaji: "shikikin", pos: "名词", meaning: "押金", example: "敷金は何ヶ月ですか。", exampleTrans: "押金是几个月？" },
      { word: "礼金", reading: "レイキン", romaji: "reikin", pos: "名词", meaning: "礼金", example: "礼金は必要ですか。", exampleTrans: "需要礼金吗？" },
      { word: "間取り", reading: "マドリ", romaji: "madori", pos: "名词", meaning: "户型", example: "間取りは何ですか。", exampleTrans: "户型是什么样的？" },
      { word: "不動産", reading: "フドウサン", romaji: "fudousan", pos: "名词", meaning: "房产中介", example: "不動産屋に行きます。", exampleTrans: "去房产中介。" },
      { word: "内見", reading: "ナイケン", romaji: "naiken", pos: "名词/する动词", meaning: "看房", example: "内見したいです。", exampleTrans: "想看看房子。" },
    ],
    grammars: [
      { pattern: "〜を探しています", explanation: "正在找…。", example: "アパートを探しています。", exampleTrans: "正在找公寓。" },
      { pattern: "〜に住みたいです", explanation: "想住在…。住む＝住。", example: "マンションに住みたいです。", exampleTrans: "想住高级公寓。" },
      { pattern: "〜は必要ですか", explanation: "需要…吗？", example: "礼金は必要ですか。", exampleTrans: "需要礼金吗？" },
    ],
  },
  {
    id: "ja-moving",
    lang: "ja",
    title: "搬家",
    icon: "📦",
    description: "搬家公司、打包、地址变更的日语表达",
    level: "N4",
    day: 25,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20moving%20company%20cardboard%20boxes%20new%20apartment&image_size=landscape_4_3",
    words: [
      { word: "引っ越し", reading: "ヒッコシ", romaji: "hikkoshi", pos: "名词/する动词", meaning: "搬家", example: "来月引っ越します。", exampleTrans: "下个月搬家。" },
      { word: "荷物", reading: "ニモツ", romaji: "nimotsu", pos: "名词", meaning: "行李", example: "荷物がたくさんあります。", exampleTrans: "有很多行李。" },
      { word: "ダンボール", reading: "ダンボール", romaji: "danbooru", pos: "名词", meaning: "纸箱", example: "ダンボールで荷物を詰めます。", exampleTrans: "用纸箱装行李。" },
      { word: "業者", reading: "ギョウシャ", romaji: "gyousha", pos: "名词", meaning: "搬家公司", example: "引っ越し業者を頼みます。", exampleTrans: "请搬家公司。" },
      { word: "見積もり", reading: "ミツモリ", romaji: "mitsumori", pos: "名词", meaning: "报价", example: "見積もりをお願いします。", exampleTrans: "请给我报价。" },
      { word: "住所変更", reading: "ジュウショヘンコウ", romaji: "juusho henkou", pos: "名词", meaning: "地址变更", example: "住所変更の手続きをします。", exampleTrans: "办理地址变更手续。" },
      { word: "挨拶", reading: "アイサツ", romaji: "aisatsu", pos: "名词/する动词", meaning: "打招呼", example: "隣人に挨拶に行きます。", exampleTrans: "去邻居家打招呼。" },
      { word: "運ぶ", reading: "ハコブ", romaji: "hakobu", pos: "五段动词", meaning: "搬运", example: "荷物を運びます。", exampleTrans: "搬运行李。" },
    ],
    grammars: [
      { pattern: "〜で〜を詰めます", explanation: "用…装…。詰める＝装、塞。", example: "ダンボールで荷物を詰めます。", exampleTrans: "用纸箱装行李。" },
      { pattern: "〜を頼みます", explanation: "拜托…。頼む＝拜托。", example: "引っ越し業者を頼みます。", exampleTrans: "请搬家公司。" },
      { pattern: "〜に行きます", explanation: "去做…。", example: "挨拶に行きます。", exampleTrans: "去打招呼。" },
    ],
  },
  {
    id: "ja-cinema",
    lang: "ja",
    title: "电影院",
    icon: "🎬",
    description: "买票、选座位、买爆米花的电影院表达",
    level: "N5",
    day: 26,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20movie%20theater%20cinema%20seats%20screen%20popcorn&image_size=landscape_4_3",
    words: [
      { word: "映画", reading: "エイガ", romaji: "eiga", pos: "名词", meaning: "电影", example: "映画を見に行きます。", exampleTrans: "去看电影。" },
      { word: "映画館", reading: "エイガカン", romaji: "eigakan", pos: "名词", meaning: "电影院", example: "映画館はどこですか。", exampleTrans: "电影院在哪里？" },
      { word: "チケット", reading: "チケット", romaji: "chiketto", pos: "名词", meaning: "票", example: "チケットを買います。", exampleTrans: "买票。" },
      { word: "席", reading: "セキ", romaji: "seki", pos: "名词", meaning: "座位", example: "良い席はありますか。", exampleTrans: "有好座位吗？" },
      { word: "ポップコーン", reading: "ポップコーン", romaji: "poppu koon", pos: "名词", meaning: "爆米花", example: "ポップコーンをください。", exampleTrans: "请给我爆米花。" },
      { word: "ジュース", reading: "ジュース", romaji: "juusu", pos: "名词", meaning: "果汁", example: "ジュースもお願いします。", exampleTrans: "果汁也麻烦了。" },
      { word: "上映", reading: "ジョウエイ", romaji: "jouei", pos: "名词/する动词", meaning: "上映", example: "何時から上映ですか。", exampleTrans: "几点开始上映？" },
      { word: "字幕", reading: "ジマク", romaji: "jimaku", pos: "名词", meaning: "字幕", example: "字幕版はありますか。", exampleTrans: "有字幕版吗？" },
    ],
    grammars: [
      { pattern: "〜を見に行きます", explanation: "去看…。", example: "映画を見に行きます。", exampleTrans: "去看电影。" },
      { pattern: "〜はありますか", explanation: "有…吗？", example: "字幕版はありますか。", exampleTrans: "有字幕版吗？" },
      { pattern: "何時から〜ですか", explanation: "从几点开始…？", example: "何時から上映ですか。", exampleTrans: "几点开始上映？" },
    ],
  },
  {
    id: "ja-karaoke",
    lang: "ja",
    title: "卡拉OK",
    icon: "🎤",
    description: "日本卡拉OK点歌、选房、吃喝的表达",
    level: "N4",
    day: 27,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20karaoke%20room%20microphone%20neon%20lights%20party&image_size=landscape_4_3",
    words: [
      { word: "カラオケ", reading: "カラオケ", romaji: "karaoke", pos: "名词", meaning: "卡拉OK", example: "カラオケに行きましょう。", exampleTrans: "去卡拉OK吧。" },
      { word: "部屋", reading: "ヘヤ", romaji: "heya", pos: "名词", meaning: "房间", example: "個室をお願いします。", exampleTrans: "请给我包间。" },
      { word: "歌", reading: "ウタ", romaji: "uta", pos: "名词", meaning: "歌", example: "歌を歌います。", exampleTrans: "唱歌。" },
      { word: "曲", reading: "キョク", romaji: "kyoku", pos: "名词", meaning: "曲子", example: "この曲を入れてください。", exampleTrans: "请点这首歌。" },
      { word: "採点", reading: "サイテン", romaji: "saiten", pos: "名词/する动词", meaning: "打分", example: "採点しますか。", exampleTrans: "要打分吗？" },
      { word: "ドリンクバー", reading: "ドリンクバー", romaji: "dorinku baa", pos: "名词", meaning: "饮料自助", example: "ドリンクバーはありますか。", exampleTrans: "有饮料自助吗？" },
      { word: "マイク", reading: "マイク", romaji: "maiku", pos: "名词", meaning: "麦克风", example: "マイクをください。", exampleTrans: "请给我麦克风。" },
      { word: "予約", reading: "ヨヤク", romaji: "yoyaku", pos: "名词/する动词", meaning: "预约", example: "予約してあります。", exampleTrans: "已经预约了。" },
    ],
    grammars: [
      { pattern: "〜に行きましょう", explanation: "去…吧。", example: "カラオケに行きましょう。", exampleTrans: "去卡拉OK吧。" },
      { pattern: "〜を入れてください", explanation: "请点/输入…。", example: "この曲を入れてください。", exampleTrans: "请点这首歌。" },
      { pattern: "〜してあります", explanation: "已经做好了…准备。てある＝提前做好。", example: "予約してあります。", exampleTrans: "已经预约了。" },
    ],
  },
  {
    id: "ja-library",
    lang: "ja",
    title: "图书馆",
    icon: "📚",
    description: "图书馆借书、还书、找书的表达",
    level: "N5",
    day: 28,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20library%20bookshelves%20reading%20room%20quiet%20atmosphere&image_size=landscape_4_3",
    words: [
      { word: "図書館", reading: "トショカン", romaji: "toshokan", pos: "名词", meaning: "图书馆", example: "図書館で勉強します。", exampleTrans: "在图书馆学习。" },
      { word: "本", reading: "ホン", romaji: "hon", pos: "名词", meaning: "书", example: "本を借ります。", exampleTrans: "借书。" },
      { word: "借りる", reading: "カリル", romaji: "kariru", pos: "一段动词", meaning: "借", example: "本を何冊借りられますか。", exampleTrans: "能借几本书？" },
      { word: "返す", reading: "カエス", romaji: "kaesu", pos: "五段动词", meaning: "还", example: "本を返しに行きます。", exampleTrans: "去还书。" },
      { word: "貸出", reading: "カシダシ", romaji: "kashidashi", pos: "名词", meaning: "借出", example: "貸出期間は何日ですか。", exampleTrans: "借阅期限是几天？" },
      { word: "検索", reading: "ケンサク", romaji: "kensaku", pos: "名词/する动词", meaning: "检索", example: "パソコンで検索します。", exampleTrans: "用电脑检索。" },
      { word: "雑誌", reading: "ザッシ", romaji: "zasshi", pos: "名词", meaning: "杂志", example: "雑誌は読めます。", exampleTrans: "可以看杂志。" },
      { word: "閲覧室", reading: "エツランシツ", romaji: "etsuranshitsu", pos: "名词", meaning: "阅览室", example: "閲覧室はどこですか。", exampleTrans: "阅览室在哪里？" },
    ],
    grammars: [
      { pattern: "〜で勉強します", explanation: "在…学习。", example: "図書館で勉強します。", exampleTrans: "在图书馆学习。" },
      { pattern: "〜を借ります", explanation: "借…。", example: "本を借ります。", exampleTrans: "借书。" },
      { pattern: "〜は何日ですか", explanation: "是几天？", example: "貸出期間は何日ですか。", exampleTrans: "借阅期限是几天？" },
    ],
  },
  {
    id: "ja-bookstore",
    lang: "ja",
    title: "书店",
    icon: "📖",
    description: "在日本书店找书、买书、杂志区的表达",
    level: "N5",
    day: 29,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bookstore%20jimbocho%20paper%20books%20shelves&image_size=landscape_4_3",
    words: [
      { word: "本屋", reading: "ホンヤ", romaji: "honya", pos: "名词", meaning: "书店", example: "本屋で本を買います。", exampleTrans: "在书店买书。" },
      { word: "小説", reading: "ショウセツ", romaji: "shousetsu", pos: "名词", meaning: "小说", example: "小説が好きです。", exampleTrans: "喜欢小说。" },
      { word: "漫画", reading: "マンガ", romaji: "manga", pos: "名词", meaning: "漫画", example: "漫画を読みます。", exampleTrans: "读漫画。" },
      { word: "参考書", reading: "サンコウショ", romaji: "sankousho", pos: "名词", meaning: "参考书", example: "日本語の参考書を探しています。", exampleTrans: "正在找日语参考书。" },
      { word: "雑誌", reading: "ザッシ", romaji: "zasshi", pos: "名词", meaning: "杂志", example: "ファッション雑誌", exampleTrans: "时尚杂志" },
      { word: "新刊", reading: "シンカン", romaji: "shinkan", pos: "名词", meaning: "新书", example: "新刊はどこですか。", exampleTrans: "新书在哪里？" },
      { word: "文庫本", reading: "ブンコボン", romaji: "bunkobon", pos: "名词", meaning: "文库本", example: "文庫本は安いです。", exampleTrans: "文库本很便宜。" },
      { word: "レジ", reading: "レジ", romaji: "reji", pos: "名词", meaning: "收银台", example: "レジは一階です。", exampleTrans: "收银台在一楼。" },
    ],
    grammars: [
      { pattern: "〜で本を買います", explanation: "在…买书。", example: "本屋で本を買います。", exampleTrans: "在书店买书。" },
      { pattern: "〜が好きです", explanation: "喜欢…。", example: "小説が好きです。", exampleTrans: "喜欢小说。" },
      { pattern: "〜を探しています", explanation: "正在找…。", example: "日本語の参考書を探しています。", exampleTrans: "正在找日语参考书。" },
    ],
  },
  {
    id: "ja-sports",
    lang: "ja",
    title: "运动健身",
    icon: "🏋️",
    description: "健身房、运动、跑步、瑜伽的日语表达",
    level: "N4",
    day: 30,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20gym%20fitness%20center%20workout%20equipment%20modern&image_size=landscape_4_3",
    words: [
      { word: "スポーツ", reading: "スポーツ", romaji: "supootsu", pos: "名词", meaning: "运动", example: "スポーツが好きです。", exampleTrans: "喜欢运动。" },
      { word: "ジム", reading: "ジム", romaji: "jimu", pos: "名词", meaning: "健身房", example: "ジムに通っています。", exampleTrans: "常去健身房。" },
      { word: "筋トレ", reading: "キントレ", romaji: "kintore", pos: "名词/する动词", meaning: "肌肉训练", example: "筋トレをします。", exampleTrans: "做肌肉训练。" },
      { word: "ランニング", reading: "ランニング", romaji: "ranningu", pos: "名词/する动词", meaning: "跑步", example: "朝ランニングします。", exampleTrans: "早上跑步。" },
      { word: "ヨガ", reading: "ヨガ", romaji: "yoga", pos: "名词", meaning: "瑜伽", example: "ヨガを習っています。", exampleTrans: "在学瑜伽。" },
      { word: "水泳", reading: "スイエイ", romaji: "suiei", pos: "名词/する动词", meaning: "游泳", example: "水泳は得意です。", exampleTrans: "擅长游泳。" },
      { word: "シャワー", reading: "シャワー", romaji: "shawaa", pos: "名词", meaning: "淋浴", example: "シャワーを浴びます。", exampleTrans: "冲淋浴。" },
      { word: "会員", reading: "カイイン", romaji: "kaiin", pos: "名词", meaning: "会员", example: "会員になりたいです。", exampleTrans: "想成为会员。" },
    ],
    grammars: [
      { pattern: "〜に通っています", explanation: "常去…。通う＝往返、常去。", example: "ジムに通っています。", exampleTrans: "常去健身房。" },
      { pattern: "〜が得意です", explanation: "擅长…。得意＝擅长。", example: "水泳は得意です。", exampleTrans: "擅长游泳。" },
      { pattern: "〜になりたいです", explanation: "想成为…。なる＝成为。", example: "会員になりたいです。", exampleTrans: "想成为会员。" },
    ],
  },
  {
    id: "ja-onsen",
    lang: "ja",
    title: "温泉",
    icon: "♨️",
    description: "日式温泉入浴礼仪、温泉旅馆的表达",
    level: "N4",
    day: 31,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20onsen%20hot%20spring%20ryokan%20outdoor%20bath%20mountain%20view&image_size=landscape_4_3",
    words: [
      { word: "温泉", reading: "オンセン", romaji: "onsen", pos: "名词", meaning: "温泉", example: "温泉に行きたいです。", exampleTrans: "想去温泉。" },
      { word: "旅館", reading: "リョカン", romaji: "ryokan", pos: "名词", meaning: "旅馆", example: "旅館に泊まります。", exampleTrans: "住旅馆。" },
      { word: "露天風呂", reading: "ロテンブロ", romaji: "rotenburo", pos: "名词", meaning: "露天温泉", example: "露天風呂が気持ちいいです。", exampleTrans: "露天温泉很舒服。" },
      { word: "湯", reading: "ユ", romaji: "yu", pos: "名词", meaning: "热水/温泉水", example: "湯が熱いです。", exampleTrans: "水很烫。" },
      { word: "脱衣所", reading: "ダツイジョ", romaji: "datsuijo", pos: "名词", meaning: "更衣室", example: "脱衣所はこちらです。", exampleTrans: "更衣室在这边。" },
      { word: "タオル", reading: "タオル", romaji: "taoru", pos: "名词", meaning: "毛巾", example: "タオルを持ってきました。", exampleTrans: "带来了毛巾。" },
      { word: "湯船", reading: "ユブネ", romaji: "yubune", pos: "名词", meaning: "浴池", example: "ゆっくり湯船につかります。", exampleTrans: "慢慢泡浴池。" },
      { word: "食事", reading: "ショクジ", romaji: "shokuji", pos: "名词/する动词", meaning: "吃饭", example: "食事はどこですか。", exampleTrans: "在哪里吃饭？" },
    ],
    grammars: [
      { pattern: "〜に行きたいです", explanation: "想去…。", example: "温泉に行きたいです。", exampleTrans: "想去温泉。" },
      { pattern: "〜に泊まります", explanation: "住…。泊まる＝住宿。", example: "旅館に泊まります。", exampleTrans: "住旅馆。" },
      { pattern: "〜が気持ちいいです", explanation: "…很舒服。", example: "露天風呂が気持ちいいです。", exampleTrans: "露天温泉很舒服。" },
    ],
  },
  {
    id: "ja-hanami",
    lang: "ja",
    title: "赏樱花",
    icon: "🌸",
    description: "日本樱花季赏花、花见的表达",
    level: "N4",
    day: 32,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20cherry%20blossom%20hanami%20sakura%20park%20picnic%20spring&image_size=landscape_4_3",
    words: [
      { word: "桜", reading: "サクラ", romaji: "sakura", pos: "名词", meaning: "樱花", example: "桜が咲きました。", exampleTrans: "樱花开了。" },
      { word: "花見", reading: "ハナミ", romaji: "hanami", pos: "名词/する动词", meaning: "赏花", example: "花見に行きましょう。", exampleTrans: "去赏花吧。" },
      { word: "公園", reading: "コウエン", romaji: "kouen", pos: "名词", meaning: "公园", example: "上野公園は有名です。", exampleTrans: "上野公园很有名。" },
      { word: "咲く", reading: "サク", romaji: "saku", pos: "五段动词", meaning: "开花", example: "桜が咲きます。", exampleTrans: "樱花开放。" },
      { word: "満開", reading: "マンカイ", romaji: "mankai", pos: "名词", meaning: "盛开", example: "満開ですね。", exampleTrans: "盛开了呢。" },
      { word: "シート", reading: "シート", romaji: "shiito", pos: "名词", meaning: "垫子", example: "シートを敷きます。", exampleTrans: "铺垫子。" },
      { word: "お弁当", reading: "オベントウ", romaji: "obentou", pos: "名词", meaning: "便当", example: "お弁当を持ってきます。", exampleTrans: "带便当来。" },
      { word: "散る", reading: "チル", romaji: "chiru", pos: "五段动词", meaning: "凋谢", example: "桜が散ります。", exampleTrans: "樱花凋谢。" },
    ],
    grammars: [
      { pattern: "〜が咲きました", explanation: "…开了。咲く＝开花。", example: "桜が咲きました。", exampleTrans: "樱花开了。" },
      { pattern: "〜に行きましょう", explanation: "去…吧。", example: "花見に行きましょう。", exampleTrans: "去赏花吧。" },
      { pattern: "〜は有名です", explanation: "…很有名。有名＝有名。", example: "上野公園は有名です。", exampleTrans: "上野公园很有名。" },
    ],
  },
  {
    id: "ja-festival",
    lang: "ja",
    title: "夏日祭典",
    icon: "🎆",
    description: "日本夏日祭典、烟火大会、神社的表达",
    level: "N4",
    day: 33,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20summer%20festival%20matsuri%20fireworks%20yukata%20stalls&image_size=landscape_4_3",
    words: [
      { word: "祭り", reading: "マツリ", romaji: "matsuri", pos: "名词", meaning: "祭典", example: "夏祭りに行きます。", exampleTrans: "去夏日祭。" },
      { word: "花火大会", reading: "ハナビタイカイ", romaji: "hanabi taikai", pos: "名词", meaning: "烟火大会", example: "花火大会は人気です。", exampleTrans: "烟火大会很受欢迎。" },
      { word: "花火", reading: "ハナビ", romaji: "hanabi", pos: "名词", meaning: "烟火", example: "花火が綺麗ですね。", exampleTrans: "烟花真漂亮啊。" },
      { word: "浴衣", reading: "ユカタ", romaji: "yukata", pos: "名词", meaning: "浴衣", example: "浴衣を着ます。", exampleTrans: "穿浴衣。" },
      { word: "屋台", reading: "ヤタイ", romaji: "yatai", pos: "名词", meaning: "摊贩", example: "屋台でたこ焼きを買います。", exampleTrans: "在小摊买章鱼烧。" },
      { word: "たこ焼き", reading: "タコヤキ", romaji: "takoyaki", pos: "名词", meaning: "章鱼烧", example: "たこ焼きが美味しいです。", exampleTrans: "章鱼烧很好吃。" },
      { word: "りんご飴", reading: "リンゴアメ", romaji: "ringo ame", pos: "名词", meaning: "苹果糖", example: "りんご飴を食べます。", exampleTrans: "吃苹果糖。" },
      { word: "神社", reading: "ジンジャ", romaji: "jinja", pos: "名词", meaning: "神社", example: "神社にお参りします。", exampleTrans: "参拜神社。" },
    ],
    grammars: [
      { pattern: "〜に行きます", explanation: "去…。", example: "夏祭りに行きます。", exampleTrans: "去夏日祭。" },
      { pattern: "〜が綺麗ですね", explanation: "…真漂亮啊。綺麗＝漂亮。", example: "花火が綺麗ですね。", exampleTrans: "烟花真漂亮啊。" },
      { pattern: "〜で〜を買います", explanation: "在…买…。", example: "屋台でたこ焼きを買います。", exampleTrans: "在小摊买章鱼烧。" },
    ],
  },
  {
    id: "ja-autumn",
    lang: "ja",
    title: "红叶与秋天",
    icon: "🍁",
    description: "日本秋天红叶、秋季活动的表达",
    level: "N5",
    day: 34,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20autumn%20leaves%20koyo%20red%20maple%20temple%20Kyoto&image_size=landscape_4_3",
    words: [
      { word: "秋", reading: "アキ", romaji: "aki", pos: "名词", meaning: "秋天", example: "秋は好きですか。", exampleTrans: "你喜欢秋天吗？" },
      { word: "紅葉", reading: "コウヨウ", romaji: "kouyou", pos: "名词", meaning: "红叶", example: "紅葉を見に行きます。", exampleTrans: "去看红叶。" },
      { word: "紅葉狩り", reading: "モミジガリ", romaji: "momijigari", pos: "名词", meaning: "赏红叶", example: "紅葉狩りに行きましょう。", exampleTrans: "去赏红叶吧。" },
      { word: "涼しい", reading: "スズシイ", romaji: "suzushii", pos: "い形容词", meaning: "凉爽的", example: "朝は涼しいです。", exampleTrans: "早上很凉爽。" },
      { word: "栗", reading: "クリ", romaji: "kuri", pos: "名词", meaning: "栗子", example: "栗が美味しい季節です。", exampleTrans: "是栗子好吃的季节。" },
      { word: "柿", reading: "カキ", romaji: "kaki", pos: "名词", meaning: "柿子", example: "柿が秋が旬です。", exampleTrans: "柿子秋天当季。" },
      { word: "季節", reading: "キセツ", romaji: "kisetsu", pos: "名词", meaning: "季节", example: "秋は食べ物が美味しい季節です。", exampleTrans: "秋天是食物好吃的季节。" },
      { word: "散歩", reading: "サンポ", romaji: "sanpo", pos: "名词/する动词", meaning: "散步", example: "公園を散歩します。", exampleTrans: "在公园散步。" },
    ],
    grammars: [
      { pattern: "〜は好きですか", explanation: "喜欢…吗？", example: "秋は好きですか。", exampleTrans: "你喜欢秋天吗？" },
      { pattern: "〜を見に行きます", explanation: "去看…。", example: "紅葉を見に行きます。", exampleTrans: "去看红叶。" },
      { pattern: "〜は〜季節です", explanation: "…是…的季节。", example: "秋は美味しい季節です。", exampleTrans: "秋天是美味的季节。" },
    ],
  },
  {
    id: "ja-newyear",
    lang: "ja",
    title: "新年",
    icon: "🎍",
    description: "日本新年习俗、拜年、御节料理的表达",
    level: "N4",
    day: 35,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20new%20year%20osechi%20ryori%20kadomatsu%20shrine&image_size=landscape_4_3",
    words: [
      { word: "正月", reading: "ショウガツ", romaji: "shougatsu", pos: "名词", meaning: "正月", example: "正月は家族で過ごします。", exampleTrans: "新年和家人一起过。" },
      { word: "お正月", reading: "オショウガツ", romaji: "oshougatsu", pos: "名词", meaning: "新年", example: "明けましておめでとうございます。", exampleTrans: "新年快乐。" },
      { word: "初詣", reading: "ハツモウデ", romaji: "hatsumoude", pos: "名词", meaning: "新年初次参拜", example: "初詣に行きます。", exampleTrans: "去新年参拜。" },
      { word: "おせち料理", reading: "オセチリョウリ", romaji: "osechi ryouri", pos: "名词", meaning: "御节料理", example: "おせち料理を食べます。", exampleTrans: "吃御节料理。" },
      { word: "鏡餅", reading: "カガミモチ", romaji: "kagami mochi", pos: "名词", meaning: "镜饼", example: "鏡餅を飾ります。", exampleTrans: "装饰镜饼。" },
      { word: "門松", reading: "カドマツ", romaji: "kadomatsu", pos: "名词", meaning: "门松", example: "門松を立てます。", exampleTrans: "立门松。" },
      { word: "お年玉", reading: "オトシダマ", romaji: "otoshidama", pos: "名词", meaning: "压岁钱", example: "お年玉をもらいました。", exampleTrans: "收到了压岁钱。" },
      { word: "除夜の鐘", reading: "ジョヤノカネ", romaji: "joya no kane", pos: "名词", meaning: "除夕钟声", example: "除夜の鐘を聞きます。", exampleTrans: "听除夕钟声。" },
    ],
    grammars: [
      { pattern: "〜で過ごします", explanation: "在…度过。過ごす＝度过。", example: "正月は家族で過ごします。", exampleTrans: "新年和家人一起过。" },
      { pattern: "に行きます", explanation: "去…。", example: "初詣に行きます。", exampleTrans: "去新年参拜。" },
      { pattern: "〜をもらいました", explanation: "收到了…。もらう＝得到。", example: "お年玉をもらいました。", exampleTrans: "收到了压岁钱。" },
    ],
  },
  {
    id: "ja-ski",
    lang: "ja",
    title: "滑雪",
    icon: "⛷️",
    description: "日本滑雪、滑雪板、雪山的表达",
    level: "N4",
    day: 36,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20ski%20resort%20snow%20mountain%20ski%20lift%20winter&image_size=landscape_4_3",
    words: [
      { word: "スキー", reading: "スキー", romaji: "sukii", pos: "名词", meaning: "滑雪", example: "スキーに行きます。", exampleTrans: "去滑雪。" },
      { word: "スノーボード", reading: "スノーボード", romaji: "sunoo boodo", pos: "名词", meaning: "单板滑雪", example: "スノーボードは難しいです。", exampleTrans: "单板滑雪很难。" },
      { word: "スキー場", reading: "スキージョウ", romaji: "sukii jou", pos: "名词", meaning: "滑雪场", example: "スキー場はどこですか。", exampleTrans: "滑雪场在哪里？" },
      { word: "リフト", reading: "リフト", romaji: "rifuto", pos: "名词", meaning: "缆车", example: "リフトに乗ります。", exampleTrans: "坐缆车。" },
      { word: "ゴーグル", reading: "ゴーグル", romaji: "googuru", pos: "名词", meaning: "护目镜", example: "ゴーグルをかけます。", exampleTrans: "戴护目镜。" },
      { word: "手袋", reading: "テブクロ", romaji: "tebukuro", pos: "名词", meaning: "手套", example: "手袋をはめます。", exampleTrans: "戴手套。" },
      { word: "初心者", reading: "ショシンシャ", romaji: "shoshinsha", pos: "名词", meaning: "初学者", example: "私は初心者です。", exampleTrans: "我是初学者。" },
      { word: "コース", reading: "コース", romaji: "koosu", pos: "名词", meaning: "雪道", example: "初心者コースはありますか。", exampleTrans: "有初级道吗？" },
    ],
    grammars: [
      { pattern: "〜に行きます", explanation: "去做…。", example: "スキーに行きます。", exampleTrans: "去滑雪。" },
      { pattern: "〜は難しいです", explanation: "…很难。難しい＝难。", example: "スノーボードは難しいです。", exampleTrans: "单板滑雪很难。" },
      { pattern: "私は初心者です", explanation: "我是初学者。", example: "私は初心者です。", exampleTrans: "我是初学者。" },
    ],
  },
  {
    id: "ja-friends",
    lang: "ja",
    title: "交朋友",
    icon: "🤝",
    description: "自我介绍、找话题、交换联系方式的表达",
    level: "N5",
    day: 37,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20friends%20meeting%20cafe%20conversation%20casual&image_size=landscape_4_3",
    words: [
      { word: "友達", reading: "トモダチ", romaji: "tomodachi", pos: "名词", meaning: "朋友", example: "友達になりましょう。", exampleTrans: "做朋友吧。" },
      { word: "自己紹介", reading: "ジコショウカイ", romaji: "jikoshoukai", pos: "名词", meaning: "自我介绍", example: "自己紹介をします。", exampleTrans: "做一下自我介绍。" },
      { word: "名前", reading: "ナマエ", romaji: "namae", pos: "名词", meaning: "名字", example: "名前は何ですか。", exampleTrans: "你叫什么名字？" },
      { word: "出身", reading: "シュッシン", romaji: "shusshin", pos: "名词", meaning: "出身", example: "出身はどこですか。", exampleTrans: "你是哪里人？" },
      { word: "趣味", reading: "シュミ", romaji: "shumi", pos: "名词", meaning: "爱好", example: "趣味は何ですか。", exampleTrans: "你的爱好是什么？" },
      { word: "連絡先", reading: "レンラクサキ", romaji: "renrakusaki", pos: "名词", meaning: "联系方式", example: "連絡先を交換しましょう。", exampleTrans: "交换联系方式吧。" },
      { word: "LINE", reading: "ライン", romaji: "rain", pos: "名词", meaning: "LINE", example: "LINEやっていますか。", exampleTrans: "你用LINE吗？" },
      { word: "また会いましょう", reading: "マタアイマショウ", romaji: "mata aimashou", pos: "寒暄语", meaning: "再见面吧", example: "また会いましょう。", exampleTrans: "改天再见吧。" },
    ],
    grammars: [
      { pattern: "〜になりましょう", explanation: "成为…吧。なる＝成为。", example: "友達になりましょう。", exampleTrans: "做朋友吧。" },
      { pattern: "〜は何ですか", explanation: "…是什么？", example: "趣味は何ですか。", exampleTrans: "爱好是什么？" },
      { pattern: "〜を交換しましょう", explanation: "交换…吧。交換する＝交换。", example: "連絡先を交換しましょう。", exampleTrans: "交换联系方式吧。" },
    ],
  },
  {
    id: "ja-phonecall",
    lang: "ja",
    title: "打电话",
    icon: "📞",
    description: "日语打电话、接电话、留言的表达",
    level: "N4",
    day: 38,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20phone%20call%20keitai%20smartphone%20communication&image_size=landscape_4_3",
    words: [
      { word: "電話", reading: "デンワ", romaji: "denwa", pos: "名词", meaning: "电话", example: "電話をかけます。", exampleTrans: "打电话。" },
      { word: "もしもし", reading: "モシモシ", romaji: "moshimoshi", pos: "感叹词", meaning: "喂喂", example: "もしもし、山田です。", exampleTrans: "喂喂，我是山田。" },
      { word: "お世話になっております", reading: "オセワニナッテオリマス", romaji: "osewa ni natte orimasu", pos: "寒暄语", meaning: "承蒙关照", example: "いつもお世話になっております。", exampleTrans: "一直承蒙关照。" },
      { word: "伝言", reading: "デンゴン", romaji: "dengon", pos: "名词", meaning: "留言", example: "伝言をお願いできますか。", exampleTrans: "能麻烦您留言吗？" },
      { word: "折り返し", reading: "オリカエシ", romaji: "orikaeshi", pos: "名词", meaning: "回电", example: "折り返し電話します。", exampleTrans: "会回电话。" },
      { word: "留守番電話", reading: "ルスバンデンワ", romaji: "rusuban denwa", pos: "名词", meaning: "录音电话", example: "留守番電話になります。", exampleTrans: "转到留言了。" },
      { word: "番号", reading: "バンゴウ", romaji: "bangou", pos: "名词", meaning: "号码", example: "電話番号を教えてください。", exampleTrans: "请告诉我电话号码。" },
      { word: "切る", reading: "キル", romaji: "kiru", pos: "五段动词", meaning: "挂断", example: "では、失礼します。", exampleTrans: "那么，先挂了。" },
    ],
    grammars: [
      { pattern: "電話をかけます", explanation: "打电话。かける＝打（电话）。", example: "友達に電話をかけます。", exampleTrans: "给朋友打电话。" },
      { pattern: "〜をお願いできますか", explanation: "能拜托您…吗？", example: "伝言をお願いできますか。", exampleTrans: "能麻烦您留言吗？" },
      { pattern: "〜を教えてください", explanation: "请告诉我…。", example: "電話番号を教えてください。", exampleTrans: "请告诉我电话号码。" },
    ],
  },
  {
    id: "ja-date",
    lang: "ja",
    title: "约会",
    icon: "💕",
    description: "日语约会邀请、见面、吃饭约会的表达",
    level: "N4",
    day: 39,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20couple%20date%20park%20sunset%20romantic&image_size=landscape_4_3",
    words: [
      { word: "デート", reading: "デート", romaji: "deeto", pos: "名词/する动词", meaning: "约会", example: "デートに行きたいです。", exampleTrans: "想去约会。" },
      { word: "約束", reading: "ヤクソク", romaji: "yakusoku", pos: "名词/する动词", meaning: "约定", example: "約束しましょう。", exampleTrans: "约好吧。" },
      { word: "会う", reading: "アウ", romaji: "au", pos: "五段动词", meaning: "见面", example: "どこで会いましょうか。", exampleTrans: "在哪里见面呢？" },
      { word: "待ち合わせ", reading: "マチアワセ", romaji: "machiawase", pos: "名词", meaning: "碰头", example: "待ち合わせ場所はどこですか。", exampleTrans: "碰头地点在哪里？" },
      { word: "好き", reading: "スキ", romaji: "suki", pos: "な形容词", meaning: "喜欢", example: "あなたが好きです。", exampleTrans: "我喜欢你。" },
      { word: "告白", reading: "コクハク", romaji: "kokuhaku", pos: "名词/する动词", meaning: "表白", example: "告白したいです。", exampleTrans: "想表白。" },
      { word: "プレゼント", reading: "プレゼント", romaji: "purezento", pos: "名词", meaning: "礼物", example: "誕生日プレゼント", exampleTrans: "生日礼物" },
      { word: "記念日", reading: "キネンビ", romaji: "kinenbi", pos: "名词", meaning: "纪念日", example: "記念日は覚えていますか。", exampleTrans: "记得纪念日吗？" },
    ],
    grammars: [
      { pattern: "〜に行きたいです", explanation: "想去…。", example: "デートに行きたいです。", exampleTrans: "想去约会。" },
      { pattern: "〜で会いましょうか", explanation: "在…见面吧？", example: "駅で会いましょうか。", exampleTrans: "在车站见面吧？" },
      { pattern: "〜が好きです", explanation: "喜欢…。", example: "あなたが好きです。", exampleTrans: "我喜欢你。" },
    ],
  },
  {
    id: "ja-birthday",
    lang: "ja",
    title: "生日",
    icon: "🎂",
    description: "生日祝福、生日礼物、生日派对的表达",
    level: "N5",
    day: 40,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20birthday%20party%20cake%20friends%20celebration&image_size=landscape_4_3",
    words: [
      { word: "誕生日", reading: "タンジョウビ", romaji: "tanjoubi", pos: "名词", meaning: "生日", example: "お誕生日おめでとう！", exampleTrans: "生日快乐！" },
      { word: "おめでとう", reading: "オメデトウ", romaji: "omedetou", pos: "感叹词", meaning: "恭喜", example: "お誕生日おめでとうございます。", exampleTrans: "生日快乐（敬体）。" },
      { word: "プレゼント", reading: "プレゼント", romaji: "purezento", pos: "名词", meaning: "礼物", example: "プレゼントをあげます。", exampleTrans: "送礼物。" },
      { word: "ケーキ", reading: "ケーキ", romaji: "keeki", pos: "名词", meaning: "蛋糕", example: "バースデーケーキ", exampleTrans: "生日蛋糕" },
      { word: "パーティー", reading: "パーティー", romaji: "paatii", pos: "名词", meaning: "派对", example: "パーティーを開きます。", exampleTrans: "开派对。" },
      { word: "ろうそく", reading: "ロウソク", romaji: "rousoku", pos: "名词", meaning: "蜡烛", example: "ろうそくを消します。", exampleTrans: "吹灭蜡烛。" },
      { word: "願い", reading: "ネガイ", romaji: "negai", pos: "名词", meaning: "愿望", example: "願い事をします。", exampleTrans: "许愿。" },
      { word: "何歳", reading: "ナンサイ", romaji: "nansai", pos: "疑问词", meaning: "几岁", example: "何歳になりましたか。", exampleTrans: "几岁了？" },
    ],
    grammars: [
      { pattern: "お誕生日おめでとう", explanation: "生日快乐。お＋名词，表示礼貌。", example: "お誕生日おめでとう！", exampleTrans: "生日快乐！" },
      { pattern: "〜をあげます", explanation: "送给…。あげる＝给、送。", example: "プレゼントをあげます。", exampleTrans: "送礼物。" },
      { pattern: "何歳になりましたか", explanation: "几岁了？なる＝成为、到。", example: "何歳になりましたか。", exampleTrans: "几岁了？" },
    ],
  },
  {
    id: "ja-parttime",
    lang: "ja",
    title: "兼职打工",
    icon: "💰",
    description: "日本找兼职、面试、打工的表达",
    level: "N3",
    day: 41,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20part%20time%20job%20baito%20restaurant%20kitchen%20staff&image_size=landscape_4_3",
    words: [
      { word: "アルバイト", reading: "アルバイト", romaji: "arubaito", pos: "名词/する动词", meaning: "兼职", example: "アルバイトを探しています。", exampleTrans: "正在找兼职。" },
      { word: "時給", reading: "ジキュウ", romaji: "jikyuu", pos: "名词", meaning: "时薪", example: "時給はいくらですか。", exampleTrans: "时薪是多少？" },
      { word: "面接", reading: "メンセツ", romaji: "mensetsu", pos: "名词/する动词", meaning: "面试", example: "面接に行きます。", exampleTrans: "去面试。" },
      { word: "履歴書", reading: "リレキショ", romaji: "rirekisho", pos: "名词", meaning: "简历", example: "履歴書を書きます。", exampleTrans: "写简历。" },
      { word: "シフト", reading: "シフト", romaji: "shifuto", pos: "名词", meaning: "排班", example: "シフトは相談できますか。", exampleTrans: "排班可以商量吗？" },
      { word: "研修", reading: "ケンシュウ", romaji: "kenshuu", pos: "名词/する动词", meaning: "培训", example: "研修があります。", exampleTrans: "有培训。" },
      { word: "求人", reading: "キュウジン", romaji: "kyuujin", pos: "名词", meaning: "招聘", example: "求人を見て電話しました。", exampleTrans: "看到招聘打了电话。" },
      { word: "辞める", reading: "ヤメル", romaji: "yameru", pos: "一段动词", meaning: "辞职", example: "アルバイトを辞めます。", exampleTrans: "辞去兼职。" },
    ],
    grammars: [
      { pattern: "〜を探しています", explanation: "正在找…。", example: "アルバイトを探しています。", exampleTrans: "正在找兼职。" },
      { pattern: "〜はいくらですか", explanation: "…是多少钱？", example: "時給はいくらですか。", exampleTrans: "时薪是多少？" },
      { pattern: "〜はできますか", explanation: "能做…吗？", example: "シフトは相談できますか。", exampleTrans: "排班可以商量吗？" },
    ],
  },
  {
    id: "ja-jobinterview",
    lang: "ja",
    title: "求职面试",
    icon: "👔",
    description: "日本就职活动、面试、自我介绍的表达",
    level: "N3",
    day: 42,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20job%20interview%20suit%20office%20formal&image_size=landscape_4_3",
    words: [
      { word: "就職", reading: "シュウショク", romaji: "shuushoku", pos: "名词/する动词", meaning: "就业", example: "就職活動をしています。", exampleTrans: "正在找工作。" },
      { word: "面接", reading: "メンセツ", romaji: "mensetsu", pos: "名词/する动词", meaning: "面试", example: "面接を受けます。", exampleTrans: "接受面试。" },
      { word: "自己PR", reading: "ジコピーアール", romaji: "jiko piiaaru", pos: "名词", meaning: "自我推销", example: "自己PRをお願いします。", exampleTrans: "请做一下自我推销。" },
      { word: "志望動機", reading: "シボウドウキ", romaji: "shibou douki", pos: "名词", meaning: "应聘动机", example: "志望動機は何ですか。", exampleTrans: "应聘动机是什么？" },
      { word: "長所", reading: "チョウショ", romaji: "chousho", pos: "名词", meaning: "优点", example: "長所は何ですか。", exampleTrans: "你的优点是什么？" },
      { word: "短所", reading: "タンショ", romaji: "tansho", pos: "名词", meaning: "缺点", example: "短所は何ですか。", exampleTrans: "你的缺点是什么？" },
      { word: "入社", reading: "ニュウシャ", romaji: "nyuusha", pos: "名词/する动词", meaning: "入社", example: "いつ入社できますか。", exampleTrans: "什么时候可以入社？" },
      { word: "給料", reading: "キュウリョウ", romaji: "kyuuryou", pos: "名词", meaning: "工资", example: "給料はいくらですか。", exampleTrans: "工资是多少？" },
    ],
    grammars: [
      { pattern: "〜活動をしています", explanation: "正在做…活动。", example: "就職活動をしています。", exampleTrans: "正在找工作。" },
      { pattern: "面接を受けます", explanation: "接受面试。受ける＝接受。", example: "明日面接を受けます。", exampleTrans: "明天接受面试。" },
      { pattern: "〜は何ですか", explanation: "…是什么？", example: "志望動機は何ですか。", exampleTrans: "应聘动机是什么？" },
    ],
  },
  {
    id: "ja-email",
    lang: "ja",
    title: "商务邮件",
    icon: "📧",
    description: "日语商务邮件的书写、敬语表达",
    level: "N3",
    day: 43,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20business%20email%20laptop%20office%20computer%20desk&image_size=landscape_4_3",
    words: [
      { word: "メール", reading: "メール", romaji: "meeru", pos: "名词", meaning: "邮件", example: "メールを送ります。", exampleTrans: "发邮件。" },
      { word: "件名", reading: "ケンメイ", romaji: "kenmei", pos: "名词", meaning: "主题", example: "件名をつけます。", exampleTrans: "加主题。" },
      { word: "宛名", reading: "アテナ", romaji: "atena", pos: "名词", meaning: "收件人", example: "宛名を書きます。", exampleTrans: "写收件人。" },
      { word: "署名", reading: "ショメイ", romaji: "shomei", pos: "名词", meaning: "署名", example: "署名を入れます。", exampleTrans: "加上署名。" },
      { word: "添付ファイル", reading: "テンプファイル", romaji: "tenpu fairu", pos: "名词", meaning: "附件", example: "添付ファイルを確認してください。", exampleTrans: "请确认附件。" },
      { word: "確認", reading: "カクニン", romaji: "kakunin", pos: "名词/する动词", meaning: "确认", example: "ご確認よろしくお願いいたします。", exampleTrans: "拜托您确认。" },
      { word: "返信", reading: "ヘンシン", romaji: "henshin", pos: "名词/する动词", meaning: "回信", example: "返信をお待ちしております。", exampleTrans: "等候您的回信。" },
      { word: "お世話になっております", reading: "オセワニナッテオリマス", romaji: "osewa ni natte orimasu", pos: "寒暄语", meaning: "承蒙关照", example: "いつもお世話になっております。", exampleTrans: "一直承蒙关照。" },
    ],
    grammars: [
      { pattern: "〜を送ります", explanation: "发送…。送る＝发送。", example: "メールを送ります。", exampleTrans: "发邮件。" },
      { pattern: "〜を確認してください", explanation: "请确认…。", example: "添付ファイルを確認してください。", exampleTrans: "请确认附件。" },
      { pattern: "〜をお待ちしております", explanation: "等候您…。谦让语表达。", example: "返信をお待ちしております。", exampleTrans: "等候您的回信。" },
    ],
  },
  {
    id: "ja-apology",
    lang: "ja",
    title: "道歉与感谢",
    icon: "🙏",
    description: "日语各种程度的道歉和感谢表达",
    level: "N4",
    day: 44,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20bowing%20apology%20gratitude%20traditional%20respect&image_size=landscape_4_3",
    words: [
      { word: "すみません", reading: "スミマセン", romaji: "sumimasen", pos: "感叹词", meaning: "不好意思", example: "すみません、遅れました。", exampleTrans: "对不起，迟到了。" },
      { word: "ごめんなさい", reading: "ゴメンナサイ", romaji: "gomen nasai", pos: "感叹词", meaning: "对不起", example: "ごめんなさい。", exampleTrans: "对不起。" },
      { word: "申し訳ありません", reading: "モウシワケアリマセン", romaji: "moushiwake arimasen", pos: "寒暄语", meaning: "非常抱歉", example: "大変申し訳ありません。", exampleTrans: "非常抱歉。" },
      { word: "ありがとう", reading: "アリガトウ", romaji: "arigatou", pos: "感叹词", meaning: "谢谢", example: "ありがとうございます。", exampleTrans: "非常感谢。" },
      { word: "感謝", reading: "カンシャ", romaji: "kansha", pos: "名词/する动词", meaning: "感谢", example: "感謝しています。", exampleTrans: "非常感谢。" },
      { word: "お礼", reading: "オレイ", romaji: "orei", pos: "名词", meaning: "谢意", example: "お礼を言います。", exampleTrans: "道谢。" },
      { word: "迷惑", reading: "メイワク", romaji: "meiwaku", pos: "名词/な形容词", meaning: "麻烦", example: "ご迷惑をおかけします。", exampleTrans: "给您添麻烦了。" },
      { word: "許す", reading: "ユルス", romaji: "yurusu", pos: "五段动词", meaning: "原谅", example: "許してください。", exampleTrans: "请原谅我。" },
    ],
    grammars: [
      { pattern: "すみません、〜", explanation: "对不起，…。万能道歉/感谢开头。", example: "すみません、待たせました。", exampleTrans: "对不起，让你久等了。" },
      { pattern: "大変〜", explanation: "非常…。大変＝非常。", example: "大変申し訳ありません。", exampleTrans: "非常抱歉。" },
      { pattern: "〜てください", explanation: "请…。て形+ください。", example: "許してください。", exampleTrans: "请原谅我。" },
    ],
  },
  {
    id: "ja-computer",
    lang: "ja",
    title: "电脑与网络",
    icon: "💻",
    description: "电脑、手机、网络、WiFi的日语表达",
    level: "N4",
    day: 45,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20computer%20internet%20workspace%20laptop%20smartphone&image_size=landscape_4_3",
    words: [
      { word: "パソコン", reading: "パソコン", romaji: "pasokon", pos: "名词", meaning: "电脑", example: "パソコンを使います。", exampleTrans: "用电脑。" },
      { word: "スマホ", reading: "スマホ", romaji: "sumaho", pos: "名词", meaning: "智能手机", example: "スマホを忘れました。", exampleTrans: "忘带手机了。" },
      { word: "インターネット", reading: "インターネット", romaji: "intaanet", pos: "名词", meaning: "互联网", example: "インターネットが繋がらない。", exampleTrans: "连不上网。" },
      { word: "WiFi", reading: "ワイファイ", romaji: "wai fai", pos: "名词", meaning: "无线网络", example: "WiFiはありますか。", exampleTrans: "有WiFi吗？" },
      { word: "パスワード", reading: "パスワード", romaji: "pasuwaado", pos: "名词", meaning: "密码", example: "パスワードを入力します。", exampleTrans: "输入密码。" },
      { word: "充電", reading: "ジュウデン", romaji: "juuden", pos: "名词/する动词", meaning: "充电", example: "充電したいです。", exampleTrans: "想充电。" },
      { word: "検索", reading: "ケンサク", romaji: "kensaku", pos: "名词/する动词", meaning: "搜索", example: "ネットで検索します。", exampleTrans: "在网上搜索。" },
      { word: "故障", reading: "コショウ", romaji: "koshou", pos: "名词/する动词", meaning: "故障", example: "パソコンが故障しました。", exampleTrans: "电脑坏了。" },
    ],
    grammars: [
      { pattern: "〜を使います", explanation: "使用…。使う＝使用。", example: "パソコンを使います。", exampleTrans: "用电脑。" },
      { pattern: "〜が繋がらない", explanation: "连不上…。繋がる＝连接。", example: "インターネットが繋がらない。", exampleTrans: "连不上网。" },
      { pattern: "〜が故障しました", explanation: "…坏了。故障する＝故障。", example: "パソコンが故障しました。", exampleTrans: "电脑坏了。" },
    ],
  },
  {
    id: "ja-phone",
    lang: "ja",
    title: "手机与SIM卡",
    icon: "📱",
    description: "在日本买手机、办SIM卡、话费的表达",
    level: "N4",
    day: 46,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20smartphone%20SIM%20card%20mobile%20phone%20shop&image_size=landscape_4_3",
    words: [
      { word: "携帯電話", reading: "ケイタイデンワ", romaji: "keitai denwa", pos: "名词", meaning: "手机", example: "携帯電話を買います。", exampleTrans: "买手机。" },
      { word: "スマートフォン", reading: "スマートフォン", romaji: "sumaato fon", pos: "名词", meaning: "智能手机", example: "スマートフォンに変えます。", exampleTrans: "换成智能手机。" },
      { word: "SIMカード", reading: "シムカード", romaji: "shimu kaado", pos: "名词", meaning: "SIM卡", example: "SIMカードを入れ替えます。", exampleTrans: "换SIM卡。" },
      { word: "プリペイド", reading: "プリペイド", romaji: "puripeido", pos: "名词", meaning: "预付", example: "プリペイドSIMはありますか。", exampleTrans: "有预付SIM卡吗？" },
      { word: "料金プラン", reading: "リョウキンプラン", romaji: "ryoukin puran", pos: "名词", meaning: "资费套餐", example: "料金プランを教えてください。", exampleTrans: "请告诉我资费套餐。" },
      { word: "契約", reading: "ケイヤク", romaji: "keiyaku", pos: "名词/する动词", meaning: "签约", example: "新規契約したいです。", exampleTrans: "想新签约。" },
      { word: "解約", reading: "カイヤク", romaji: "kaiyaku", pos: "名词/する动词", meaning: "解约", example: "解約したいです。", exampleTrans: "想解约。" },
      { word: "機種変更", reading: "キシュヘンコウ", romaji: "kishu henkou", pos: "名词", meaning: "换机型", example: "機種変更したいです。", exampleTrans: "想换机型。" },
    ],
    grammars: [
      { pattern: "〜を買います", explanation: "买…。", example: "携帯電話を買います。", exampleTrans: "买手机。" },
      { pattern: "〜に変えます", explanation: "换成…。変える＝改变。", example: "スマートフォンに変えます。", exampleTrans: "换成智能手机。" },
      { pattern: "〜を教えてください", explanation: "请告诉我…。", example: "料金プランを教えてください。", exampleTrans: "请告诉我资费套餐。" },
    ],
  },
  {
    id: "ja-lost",
    lang: "ja",
    title: "失物招领",
    icon: "🔍",
    description: "丢东西、找东西、失物招领处的表达",
    level: "N4",
    day: 47,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20lost%20and%20found%20counter%20station&image_size=landscape_4_3",
    words: [
      { word: "落とす", reading: "オトス", romaji: "otosu", pos: "五段动词", meaning: "弄丢", example: "財布を落としました。", exampleTrans: "把钱包弄丢了。" },
      { word: "なくす", reading: "ナクス", romaji: "nakusu", pos: "五段动词", meaning: "弄丢", example: "鍵をなくしました。", exampleTrans: "把钥匙弄丢了。" },
      { word: "忘れ物", reading: "ワスレモノ", romaji: "wasuremono", pos: "名词", meaning: "遗失物品", example: "忘れ物はありますか。", exampleTrans: "有没有遗失物品？" },
      { word: "忘れ物取扱所", reading: "ワスレモノトリアツカイジョ", romaji: "wasuremono toriatsukaijo", pos: "名词", meaning: "失物招领处", example: "忘れ物取扱所はどこですか。", exampleTrans: "失物招领处在哪里？" },
      { word: "財布", reading: "サイフ", romaji: "saifu", pos: "名词", meaning: "钱包", example: "財布の中にお金が入っています。", exampleTrans: "钱包里装着钱。" },
      { word: "カバン", reading: "カバン", romaji: "kaban", pos: "名词", meaning: "包", example: "黒いカバンです。", exampleTrans: "是黑色的包。" },
      { word: "探す", reading: "サガス", romaji: "sagasu", pos: "五段动词", meaning: "寻找", example: "探しています。", exampleTrans: "正在找。" },
      { word: "見つかる", reading: "ミツカル", romaji: "mitsukaru", pos: "五段动词", meaning: "找到", example: "見つかってよかったです。", exampleTrans: "找到了太好了。" },
    ],
    grammars: [
      { pattern: "〜を落としました", explanation: "把…弄丢了。落とす＝弄丢。", example: "財布を落としました。", exampleTrans: "把钱包弄丢了。" },
      { pattern: "〜はどこですか", explanation: "…在哪里？", example: "忘れ物取扱所はどこですか。", exampleTrans: "失物招领处在哪里？" },
      { pattern: "〜てよかったです", explanation: "…太好了。よかった＝太好了。", example: "見つかってよかったです。", exampleTrans: "找到了太好了。" },
    ],
  },
  {
    id: "ja-police",
    lang: "ja",
    title: "警察局与紧急情况",
    icon: "🚨",
    description: "日本警察局、报警、紧急情况的表达",
    level: "N3",
    day: 48,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20police%20station%20kousatsu%20emergency&image_size=landscape_4_3",
    words: [
      { word: "警察", reading: "ケイサツ", romaji: "keisatsu", pos: "名词", meaning: "警察", example: "警察を呼びます。", exampleTrans: "叫警察。" },
      { word: "交番", reading: "コウバン", romaji: "kouban", pos: "名词", meaning: "派出所", example: "交番はどこですか。", exampleTrans: "派出所在哪里？" },
      { word: "事故", reading: "ジコ", romaji: "jiko", pos: "名词", meaning: "事故", example: "事故に遭いました。", exampleTrans: "遇到了事故。" },
      { word: "盗難", reading: "トウナン", romaji: "tounan", pos: "名词", meaning: "被盗", example: "盗難にあいました。", exampleTrans: "被盗了。" },
      { word: "怪我", reading: "ケガ", romaji: "kega", pos: "名词/する动词", meaning: "受伤", example: "怪我をしました。", exampleTrans: "受伤了。" },
      { word: "救急車", reading: "キュウキュウシャ", romaji: "kyuukyuusha", pos: "名词", meaning: "救护车", example: "救急車を呼んでください。", exampleTrans: "请叫救护车。" },
      { word: "110番", reading: "ヒャクトウバン", romaji: "hyakutouban", pos: "名词", meaning: "110", example: "110番に電話します。", exampleTrans: "打110。" },
      { word: "証言", reading: "ショウゲン", romaji: "shougen", pos: "名词/する动词", meaning: "证言", example: "状況を説明します。", exampleTrans: "说明情况。" },
    ],
    grammars: [
      { pattern: "〜を呼びます", explanation: "叫…。呼ぶ＝叫。", example: "警察を呼びます。", exampleTrans: "叫警察。" },
      { pattern: "〜に遭いました", explanation: "遭遇了…。遭う＝遭遇。", example: "事故に遭いました。", exampleTrans: "遇到了事故。" },
      { pattern: "〜に電話します", explanation: "给…打电话。", example: "110番に電話します。", exampleTrans: "打110。" },
    ],
  },
  {
    id: "ja-disaster",
    lang: "ja",
    title: "地震与灾害",
    icon: "🌋",
    description: "日本地震、台风、防灾相关表达",
    level: "N4",
    day: 49,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20earthquake%20disaster%20prevention%20evacuation&image_size=landscape_4_3",
    words: [
      { word: "地震", reading: "ジシン", romaji: "jishin", pos: "名词", meaning: "地震", example: "地震がありました。", exampleTrans: "发生地震了。" },
      { word: "震度", reading: "シンド", romaji: "shindo", pos: "名词", meaning: "震度", example: "震度はどのくらいですか。", exampleTrans: "震度大约多少？" },
      { word: "避難", reading: "ヒナン", romaji: "hinan", pos: "名词/する动词", meaning: "避难", example: "避難してください。", exampleTrans: "请避难。" },
      { word: "避難所", reading: "ヒナンジョ", romaji: "hinanjo", pos: "名词", meaning: "避难所", example: "避難所はどこですか。", exampleTrans: "避难所在哪里？" },
      { word: "非常口", reading: "ヒジョウグチ", romaji: "hijouguchi", pos: "名词", meaning: "紧急出口", example: "非常口はこちらです。", exampleTrans: "紧急出口在这边。" },
      { word: "揺れ", reading: "ユレ", romaji: "yure", pos: "名词", meaning: "摇晃", example: "大きな揺れを感じました。", exampleTrans: "感觉到了强烈的摇晃。" },
      { word: "防災", reading: "ボウサイ", romaji: "bousai", pos: "名词", meaning: "防灾", example: "防災グッズを準備します。", exampleTrans: "准备防灾用品。" },
      { word: "余震", reading: "ヨシン", romaji: "yoshin", pos: "名词", meaning: "余震", example: "余震に注意してください。", exampleTrans: "请注意余震。" },
    ],
    grammars: [
      { pattern: "地震がありました", explanation: "发生地震了。", example: "昨夜地震がありました。", exampleTrans: "昨晚发生地震了。" },
      { pattern: "〜してください", explanation: "请…。", example: "避難してください。", exampleTrans: "请避难。" },
      { pattern: "〜に注意してください", explanation: "请注意…。注意する＝注意。", example: "余震に注意してください。", exampleTrans: "请注意余震。" },
    ],
  },
  {
    id: "ja-study",
    lang: "ja",
    title: "日语学习",
    icon: "🇯🇵",
    description: "日语学习、汉字、语法相关表达",
    level: "N5",
    day: 50,
    imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20language%20study%20kanji%20textbooks%20notebook&image_size=landscape_4_3",
    words: [
      { word: "日本語", reading: "ニホンゴ", romaji: "nihongo", pos: "名词", meaning: "日语", example: "日本語を勉強しています。", exampleTrans: "正在学习日语。" },
      { word: "勉強", reading: "ベンキョウ", romaji: "benkyou", pos: "名词/する动词", meaning: "学习", example: "毎日勉強します。", exampleTrans: "每天学习。" },
      { word: "漢字", reading: "カンジ", romaji: "kanji", pos: "名词", meaning: "汉字", example: "漢字が難しいです。", exampleTrans: "汉字很难。" },
      { word: "ひらがな", reading: "ヒラガナ", romaji: "hiragana", pos: "名词", meaning: "平假名", example: "ひらがなを覚えました。", exampleTrans: "记住了平假名。" },
      { word: "カタカナ", reading: "カタカナ", romaji: "katakana", pos: "名词", meaning: "片假名", example: "カタカナはまだ難しいです。", exampleTrans: "片假名还很难。" },
      { word: "文法", reading: "ブンポウ", romaji: "bunpou", pos: "名词", meaning: "语法", example: "文法を勉強します。", exampleTrans: "学习语法。" },
      { word: "単語", reading: "タンゴ", romaji: "tango", pos: "名词", meaning: "单词", example: "単語を覚えます。", exampleTrans: "记单词。" },
      { word: "発音", reading: "ハツオン", romaji: "hatsuon", pos: "名词/する动词", meaning: "发音", example: "発音を練習します。", exampleTrans: "练习发音。" },
    ],
    grammars: [
      { pattern: "〜を勉強しています", explanation: "正在学习…。", example: "日本語を勉強しています。", exampleTrans: "正在学习日语。" },
      { pattern: "〜が難しいです", explanation: "…很难。難しい＝难。", example: "漢字が難しいです。", exampleTrans: "汉字很难。" },
      { pattern: "〜を覚えます", explanation: "记住…。覚える＝记住。", example: "単語を覚えます。", exampleTrans: "记单词。" },
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
  if (path === '/translate/daily') {
    // 循环切换题目：每次请求返回下一个
    const idx = getStored<number>('translate-daily-index', 0);
    const task = translateTasks[idx % translateTasks.length];
    setStored('translate-daily-index', idx + 1);
    return ok(task) as T;
  }
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
