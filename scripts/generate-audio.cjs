// 自动生成缺失的日语单词音频
// 用法: node scripts/generate-audio.cjs
// 会扫描所有需要发音的日语文本，对没有内嵌音频的自动调用百度TTS生成base64并写入 audioData.ts

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const AUDIO_FILE = path.join(ROOT, 'src/utils/audioData.ts');

// 读取内嵌音频 key
function getEmbeddedKeys() {
  if (!fs.existsSync(AUDIO_FILE)) return new Set();
  const content = fs.readFileSync(AUDIO_FILE, 'utf-8');
  const keys = new Set();
  const regex = /\n\s+'([^']+)'\s*:/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

// 扫描需要发音的日语文本（与 check-audio-coverage.cjs 逻辑一致）
function scanJapaneseWords() {
  const words = new Set();

  function addWord(word) {
    if (!word || word.length < 1) return;
    if (!/[ぁ-ん一-龯]/.test(word) && !/[\u30A1-\u30FA]/.test(word)) return;
    if (/^[\u4e00-\u9fff]+$/.test(word)) return;
    if (/^[、。！？・・・…ー「」『』（）]+$/.test(word)) return;
    words.add(word);
  }

  const apiFile = path.join(ROOT, 'src/utils/api.ts');
  if (fs.existsSync(apiFile)) {
    const content = fs.readFileSync(apiFile, 'utf-8');
    const wordRegex = /word:\s*"([^"]+)"/g;
    let m;
    while ((m = wordRegex.exec(content)) !== null) {
      addWord(m[1]);
    }
    const exampleRegex = /example:\s*"([^"]+)"/g;
    while ((m = exampleRegex.exec(content)) !== null) {
      addWord(m[1]);
    }
  }

  // 扫描 speakJa 调用
  const srcDir = path.join(ROOT, 'src');
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (/\.(ts|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const speakRegex = /speakJa\(\s*["'`]([^"'`]+)["'`]/g;
        let m;
        while ((m = speakRegex.exec(content)) !== null) {
          addWord(m[1]);
        }
      }
    }
  }
  walkDir(srcDir);

  return words;
}

// 从百度 TTS 下载音频并返回 base64 data URI
function fetchTts(text) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://fanyi.baidu.com/gettts?lan=jp&text=${encoded}&spd=3&source=web`;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://fanyi.baidu.com/',
      },
      timeout: 15000,
    };

    const req = https.get(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          reject(new Error(`音频太小 (${buffer.length} bytes)`));
          return;
        }
        const b64 = buffer.toString('base64');
        resolve(`data:audio/mpeg;base64,${b64}`);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 延迟函数
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 把新条目写入 audioData.ts
function appendToAudioData(newEntries) {
  const content = fs.readFileSync(AUDIO_FILE, 'utf-8');
  const lines = content.split('\n');

  // 找到 JA_AUDIO_DATA 对象结束位置
  let endIdx = -1;
  let inObject = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const JA_AUDIO_DATA') || lines[i].includes('export const JA_AUDIO_DATA')) {
      inObject = true;
    }
    if (inObject && lines[i].trim().startsWith('};')) {
      endIdx = i;
      break;
    }
  }

  if (endIdx === -1) {
    throw new Error('找不到 JA_AUDIO_DATA 对象结束位置');
  }

  // 插入新条目（按字母排序）
  const insertLines = [];
  for (const word of Object.keys(newEntries).sort()) {
    insertLines.push(`  '${word}': '${newEntries[word]}',`);
  }

  const newLines = [...lines.slice(0, endIdx), ...insertLines, ...lines.slice(endIdx)];
  fs.writeFileSync(AUDIO_FILE, newLines.join('\n'), 'utf-8');
}

async function main() {
  const embedded = getEmbeddedKeys();
  const allWords = scanJapaneseWords();
  const missing = [...allWords].filter((w) => !embedded.has(w));

  console.log(`\n🔊 日语音频生成工具`);
  console.log(`内嵌音频: ${embedded.size}`);
  console.log(`需发音数: ${allWords.size}`);
  console.log(`待生成:   ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('✅ 所有日语文本都有内嵌音频，无需生成\n');
    return;
  }

  const newEntries = {};
  const failed = [];

  for (let i = 0; i < missing.length; i++) {
    const word = missing[i];
    process.stdout.write(`  [${i + 1}/${missing.length}] ${word} ... `);
    try {
      const dataUri = await fetchTts(word);
      newEntries[word] = dataUri;
      process.stdout.write('✅\n');
    } catch (e) {
      failed.push(word);
      process.stdout.write(`❌ ${e.message}\n`);
    }

    // 每 20 个输出一次进度汇总
    if ((i + 1) % 20 === 0) {
      console.log(`  --- 进度: ${i + 1}/${missing.length}, 成功: ${Object.keys(newEntries).length}, 失败: ${failed.length} ---`);
    }

    // 礼貌性延迟
    await delay(200);
  }

  console.log(`\n生成完成: 成功 ${Object.keys(newEntries).length}, 失败 ${failed.length}`);

  if (Object.keys(newEntries).length > 0) {
    appendToAudioData(newEntries);
    console.log(`✅ 已写入 audioData.ts，新增 ${Object.keys(newEntries).length} 条音频\n`);
  }

  if (failed.length > 0) {
    console.log(`⚠️  失败列表: ${failed.slice(0, 10).join(', ')}${failed.length > 10 ? '...' : ''}\n`);
  }
}

main().catch((e) => {
  console.error('生成失败:', e);
  process.exit(1);
});
