
const fs = require('fs');
const path = require('path');

const STATIC_DATA_PATH = path.join(__dirname, 'src', 'data', 'staticData.ts');
const EXPORTED_DATA_PATH = path.join(__dirname, 'public', 'exported-data.json');

function loadData() {
  try {
    if (fs.existsSync(EXPORTED_DATA_PATH)) {
      const rawData = fs.readFileSync(EXPORTED_DATA_PATH, 'utf8');
      return JSON.parse(rawData);
    } else {
      console.log('⚠️  没有找到 exported-data.json 文件');
      console.log('请先在浏览器中访问 /export-data.html 导出数据');
      console.log('或者将您的 JSON 数据文件复制到 public 文件夹并命名为 exported-data.json');
      return null;
    }
  } catch (e) {
    console.error('❌ 读取数据失败:', e.message);
    return null;
  }
}

function cleanData(data) {
  if (!data) return null;

  const cleaned = {
    version: data.version || 6,
    talents: data.talents || [],
    fitnessTests: data.fitnessTests || [],
    workouts: data.workouts || [],
    books: data.books || [],
    yearSummaries: data.yearSummaries || [],
    articles: data.articles || [],
    skills: data.skills || [],
    hobbies: data.hobbies || [],
    schedules: data.schedules || [],
    happiness: data.happiness || [],
    scheduleRecords: data.scheduleRecords || [],
    happinessRecords: data.happinessRecords || [],
    traits: data.traits || [],
    readingSlots: data.readingSlots || [],
    brokenSlots: data.brokenSlots || [],
    profile: data.profile || null
  };

  cleaned.books = cleaned.books.map(book =&gt; {
    if (book.coverUrl &amp;&amp; book.coverUrl.startsWith('data:image')) {
      console.log(`ℹ️  书籍 "${book.title}" 的封面是 base64 格式，已清空`);
      return { ...book, coverUrl: '' };
    }
    return book;
  });

  return cleaned;
}

function updateStaticData(data) {
  const content = `// 完整的静态数据 - 自动更新于 ${new Date().toISOString()}
export const staticData = ${JSON.stringify(data, null, 2)};
`;

  try {
    fs.writeFileSync(STATIC_DATA_PATH, content, 'utf8');
    console.log('\n✅ 数据已成功更新到 staticData.ts！');
    console.log(`📚 书籍数量: ${data.books.length}`);
    console.log(`📝 文章数量: ${data.articles.length}`);
    console.log(`🏋️ 训练记录: ${data.workouts.length}`);
    return true;
  } catch (e) {
    console.error('❌ 写入文件失败:', e.message);
    return false;
  }
}

function main() {
  console.log('📦 开始更新 staticData.ts...\n');

  const data = loadData();
  if (!data) {
    process.exit(1);
  }

  const cleanedData = cleanData(data);
  if (!cleanedData) {
    process.exit(1);
  }

  const success = updateStaticData(cleanedData);
  if (success) {
    console.log('\n🎉 完成！您可以运行 npm run build 来构建项目');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
