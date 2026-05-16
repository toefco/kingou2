
import fs from 'fs';
import path from 'path';

console.log('📝 开始合并数据...\n');

// 读取当前文件（有167本书和105篇文章）
const backupFile = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'staticData-backup.ts'), 'utf8');
const backupMatch = backupFile.match(/export const staticData = ([\s\S]*?);$/);
const backupData = JSON.parse(backupMatch[1]);
console.log(`✅ 备份 - 书籍: ${backupData.books.length}, 文章: ${backupData.articles.length}`);

// 读取git版本（962c16f6，有132本书和101篇文章）
const gitFile = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'staticData-git-962c16f6.ts'), 'utf8');
const gitMatch = gitFile.match(/export const staticData = ([\s\S]*?);$/);
const gitData = JSON.parse(gitMatch[1]);
console.log(`✅ Git版本 - 书籍: ${gitData.books.length}, 文章: ${gitData.articles.length}`);

// 合并数据！把git版本的文章部分替换到备份数据！
backupData.articles = gitData.articles;
console.log('\n✨ 已替换文章！');

// 重新生成最终文件
const finalContent = `// 完整的静态数据 - 自动保存于 ${new Date().toISOString()}
export const staticData = ${JSON.stringify(backupData, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'staticData.ts'), finalContent, 'utf8');
console.log('✅ 文件已保存！');
console.log(`\n📊 最终结果 - 书籍: ${backupData.books.length}, 文章: ${backupData.articles.length}`);
console.log('🎉 完成！');
