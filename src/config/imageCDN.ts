// 图片CDN链接配置
// 请将下面的链接替换为您自己的 GitHub + jsDelivr CDN 图片链接

export const imageCDN = {
  // 加载页面人物图片
  loadingCharacter: '', // 例如: https://cdn.jsdelivr.net/gh/您的用户名/仓库@main/public/loading-character.png

  // 书籍封面图片
  monteCristoCover: '', // 例如: https://cdn.jsdelivr.net/gh/您的用户名/仓库@main/public/monte-cristo-cover.jpg
  monteCristoData: '', // 例如: https://cdn.jsdelivr.net/gh/您的用户名/仓库@main/public/monte-cristo-data.png

  bookCover: '', // 例如: https://cdn.jsdelivr.net/gh/您的用户名/仓库@main/public/book-cover.jpg
  bookData: '', // 例如: https://cdn.jsdelivr.net/gh/您的用户名/仓库@main/public/book-data.jpg

  // 其他书籍图片链接（您可以继续添加）
};

// 获取图片URL的辅助函数
export function getImageUrl(key: keyof typeof imageCDN, fallback?: string): string {
  const url = imageCDN[key];
  return url || fallback || '';
}
