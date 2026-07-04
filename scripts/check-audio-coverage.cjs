// 日语发音覆盖率检查脚本
// 扫描所有需要发音的日语文本，检查是否有对应的内嵌音频
// 在构建前自动运行，确保新增日语内容都有发音

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// 1. 读取内嵌音频数据中的所有 key
function getEmbeddedKeys() {
  const audioFile = path.join(ROOT, 'src/utils/audioData.ts');
  if (!fs.existsSync(audioFile)) {
    console.warn('⚠️  audioData.ts 不存在，跳过检查');
    return new Set();
  }
  const content = fs.readFileSync(audioFile, 'utf-8');
  const keys = new Set();
  const regex = /\n\s+'([^']+)'\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

// 2. 扫描需要发音的日语文本
function scanJapaneseWords() {
  const words = new Set();
  const sources = {};

  function addWord(word, source) {
    if (!word || word.length < 1) return;
    // 必须包含假名或汉字，排除纯片假名（可能是注音）、纯符号、纯中文
    if (!/[ぁ-ん一-龯]/.test(word) && !/[\u30A1-\u30FA]/.test(word)) return;
    // 排除纯中文
    if (/^[\u4e00-\u9fff]+$/.test(word)) return;
    // 排除太短的纯符号
    if (/^[、。！？・・・…ー「」『』（）]+$/.test(word)) return;
    words.add(word);
    if (!sources[word]) sources[word] = [];
    sources[word].push(source);
  }

  // 2.1 api.ts 中的场景课程单词（平假名/汉字，主要发音对象）
  const apiFile = path.join(ROOT, 'src/utils/api.ts');
  if (fs.existsSync(apiFile)) {
    const content = fs.readFileSync(apiFile, 'utf-8');

    // word 字段：核心发音对象
    const wordRegex = /word:\s*"([^"]+)"/g;
    let m;
    while ((m = wordRegex.exec(content)) !== null) {
      addWord(m[1], 'api.ts - 场景单词');
    }

    // example 字段：例句发音
    const exampleRegex = /example:\s*"([^"]+)"/g;
    while ((m = exampleRegex.exec(content)) !== null) {
      addWord(m[1], 'api.ts - 例句');
    }
  }

  // 2.2 扫描所有页面组件中使用 speakJa 的文本
  // 查找 speakJa("...") 或 speakJa('...') 的调用
  const srcDir = path.join(ROOT, 'src');
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relPath = path.relative(ROOT, fullPath);

        // 查找 speakJa("...") / speakJa('...') 调用
        const speakRegex = /speakJa\(\s*["'`]([^"'`]+)["'`]/g;
        let m;
        while ((m = speakRegex.exec(content)) !== null) {
          addWord(m[1], `${relPath} - speakJa调用`);
        }
      }
    }
  }
  walkDir(srcDir);

  return { words, sources };
}

// 3. 检查覆盖率
function main() {
  const embedded = getEmbeddedKeys();
  const { words, sources } = scanJapaneseWords();

  const total = words.size;
  let covered = 0;
  const missing = [];

  for (const word of words) {
    if (embedded.has(word)) {
      covered++;
    } else {
      missing.push(word);
    }
  }

  const coverage = total > 0 ? (covered / total * 100).toFixed(1) : '100.0';

  console.log('\n' + '='.repeat(60));
  console.log('🔊 日语发音覆盖率检查');
  console.log('='.repeat(60));
  console.log(`内嵌音频总数: ${embedded.size}`);
  console.log(`需发音文本数: ${total}`);
  console.log(`有内嵌音频:   ${covered}`);
  console.log(`无内嵌音频:   ${total - covered}`);
  console.log(`覆盖率:       ${coverage}%`);
  console.log('='.repeat(60));

  if (missing.length > 0) {
    console.log('\n⚠️  以下文本没有内嵌音频:');
    console.log('-'.repeat(60));
    // 按来源分组显示
    const missingBySource = {};
    for (const word of missing) {
      const src = sources[word]?.[0] || '未知来源';
      if (!missingBySource[src]) missingBySource[src] = [];
      missingBySource[src].push(word);
    }
    for (const [src, ws] of Object.entries(missingBySource)) {
      console.log(`\n  📄 ${src} (${ws.length}个):`);
      for (const w of ws.slice(0, 15)) {
        console.log(`     • ${w}`);
      }
      if (ws.length > 15) {
        console.log(`     ... 还有 ${ws.length - 15} 个`);
      }
    }
    console.log('\n' + '-'.repeat(60));
    console.log('💡 运行 npm run generate:audio 可自动生成缺失音频');
    console.log('='.repeat(60));

    // 覆盖率低于 95% 时发出警告但不阻止构建
    if (parseFloat(coverage) < 95) {
      console.log(`\n⚠️  发音覆盖率 ${coverage}% 低于 95%，建议生成缺失音频`);
    }
  } else {
    console.log('\n✅ 所有需要发音的日语文本都有内嵌音频，覆盖率 100%！');
    console.log('='.repeat(60) + '\n');
  }

  return { coverage: parseFloat(coverage), total, covered, missing };
}

const result = main();
// 始终退出成功，只做提示不阻止构建
process.exit(0);
