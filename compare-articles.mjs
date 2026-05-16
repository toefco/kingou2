
import fs from 'fs';
import path from 'path';

console.log('📝 开始对比文章...\n');

// 读取旧版本 (101篇)
const oldFile = fs.readFileSync(path.join(process.cwd(), 'temp-101-articles.ts'), 'utf8');
const oldDataMatch = oldFile.match(/"articles":\s*\[([\s\S]*?)\](?=\s*,\s*"skills"|\s*}\s*$)/);
let oldArticles = [];
if (oldDataMatch) {
    try {
        const jsonStr = '{"articles":[' + oldDataMatch[1] + ']}';
        oldArticles = JSON.parse(jsonStr).articles;
        console.log(`✅ 旧版本文章数: ${oldArticles.length}`);
    } catch(e) {
        console.error('❌ 解析旧版本失败:', e.message);
    }
}

// 读取新版本 (105篇)
const newFile = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'staticData.ts'), 'utf8');
const newDataMatch = newFile.match(/"articles":\s*\[([\s\S]*?)\](?=\s*,\s*"skills"|\s*}\s*$)/);
let newArticles = [];
if (newDataMatch) {
    try {
        const jsonStr = '{"articles":[' + newDataMatch[1] + ']}';
        newArticles = JSON.parse(jsonStr).articles;
        console.log(`✅ 新版本文章数: ${newArticles.length}\n`);
    } catch(e) {
        console.error('❌ 解析新版本失败:', e.message);
    }
}

console.log('=== 旧版本文章ID ===');
oldArticles.forEach((a, i) =&gt; console.log(`[${i}] ${a.id}`));
console.log('\n=== 新版本文章ID ===');
newArticles.forEach((a, i) =&gt; console.log(`[${i}] ${a.id}`));

console.log('\n=== 找出新增的文章 ===');
const oldIds = new Set(oldArticles.map(a =&gt; a.id));

const addedArticles = newArticles.filter(a =&gt; !oldIds.has(a.id));
console.log(`\n🔥 新增文章数: ${addedArticles.length}`);
addedArticles.forEach((a, i) =&gt; {
    console.log(`\n[新增${i}] ID: ${a.id}`);
    console.log(`日期: ${a.publishDate}`);
    console.log(`内容预览: ${a.content.substring(0, 100)}...`);
});

console.log('\n✅ 对比完成！');
