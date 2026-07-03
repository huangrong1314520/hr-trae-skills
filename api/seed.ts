import db from './db.js';

export function seedDatabase(): void {
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as any;
  if (courseCount.count > 0) return;

  const insertAll = db.transaction(() => {
    // ===== 群组 =====
    const groupData = [
      { language: 'en', name: 'English Corner', description: 'Practice English together! Share tips, daily expressions, and have fun.' },
      { language: 'ja', name: '日本語交流群', description: '日本語で会話練習！アニメ・ドラマの台詞や日常会話をシェアしよう' },
      { language: 'ko', name: '한국어 스터디', description: '한국어로 대화하고 K-드라마 대사를 함께 공부해요' },
      { language: 'th', name: 'กลุ่มเรียนภาษาไทย', description: 'มาเรียนภาษาไทยด้วยกัน! ฝึกเขียน พูด อ่าน ภาษาไทยแบบสนุกๆ' },
      { language: 'yue', name: '粵語交流群', description: '一齊學粵語！廣東話日常對話、港劇對白、歌曲分享' },
    ];
    const insGroup = db.prepare('INSERT INTO groups_table (language, name, description) VALUES (?, ?, ?)');
    for (const g of groupData) insGroup.run(g.language, g.name, g.description);

    // ===== 徽章 =====
    const badgeData = [
      { name: '初来乍到', description: '完成首次打卡', icon: '🌟', category: 'streak', requirement_type: 'checkins', requirement_value: 1 },
      { name: '连续打卡7天', description: '连续打卡7天', icon: '🔥', category: 'streak', requirement_type: 'streak', requirement_value: 7 },
      { name: '连续打卡30天', description: '连续打卡30天', icon: '💎', category: 'streak', requirement_type: 'streak', requirement_value: 30 },
      { name: '连续打卡100天', description: '连续打卡100天', icon: '👑', category: 'streak', requirement_type: 'streak', requirement_value: 100 },
      { name: '配音新手', description: '完成1个配音作品', icon: '🎤', category: 'dub', requirement_type: 'dub_works', requirement_value: 1 },
      { name: '配音达人', description: '完成10个配音作品', icon: '🎙️', category: 'dub', requirement_type: 'dub_works', requirement_value: 10 },
      { name: '配音大师', description: '完成50个配音作品', icon: '🏅', category: 'dub', requirement_type: 'dub_works', requirement_value: 50 },
      { name: '翻译新手', description: '完成1次翻译', icon: '📝', category: 'translate', requirement_type: 'translations', requirement_value: 1 },
      { name: '翻译之星', description: '完成10次翻译', icon: '📖', category: 'translate', requirement_type: 'translations', requirement_value: 10 },
      { name: '翻译大师', description: '完成100句翻译', icon: '✨', category: 'translate', requirement_type: 'translations', requirement_value: 100 },
      { name: '书写达人', description: '完成10次手写练习', icon: '✍️', category: 'writing', requirement_type: 'handwriting', requirement_value: 10 },
      { name: '社交达人', description: '加入3个学习小组', icon: '👥', category: 'social', requirement_type: 'groups', requirement_value: 3 },
    ];
    const insBadge = db.prepare('INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES (?, ?, ?, ?, ?, ?)');
    for (const b of badgeData) insBadge.run(b.name, b.description, b.icon, b.category, b.requirement_type, b.requirement_value);

    // ===== 课程 =====
    const courseData = [
      { language: 'en', level: 'beginner', title: '英语入门', description: '从零开始学习英语基础词汇和语法', sort_order: 1 },
      { language: 'en', level: 'intermediate', title: '英语进阶', description: '提升英语听说读写综合能力', sort_order: 2 },
      { language: 'en', level: 'advanced', title: '英语高级', description: '达到流利交流和学术英语水平', sort_order: 3 },
      { language: 'ja', level: 'beginner', title: '日语入门', description: '学习五十音图和基础日常会话', sort_order: 1 },
      { language: 'ja', level: 'intermediate', title: '日语进阶', description: '掌握中级语法和动漫台词理解', sort_order: 2 },
      { language: 'ja', level: 'advanced', title: '日语高级', description: '商务日语和文学作品阅读', sort_order: 3 },
      { language: 'ko', level: 'beginner', title: '韩语入门', description: '学习韩文字母和基础会话', sort_order: 1 },
      { language: 'ko', level: 'intermediate', title: '韩语进阶', description: '掌握中级语法和韩剧台词', sort_order: 2 },
      { language: 'ko', level: 'advanced', title: '韩语高级', description: '新闻阅读和深度话题讨论', sort_order: 3 },
      { language: 'th', level: 'beginner', title: '泰语入门', description: '学习泰语字母和基础发音', sort_order: 1 },
      { language: 'th', level: 'intermediate', title: '泰语进阶', description: '掌握日常对话和基本书写', sort_order: 2 },
      { language: 'th', level: 'advanced', title: '泰语高级', description: '泰语文学阅读和流利表达', sort_order: 3 },
    ];
    const insCourse = db.prepare('INSERT INTO courses (language, level, title, description, sort_order) VALUES (?, ?, ?, ?, ?)');
    for (const c of courseData) insCourse.run(c.language, c.level, c.title, c.description, c.sort_order);

    // ===== 单元 =====
    const unitNames = [
      { title: '基础词汇', description: '掌握本课程核心词汇' },
      { title: '实用语法', description: '学习关键语法知识点' },
      { title: '综合练习', description: '听说读写全面训练' },
    ];
    const insUnit = db.prepare('INSERT INTO units (course_id, title, description, sort_order) VALUES (?, ?, ?, ?)');
    const insItem = db.prepare('INSERT INTO unit_items (unit_id, type, content, answer, options, sort_order) VALUES (?, ?, ?, ?, ?, ?)');

    // 各语种内容模板
    const langContent: Record<string, { vocab: { term: string; meaning: string; examples: string[] }[]; grammar: { explanation: string; examples: string[] }[]; listening: { sentence: string; answer: string; options: string[] }[]; speaking: { sentence: string }[] }> = {
      en: {
        vocab: [
          { term: 'hello', meaning: '你好', examples: ['Hello, how are you?', 'Hello, nice to meet you!'] },
          { term: 'goodbye', meaning: '再见', examples: ['Goodbye, see you tomorrow!', 'Say goodbye to your friends.'] },
          { term: 'thank you', meaning: '谢谢', examples: ['Thank you very much!', 'I want to thank you for your help.'] },
          { term: 'please', meaning: '请', examples: ['Please sit down.', 'Could you please help me?'] },
          { term: 'sorry', meaning: '对不起', examples: ['I\'m sorry for being late.', 'Sorry, I didn\'t mean it.'] },
          { term: 'beautiful', meaning: '美丽的', examples: ['What a beautiful day!', 'She is very beautiful.'] },
          { term: 'happy', meaning: '开心的', examples: ['I\'m so happy today!', 'Happy birthday to you!'] },
          { term: 'friend', meaning: '朋友', examples: ['She is my best friend.', 'We have been friends for years.'] },
          { term: 'love', meaning: '爱', examples: ['I love learning English.', 'Love is all you need.'] },
          { term: 'dream', meaning: '梦想', examples: ['Never give up on your dreams.', 'I had a strange dream last night.'] },
          { term: 'travel', meaning: '旅行', examples: ['I love to travel around the world.', 'Where do you want to travel next?'] },
          { term: 'music', meaning: '音乐', examples: ['I enjoy listening to music.', 'Music is the universal language.'] },
        ],
        grammar: [
          { explanation: '英语基本句型：主语 + 谓语 + 宾语。例如 "I love you"，其中 "I" 是主语，"love" 是谓语，"you" 是宾语。', examples: ['I like coffee.', 'She reads books.', 'They play football.'] },
          { explanation: '一般现在时：表示经常性、习惯性的动作或状态。主语为第三人称单数时，动词加 -s 或 -es。', examples: ['He goes to school every day.', 'The sun rises in the east.', 'She does her homework in the evening.'] },
          { explanation: '现在进行时：be + 动词-ing，表示正在进行的动作。', examples: ['I am reading a book now.', 'She is cooking dinner.', 'They are playing basketball outside.'] },
          { explanation: '一般过去时：表示过去发生的动作或状态。规则动词加 -ed，不规则动词需要特殊记忆。', examples: ['I went to the park yesterday.', 'She cooked a delicious meal.', 'We watched a movie last night.'] },
        ],
        listening: [
          { sentence: 'The weather is beautiful today', answer: 'beautiful', options: ['beautiful', 'terrible', 'cold', 'hot'] },
          { sentence: 'I would like a cup of coffee please', answer: 'coffee', options: ['tea', 'coffee', 'water', 'juice'] },
          { sentence: 'She goes to the library every weekend', answer: 'library', options: ['school', 'library', 'park', 'mall'] },
          { sentence: 'They are planning a trip to Japan', answer: 'Japan', options: ['Korea', 'China', 'Japan', 'Thailand'] },
        ],
        speaking: [
          { sentence: 'Hello, how are you doing today?' },
          { sentence: 'I really enjoy learning new languages.' },
          { sentence: 'The weather is lovely this evening.' },
          { sentence: 'Would you like to grab a coffee sometime?' },
        ],
      },
      ja: {
        vocab: [
          { term: 'こんにちは', meaning: '你好', examples: ['こんにちは、いい天気ですね。', 'こんにちは、初めまして。'] },
          { term: 'ありがとう', meaning: '谢谢', examples: ['ありがとうございます。', '色々ありがとう！'] },
          { term: 'すみません', meaning: '对不起/打扰了', examples: ['すみません、駅はどこですか？', '遅れてすみません。'] },
          { term: 'おはよう', meaning: '早上好', examples: ['おはようございます！', 'おはよう、今日も頑張ろう。'] },
          { term: 'さようなら', meaning: '再见', examples: ['さようなら、また明日。', 'さようなら、気をつけて。'] },
          { term: '美味しい', meaning: '好吃的', examples: ['このラーメンは美味しい！', '美味しい料理を作りました。'] },
          { term: '楽しい', meaning: '开心的', examples: ['旅行はとても楽しかった。', '楽しい時間を過ごしました。'] },
          { term: '友達', meaning: '朋友', examples: ['彼は私の親友です。', '友達と映画を見に行く。'] },
          { term: '勉強', meaning: '学习', examples: ['日本語を勉強しています。', '毎日勉強する習慣が大切です。'] },
          { term: '天気', meaning: '天气', examples: ['今日の天気はどうですか？', '天気予報によると明日は雨です。'] },
          { term: '映画', meaning: '电影', examples: ['週末に映画を見に行こう。', 'この映画はとても感動的です。'] },
          { term: '夢', meaning: '梦想', examples: ['私の夢は日本に行くことです。', '夢を追いかけるのは素晴らしい。'] },
        ],
        grammar: [
          { explanation: '日语基本句型：主语 + は + 宾语 + を + 动词。例如「私は日本語を勉強します」，其中「私」是主语，「日本語」是宾语，「勉強します」是动词。', examples: ['私は本を読みます。', '彼は映画を見ます。', '彼女は手紙を書きます。'] },
          { explanation: 'です/ます体：礼貌体，用于正式场合或对不熟悉的人说话。', examples: ['これは本です。', '私は学生です。', '明日は休みです。'] },
          { explanation: 'て形：连接动词，表示动作的先后顺序或原因。', examples: ['朝起きて、顔を洗います。', '映画を見て、感動しました。', 'ご飯を食べて、出かけます。'] },
          { explanation: 'た形：过去式，表示已经完成的动作。', examples: ['昨日、映画を見た。', 'もう宿題をやった？', '先週、京都に行った。'] },
        ],
        listening: [
          { sentence: '私は毎朝コーヒーを飲みます', answer: 'コーヒー', options: ['お茶', 'コーヒー', 'ジュース', '水'] },
          { sentence: '昨日はとても楽しかったです', answer: '楽しかった', options: ['嬉しかった', '悲しかった', '楽しかった', '難しかった'] },
          { sentence: '来週の土曜日に映画を見に行きませんか', answer: '映画', options: ['買い物', '映画', '旅行', '食事'] },
          { sentence: '日本の桜は本当に美しいですね', answer: '桜', options: ['梅', '桜', '菊', '藤'] },
        ],
        speaking: [
          { sentence: 'おはようございます、今日も一日頑張りましょう！' },
          { sentence: '日本語を勉強するのはとても楽しいです。' },
          { sentence: '来週、友達と一緒に京都へ旅行に行きます。' },
          { sentence: 'このアニメの台詞が大好きです。「俺は絶対に諦めない！」' },
        ],
      },
      ko: {
        vocab: [
          { term: '안녕하세요', meaning: '你好', examples: ['안녕하세요, 반갑습니다.', '안녕하세요, 오늘 날씨가 좋네요.'] },
          { term: '감사합니다', meaning: '谢谢', examples: ['정말 감사합니다.', '도와주셔서 감사합니다.'] },
          { term: '죄송합니다', meaning: '对不起', examples: ['늦어서 죄송합니다.', '실례해서 죄송합니다.'] },
          { term: '사랑해요', meaning: '我爱你', examples: ['진심으로 사랑해요.', '항상 사랑해요.'] },
          { term: '친구', meaning: '朋友', examples: ['제일 친한 친구입니다.', '친구와 함께 공부해요.'] },
          { term: '맛있어요', meaning: '好吃', examples: ['이 김치가 정말 맛있어요.', '엄마가 만든 음식이 제일 맛있어요.'] },
          { term: '행복해요', meaning: '幸福', examples: ['오늘 정말 행복해요.', '함께 있으면 행복해요.'] },
          { term: '공부', meaning: '学习', examples: ['한국어를 공부하고 있어요.', '매일 공부하는 습관이 중요해요.'] },
          { term: '음악', meaning: '音乐', examples: ['음악 듣는 것을 좋아해요.', 'K-pop 음악이 정말 좋아요.'] },
          { term: '여행', meaning: '旅行', examples: ['한국으로 여행 가고 싶어요.', '여행은 인생의 즐거움입니다.'] },
          { term: '드라마', meaning: '电视剧', examples: ['한국 드라마를 자주 봐요.', '이 드라마 정말 재미있어요.'] },
          { term: '꿈', meaning: '梦想', examples: ['제 꿈은 한국어를 잘하는 거예요.', '꿈을 포기하지 마세요.'] },
        ],
        grammar: [
          { explanation: '韩语基本句型：主语 + 宾语 + 动词。例如「저는 한국어를 공부해요」，语序和日语相同。', examples: ['저는 책을 읽어요.', '친구가 영화를 봐요.', '엄마가 요리를 해요.'] },
          { explanation: '요体：最基本的礼貌体，用于日常对话。', examples: ['안녕하세요.', '감사합니다.', '맛있어요.'] },
          { explanation: '过去式：动词词干 + 았/었/했 + 어요。', examples: ['어제 영화를 봤어요.', '점심을 먹었어요.', '공부를 열심히 했어요.'] },
          { explanation: '将来式：动词词干 + 을/ㄹ 거예요。', examples: ['내일 갈 거예요.', '주말에 만날 거예요.', '한국어를 계속 공부할 거예요.'] },
        ],
        listening: [
          { sentence: '오늘 날씨가 정말 좋네요', answer: '날씨', options: ['음식', '날씨', '음악', '영화'] },
          { sentence: '저는 매일 아침 커피를 마셔요', answer: '커피', options: ['우유', '주스', '커피', '차'] },
          { sentence: '주말에 친구랑 영화 보러 갈 거예요', answer: '영화', options: ['쇼핑', '영화', '여행', '공부'] },
          { sentence: '한국 음식 중에서 불고기가 제일 맛있어요', answer: '불고기', options: ['김치', '불고기', '비빔밥', '떡볶이'] },
        ],
        speaking: [
          { sentence: '안녕하세요! 만나서 반갑습니다.' },
          { sentence: '한국어 공부가 정말 재미있어요.' },
          { sentence: '이번 주말에 뭐 할 거예요?' },
          { sentence: '한국 드라마 보는 걸 정말 좋아해요.' },
        ],
      },
      th: {
        vocab: [
          { term: 'สวัสดี', meaning: '你好', examples: ['สวัสดีครับ สบายดีไหม', 'สวัสดีค่ะ ยินดีที่ได้รู้จัก'] },
          { term: 'ขอบคุณ', meaning: '谢谢', examples: ['ขอบคุณมากครับ', 'ขอบคุณสำหรับความช่วยเหลือ'] },
          { term: 'ขอโทษ', meaning: '对不起', examples: ['ขอโทษครับ', 'ขอโทษที่มาสาย'] },
          { term: 'รัก', meaning: '爱', examples: ['ผมรักคุณ', 'รักนะคะ'] },
          { term: 'เพื่อน', meaning: '朋友', examples: ['เขาเป็นเพื่อนที่ดีที่สุด', 'ไปเที่ยวกับเพื่อน'] },
          { term: 'อร่อย', meaning: '好吃', examples: ['อาหารไทยอร่อยมาก', 'อันนี้อร่อยจัง'] },
          { term: 'สวย', meaning: '漂亮', examples: ['คุณสวยมาก', 'วิวสวยมาก'] },
          { term: 'เรียน', meaning: '学习', examples: ['ฉันเรียนภาษาไทย', 'เรียนทุกวันทำให้เก่งขึ้น'] },
          { term: 'สนุก', meaning: '有趣', examples: ['การเรียนภาษาสนุกมาก', 'เมื่อวานสนุกมาก'] },
          { term: 'เที่ยว', meaning: '旅行', examples: ['อยากไปเที่ยวเมืองไทย', 'เที่ยวให้สนุกนะ'] },
          { term: 'เพลง', meaning: '歌曲', examples: ['ชอบฟังเพลงไทย', 'เพลงนี้เพราะมาก'] },
          { term: 'ฝัน', meaning: '梦想', examples: ['ฝันว่าอยากพูดไทยได้', 'ขอให้ฝันเป็นจริง'] },
        ],
        grammar: [
          { explanation: '泰语基本语序：主语 + 动词 + 宾语。和中文语序相同。例如「ฉันกินข้าว」（我吃饭）。', examples: ['ฉันอ่านหนังสือ', 'เขาดูหนัง', 'แม่ทำอาหาร'] },
          { explanation: 'ครับ/ค่ะ：礼貌结尾词。男性用ครับ，女性用ค่ะ。', examples: ['สวัสดีครับ', 'ขอบคุณค่ะ', 'ไปก่อนนะครับ'] },
          { explanation: 'กำลัง...อยู่：表示正在进行的动作。', examples: ['กำลังกินข้าวอยู่', 'กำลังอ่านหนังสืออยู่', 'กำลังขับรถอยู่'] },
          { explanation: 'แล้ว：表示已经完成的动作。', examples: ['กินข้าวแล้ว', 'ทำการบ้านแล้ว', 'ไปเที่ยวมาแล้ว'] },
        ],
        listening: [
          { sentence: 'วันนี้อากาศดีมากเลยครับ', answer: 'อากาศ', options: ['อาหาร', 'อากาศ', 'อารมณ์', 'หนังสือ'] },
          { sentence: 'ผมชอบกินอาหารไทยมาก', answer: 'อาหารไทย', options: ['อาหารจีน', 'อาหารไทย', 'อาหารญี่ปุ่น', 'อาหารเกาหลี'] },
          { sentence: 'สุดสัปดาห์นี้เราจะไปเที่ยวทะเลกัน', answer: 'ทะเล', options: ['ภูเขา', 'ทะเล', 'เมือง', 'ป่า'] },
          { sentence: 'คุณพูดภาษาไทยได้ดีมากเลย', answer: 'ภาษาไทย', options: ['ภาษาอังกฤษ', 'ภาษาไทย', 'ภาษาจีน', 'ภาษาญี่ปุ่น'] },
        ],
        speaking: [
          { sentence: 'สวัสดีครับ ยินดีที่ได้รู้จักครับ' },
          { sentence: 'ผมชอบเรียนภาษาไทยมากครับ' },
          { sentence: 'วันนี้คุณเป็นอย่างไรบ้างครับ' },
          { sentence: 'อาหารไทยอร่อยที่สุดในโลกเลยครับ' },
        ],
      },
    };

    // 为每个课程创建3个单元，每个单元4个items
    const courses = db.prepare('SELECT * FROM courses ORDER BY id').all() as any[];
    for (const course of courses) {
      const content = langContent[course.language];
      if (!content) continue;

      for (let ui = 0; ui < 3; ui++) {
        const unit = unitNames[ui];
        const result = insUnit.run(course.id, unit.title, unit.description, ui);

        const unitId = result.lastInsertRowid as number;
        const baseIdx = ui * 4;

        // vocab
        const vocabItem = content.vocab[baseIdx % content.vocab.length];
        insItem.run(unitId, 'vocab', JSON.stringify(vocabItem), vocabItem.term, null, 0);

        // grammar
        const grammarItem = content.grammar[ui % content.grammar.length];
        insItem.run(unitId, 'grammar', JSON.stringify(grammarItem), grammarItem.explanation, null, 1);

        // listening
        const listenItem = content.listening[ui % content.listening.length];
        insItem.run(unitId, 'listening', JSON.stringify(listenItem), listenItem.answer, JSON.stringify(listenItem.options), 2);

        // speaking
        const speakItem = content.speaking[ui % content.speaking.length];
        insItem.run(unitId, 'speaking', JSON.stringify(speakItem), speakItem.sentence, null, 3);
      }
    }

    // ===== 配音素材 =====
    const materialData = [
      { language: 'ja', title: '鬼滅の刃 - 鎹鴉の伝令', source: '鬼滅の刃', level: 'intermediate', type: 'anime', duration: 90 },
      { language: 'ja', title: '千と千尋の神隠し - 名前を返して', source: '千と千尋の神隠し', level: 'beginner', type: 'anime', duration: 60 },
      { language: 'ja', title: '呪術廻戦 - 五条悟の領域展開', source: '呪術廻戦', level: 'advanced', type: 'anime', duration: 120 },
      { language: 'en', title: 'Friends - The One Where It All Began', source: 'Friends', level: 'intermediate', type: 'drama', duration: 180 },
      { language: 'en', title: 'The Dark Knight - Why So Serious', source: 'The Dark Knight', level: 'advanced', type: 'movie', duration: 100 },
      { language: 'en', title: 'Sherlock - A Study in Pink', source: 'Sherlock', level: 'advanced', type: 'drama', duration: 150 },
      { language: 'ko', title: '오징어 게임 - 무궁화 꽃이 피었습니다', source: '오징어 게임', level: 'intermediate', type: 'drama', duration: 80 },
      { language: 'th', title: 'สิ่งเล็กๆ ที่เรียกว่ารัก - คำสารภาพ', source: 'สิ่งเล็กๆ ที่เรียกว่ารัก', level: 'beginner', type: 'movie', duration: 70 },
    ];
    const insMaterial = db.prepare('INSERT INTO dub_materials (language, title, source, level, type, duration) VALUES (?, ?, ?, ?, ?, ?)');
    const insLine = db.prepare('INSERT INTO dub_lines (material_id, line_index, original_text, translation_text, sort_order) VALUES (?, ?, ?, ?, ?)');

    const lineData: Record<number, { original: string; translation: string }[]> = {
      1: [ // 鬼滅の刃
        { original: '来たぞ！来たぞ！新たな任務だ！', translation: '来了！来了！新任务来了！' },
        { original: '次の目的地は那田蜘蛛山だ！', translation: '下一个目的地是那田蜘蛛山！' },
        { original: '気をつけて行けよ！', translation: '小心点去吧！' },
        { original: '俺は次の隊士のところへ行く！', translation: '我去下一个队员那里了！' },
      ],
      2: [ // 千と千尋
        { original: 'ここで働かせてください！', translation: '请让我在这里工作！' },
        { original: 'お名前は千尋っていうんだね', translation: '你的名字叫千寻呢' },
        { original: '自分の名前を大切にね', translation: '要珍惜自己的名字哦' },
      ],
      3: [ // 呪術廻戦
        { original: '領域展開　無量空処', translation: '领域展开 无量空处' },
        { original: '大丈夫、僕は最強だから', translation: '没关系，因为我是最强的' },
        { original: '呪術師としての使命を果たす', translation: '履行作为咒术师的使命' },
      ],
      4: [ // Friends
        { original: 'So no one told you life was gonna be this way', translation: '没人告诉你生活会是这样' },
        { original: 'Your job\'s a joke, you\'re broke', translation: '你工作可笑，一文不名' },
        { original: 'Your love life\'s DOA', translation: '你的爱情一败涂地' },
        { original: 'It\'s like you\'re always stuck in second gear', translation: '就像永远卡在二档' },
        { original: 'I\'ll be there for you!', translation: '我会在你身边！' },
      ],
      5: [ // The Dark Knight
        { original: 'Why so serious?', translation: '干嘛这么严肃？' },
        { original: 'Let\'s put a smile on that face', translation: '让我们在那张脸上画个笑脸' },
        { original: 'I believe whatever doesn\'t kill you simply makes you stranger', translation: '我相信杀不死你的只会让你变得更奇怪' },
      ],
      6: [ // Sherlock
        { original: 'The game is afoot!', translation: '游戏开始了！' },
        { original: 'I\'m not a psychopath, I\'m a high-functioning sociopath', translation: '我不是精神病，我是高功能反社会人格' },
        { original: 'When you have eliminated the impossible, whatever remains must be the truth', translation: '排除所有不可能之后，剩下的就是真相' },
      ],
      7: [ // 오징어 게임
        { original: '무궁화 꽃이 피었습니다', translation: '木槿花开了' },
        { original: '이 게임은 마지막까지 살아남는 사람이 승리합니다', translation: '这个游戏，活到最后的人获胜' },
        { original: '다시 한 번 기회를 드리겠습니다', translation: '我会再给你们一次机会' },
      ],
      8: [ // สิ่งเล็กๆ
        { original: 'เราชอบพี่นะ', translation: '我喜欢你' },
        { original: 'สิ่งเล็กๆ ที่เรียกว่ารัก', translation: '那些小事，叫做爱' },
        { original: 'ขอบคุณที่ทำให้ฉันรู้จักความรัก', translation: '谢谢你让我懂得了爱' },
      ],
    };

    for (const m of materialData) {
      const result = insMaterial.run(m.language, m.title, m.source, m.level, m.type, m.duration);
      const materialId = result.lastInsertRowid as number;
      const lines = lineData[materialId] || [];
      lines.forEach((l, idx) => {
        insLine.run(materialId, idx, l.original, l.translation, idx);
      });
    }

    // ===== 翻译任务 =====
    const taskData = [
      { language: 'ja', source_text: '今日はとてもいい天気ですね', source_lang: 'ja', target_lang: 'zh', reference_translation: '今天天气真好啊', source_info: '日常会話', difficulty: 'beginner', is_daily: 1 },
      { language: 'ja', source_text: '努力は必ず報われると信じている', source_lang: 'ja', target_lang: 'zh', reference_translation: '我相信努力一定会有回报', source_info: '励志名言', difficulty: 'beginner', is_daily: 1 },
      { language: 'ja', source_text: '一期一会の出会いを大切にしたい', source_lang: 'ja', target_lang: 'zh', reference_translation: '想珍惜一期一会的相遇', source_info: '茶道の心', difficulty: 'intermediate', is_daily: 1 },
      { language: 'ja', source_text: '桜の花びらが風に舞っている', source_lang: 'ja', target_lang: 'zh', reference_translation: '樱花花瓣在风中飞舞', source_info: '俳句', difficulty: 'intermediate', is_daily: 0 },
      { language: 'en', source_text: 'The only way to do great work is to love what you do', source_lang: 'en', target_lang: 'zh', reference_translation: '做出伟大成就的唯一途径是热爱你所做的事', source_info: 'Steve Jobs', difficulty: 'intermediate', is_daily: 1 },
      { language: 'en', source_text: 'Not all those who wander are lost', source_lang: 'en', target_lang: 'zh', reference_translation: '并非所有流浪者都迷失了方向', source_info: 'J.R.R. Tolkien', difficulty: 'intermediate', is_daily: 0 },
      { language: 'en', source_text: 'Every cloud has a silver lining', source_lang: 'en', target_lang: 'zh', reference_translation: '黑暗中总有一线光明', source_info: 'English Proverb', difficulty: 'beginner', is_daily: 1 },
      { language: 'en', source_text: 'To be or not to be, that is the question', source_lang: 'en', target_lang: 'zh', reference_translation: '生存还是毁灭，这是个问题', source_info: 'Hamlet', difficulty: 'advanced', is_daily: 0 },
      { language: 'ko', source_text: '오늘 하루도 화이팅!', source_lang: 'ko', target_lang: 'zh', reference_translation: '今天也要加油！', source_info: '日常応援', difficulty: 'beginner', is_daily: 1 },
      { language: 'ko', source_text: '사랑은 타이밍이 아니라 운명이에요', source_lang: 'ko', target_lang: 'zh', reference_translation: '爱情不是时机，而是命运', source_info: '韓国ドラマ', difficulty: 'intermediate', is_daily: 0 },
      { language: 'th', source_text: 'ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น', source_lang: 'th', target_lang: 'zh', reference_translation: '努力在哪里，成功就在那里', source_info: 'สุภาษิตไทย', difficulty: 'beginner', is_daily: 1 },
      { language: 'th', source_text: 'ชีวิตคือการเดินทาง ไม่ใช่จุดหมายปลายทาง', source_lang: 'th', target_lang: 'zh', reference_translation: '人生是旅程，不是终点', source_info: '名言', difficulty: 'intermediate', is_daily: 0 },
    ];
    const insTask = db.prepare('INSERT INTO translate_tasks (language, source_text, source_lang, target_lang, reference_translation, source_info, difficulty, is_daily) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const t of taskData) insTask.run(t.language, t.source_text, t.source_lang, t.target_lang, t.reference_translation, t.source_info, t.difficulty, t.is_daily);
  });

  insertAll();
  console.log('Database seeded successfully.');
}