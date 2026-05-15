import { useState, useMemo, useEffect } from 'react';
import { X, FileText, ChevronUp } from 'lucide-react';
import { useStore } from '../../store';
import { Article } from '../../types';
import ArticleCard from './ArticleCard';

export default function CognitionList() {
  const articles = useStore((state) => state.articles);
  const addArticle = useStore((state) => state.addArticle);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    publishDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedArticle]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

function generateTitle(content: string): string {
    const text = content.trim();
    
    const themeConfigs = [
      { pattern: /刀|攻击自己|立刀子|时刻准备攻击/g, keyword: '自设刀锋' },
      { pattern: /安全感|内在安全感|外部环境.*安全感/g, keyword: '安全感的牢笼' },
      { pattern: /剖析|深度思考|路径依赖|痛苦.*根源/g, keyword: '剖析之痛' },
      { pattern: /抖音.*卸载|卸载抖音|控制.*抖音|失控.*抖音/g, keyword: '与抖音博弈' },
      { pattern: /内耗|纠结|矛盾|放不过|不放过/g, keyword: '与内耗共处' },
      { pattern: /理解.*死记|死记硬背|浮躁|深入.*逻辑/g, keyword: '从浮躁到通透' },
      { pattern: /初心|目标不一样|不是.*唯一|考证.*出路/g, keyword: '初心的转变' },
      { pattern: /享受.*痛苦|习惯.*攻击|依赖.*剖析/g, keyword: '享受痛苦的人' },
      { pattern: /放下|松手|不再紧握/g, keyword: '学会放下' },
      { pattern: /觉醒|醒悟|发现.*自己/g, keyword: '自我觉醒' },
      { pattern: /压力|障碍|保持|每天.*学习/g, keyword: '在压力中前行' },
      { pattern: /贪婪|不知足|不够|总是不/g, keyword: '贪婪的心' },
      { pattern: /被关注|独特|特别|闪光/g, keyword: '渴望被看见' },
      { pattern: /恐惧|害怕|心理建设|抗拒/g, keyword: '面对恐惧' },
      { pattern: /陌生.*拘束|外部环境.*自由|无所畏惧/g, keyword: '陌生的自己' },
    ];
    
    let bestScore = 0;
    let bestTitle = '';
    
    for (const config of themeConfigs) {
      const matches = text.match(config.pattern);
      if (matches && matches.length > 0) {
        const score = matches.length;
        if (score > bestScore) {
          bestScore = score;
          bestTitle = config.keyword;
        }
      }
    }
    
    if (bestTitle && bestScore >= 1) {
      return bestTitle;
    }
    
    const introspectiveWords = text.match(/我|自己|内心|心灵|灵魂|生命/gi);
    if (introspectiveWords && introspectiveWords.length >= 3) {
      if (text.includes('改变') || text.includes('成长') || text.includes('突破')) {
        return '改变的勇气';
      }
      if (text.includes('困住') || text.includes('束缚') || text.includes('枷锁')) {
        return '寻找出口';
      }
      if (text.includes('和解') || text.includes('接纳') || text.includes('允许')) {
        return '与己和解';
      }
    }
    
    const charCount = text.length;
    if (charCount < 100) return '瞬间感悟';
    if (charCount < 300) return '一段思绪';
    
    return '意识碎片';
  }

  function smartFormat(content: string): string {
    const rawParagraphs = content.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    const allSentences: string[] = [];
    
    for (const para of rawParagraphs) {
      let current = '';
      let inQuote = false;
      let quoteChar = '';
      
      for (let i = 0; i < para.length; i++) {
        const char = para[i];
        if ((char === '"' || char === '"' || char === '"') && !inQuote) {
          inQuote = true;
          quoteChar = char;
          if (current.trim()) allSentences.push(current.trim());
          current = char;
        } else if (char === quoteChar && inQuote) {
          current += char;
          allSentences.push(current.trim());
          current = '';
          inQuote = false;
        } else if ('。！？.!?'.includes(char) && !inQuote) {
          current += char;
          if (current.trim()) allSentences.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      if (current.trim()) allSentences.push(current.trim());
    }
    
    const paragraphs: string[] = [];
    for (let i = 0; i < allSentences.length; i += 4) {
      const chunk = allSentences.slice(i, i + 4).join('');
      paragraphs.push(`<p>${chunk}</p>`);
    }
    
    return paragraphs.join('\n\n');
  }

  const getDisplayContent = (content: string) => {
    const formatted = smartFormat(content);
    return { __html: formatted };
  };

  const getDisplayTitle = (article: Article) => {
    if (article.title && article.title.trim()) {
      return article.title;
    }
    return generateTitle(article.content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = generateTitle(form.content);
    const article: Article = {
      id: Date.now().toString(),
      title: title,
      content: form.content,
      category: '',
      publishDate: form.publishDate,
    };
    addArticle(article);
    setForm({ title: '', content: '', publishDate: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  const totalChars = useMemo(
    () => articles.reduce((sum, a) => sum + a.content.length, 0),
    [articles]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={() => setIsAdding(true)} className="relative overflow-hidden bg-gradient-to-b from-slate-800/90 via-ink to-ink text-gold font-bold rounded-xl px-5 py-2.5 border border-gold/10 shadow-[0_4px_0_rgba(15,23,42,0.6),0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_rgba(15,23,42,0.5),0_6px_16px_rgba(212,175,55,0.08)] hover:translate-y-[2px] hover:border-gold/25 hover:text-amber-200 active:shadow-none active:translate-y-[4px] transition-all duration-200 ease-out">
          意识海
        </button>
      </div>

      {/* 统计栏 */}
      {articles.length > 0 && (
        <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-ink/50 border border-gold/10">
          <div className="flex items-center gap-2 text-sm">
            <FileText size={16} className="text-gold/60" />
            <span className="text-paper/40">共</span>
            <span className="text-gold font-serif">{articles.length}</span>
            <span className="text-paper/40">篇</span>
          </div>
          <div className="w-px h-4 bg-gold/10" />
          <div className="text-sm">
            <span className="text-paper/40">总计 </span>
            <span className="text-gold font-serif">{totalChars.toLocaleString()}</span>
            <span className="text-paper/40"> 字</span>
          </div>
        </div>
      )}

      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-hidden" onWheel={e => e.stopPropagation()}>
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-hidden">
              <button onClick={() => setSelectedArticle(null)} className="absolute top-4 right-4 text-paper/60 hover:text-paper z-10">
                <X size={24} />
              </button>
              <div className="max-h-[80vh] overflow-y-auto pr-2">
                <div className="mb-4">
                  <h2 className="text-2xl font-serif text-gold mb-2">{getDisplayTitle(selectedArticle)}</h2>
                  <span className="text-sm text-paper/40">{selectedArticle.publishDate}</span>
                </div>
                <div 
                  className="prose prose-invert max-w-none [&_p]:text-paper/80 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:whitespace-pre-wrap"
                  dangerouslySetInnerHTML={getDisplayContent(selectedArticle.content)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif text-gold">记录意识海</h3>
              <button onClick={() => setIsAdding(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">时间</label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">正文（标题自动生成）</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold min-h-48"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  发布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
        ))}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-gold/20 via-ink to-gold/30 border border-gold/40 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3),0_0_40px_rgba(212,175,55,0.1)] flex items-center justify-center z-40 transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(212,175,55,0.5),0_0_60px_rgba(212,175,55,0.2)] hover:border-gold/60"
          title="回到顶部"
        >
          <span className="text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">
            <ChevronUp size={28} />
          </span>
        </button>
      )}
    </div>
  );
}
