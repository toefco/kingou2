
import fs from 'fs';
import path from 'path';

console.log('📝 开始恢复...\n');

// 读取当前文件（有167本书和105篇文章）
const currentFile = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'staticData.ts'), 'utf8');
const currentDataMatch = currentFile.match(/export const staticData = ([\s\S]*?);$/);
const currentData = JSON.parse(currentDataMatch[1]);
console.log(`✅ 当前 - 书籍: ${currentData.books.length}, 文章: ${currentData.articles.length}`);

// 读取旧版本（962c16f6版本，132本书，101篇文章）
const oldFile = fs.readFileSync(path.join(process.cwd(), 'temp-101-articles.ts'), 'utf8');
const oldDataMatch = oldFile.match(/export const staticData = ([\s\S]*?);$/);
const oldData = JSON.parse(oldDataMatch[1]);
console.log(`✅ 旧版本 - 书籍: ${oldData.books.length}, 文章: ${oldData.articles.length}`);

// 把旧版本的文章替换到当前数据！
currentData.articles = oldData.articles;
console.log('\n✨ 已替换文章！');

// 重新生成文件
const newContent = `// 完整的静态数据 - 自动保存于 ${new Date().toISOString()}
export const staticData = ${JSON.stringify(currentData, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'staticData.ts'), newContent, 'utf8');
console.log('✅ 文件已保存！');
console.log(`\n📊 最终结果 - 书籍: ${currentData.books.length}, 文章: ${currentData.articles.length}`);
console.log('🎉 完成！');
