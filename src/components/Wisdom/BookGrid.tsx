import { useState, useMemo, useEffect } from 'react';
import { Plus, X, Image, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../../store';
import { Book, ReadingSlotObject } from '../../types';
import BookCard from './BookCard';

export default function BookGrid() {
  const books = useStore((state) => state.books);
  const addBook = useStore((state) => state.addBook);
  const updateBook = useStore((state) => state.updateBook);
  const readingSlots = useStore((state) => state.readingSlots);
  const brokenSlots = useStore((state) => state.brokenSlots);
  const setBrokenSlots = useStore((state) => state.setBrokenSlots);
  const updateReadingSlot = useStore((state) => state.updateReadingSlot);
  const deleteReadingSlot = useStore((state) => state.deleteReadingSlot);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    category: '',
    coverUrl: '',
    coverLink: '',
    coverMode: 'local' as 'local' | 'url',
    dataUrl: '',
    dataLink: '',
    dataMode: 'local' as 'local' | 'url',
    readDate: today,
    totalHours: 0,
    totalMinutes: 0,
    readingDays: 0,
    maxDailyHours: 0,
    maxDailyMinutes: 0,
  });
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isZengHuanOpen, setIsZengHuanOpen] = useState(false);
  const [zengHuanSlotIndex, setZengHuanSlotIndex] = useState<number>(0);
  const [zengHuanForm, setZengHuanForm] = useState({
    imageUrl: '',
    imageLink: '',
    imageMode: 'local' as 'local' | 'url',
    totalYears: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalBooks: 0,
    readingDays: 0,
  });
  const [selectedSlotSummary, setSelectedSlotSummary] = useState<{ year: string; imageUrl: string } | null>(null);

  const [selectedMonth, setSelectedMonth] = useState('all');

  // 推荐书籍相关状态
  const [recommendedBooks, setRecommendedBooks] = useState<Array<{
    id: string;
    title: string;
    author: string;
    category: string;
    coverUrl: string;
    description: string;
  }>>([]);
  const [isAddingRecommended, setIsAddingRecommended] = useState(false);
  const [recommendedForm, setRecommendedForm] = useState({
    title: '',
    author: '',
    category: '',
    coverUrl: '',
    description: ''
  });
  const [editingRecommendedId, setEditingRecommendedId] = useState<string | null>(null);

  const completedBooks = useMemo(() => {
    return books
      .filter((b) => b.status === 'completed')
      .sort((a, b) => (b.readDate || '').localeCompare(a.readDate || ''));
  }, [books]);

  useEffect(() => {
    if (selectedBook || selectedSlotSummary) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBook, selectedSlotSummary]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const book of completedBooks) {
      const ym = (book.readDate || '').slice(0, 7);
      if (ym) set.add(ym);
    }
    return Array.from(set).sort().reverse();
  }, [completedBooks]);

  const groupedBooks = useMemo(() => {
    const filtered = selectedMonth === 'all'
      ? completedBooks
      : completedBooks.filter((b) => (b.readDate || '').slice(0, 7) === selectedMonth);
    const groups: { label: string; books: Book[] }[] = [];
    for (const book of filtered) {
      const ym = (book.readDate || '').slice(0, 7);
      const label = ym ? `${ym.replace('-', '年')}月` : '未标记';
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.books.push(book);
      } else {
        groups.push({ label, books: [book] });
      }
    }
    return groups;
  }, [completedBooks, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCoverUrl = form.coverMode === 'local' ? form.coverUrl : form.coverLink;
    const finalDataUrl = form.dataMode === 'local' ? form.dataUrl : form.dataLink;
    
    const book: Book = {
      id: Date.now().toString(),
      author: '',
      title: form.title,
      category: form.category,
      coverUrl: finalCoverUrl,
      dataUrl: finalDataUrl,
      status: 'completed',
      readDate: form.readDate,
      totalHours: form.totalHours,
      totalMinutes: form.totalMinutes,
      readingDays: form.readingDays,
      maxDailyHours: form.maxDailyHours,
      maxDailyMinutes: form.maxDailyMinutes,
    };
    addBook(book);
    setForm({ 
      title: '', 
      category: '', 
      coverUrl: '', 
      coverLink: '', 
      coverMode: 'local', 
      dataUrl: '', 
      dataLink: '', 
      dataMode: 'local', 
      readDate: today, 
      totalHours: 0, 
      totalMinutes: 0, 
      readingDays: 0, 
      maxDailyHours: 0, 
      maxDailyMinutes: 0 
    });
    setIsAdding(false);
  };

  const openEditModal = (book: Book) => {
    setEditingBookId(book.id);
    const isCoverUrl = book.coverUrl.startsWith('http');
    const isDataUrl = book.dataUrl?.startsWith('http') || false;
    setForm({
      title: book.title,
      category: book.category,
      coverUrl: isCoverUrl ? '' : book.coverUrl,
      coverLink: isCoverUrl ? book.coverUrl : '',
      coverMode: isCoverUrl ? 'url' : 'local',
      dataUrl: isDataUrl ? '' : (book.dataUrl || ''),
      dataLink: isDataUrl ? (book.dataUrl || '') : '',
      dataMode: isDataUrl ? 'url' : 'local',
      readDate: book.readDate || today,
      totalHours: book.totalHours || 0,
      totalMinutes: book.totalMinutes || 0,
      readingDays: book.readingDays || 0,
      maxDailyHours: book.maxDailyHours || 0,
      maxDailyMinutes: book.maxDailyMinutes || 0,
    });
    setIsEditing(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBookId) {
      const finalCoverUrl = form.coverMode === 'local' ? form.coverUrl : form.coverLink;
      const finalDataUrl = form.dataMode === 'local' ? form.dataUrl : form.dataLink;
      updateBook(editingBookId, {
        ...form,
        coverUrl: finalCoverUrl,
        dataUrl: finalDataUrl,
      });
    }
    setForm({ 
      title: '', 
      category: '', 
      coverUrl: '', 
      coverLink: '', 
      coverMode: 'local', 
      dataUrl: '', 
      dataLink: '', 
      dataMode: 'local', 
      readDate: today, 
      totalHours: 0, 
      totalMinutes: 0, 
      readingDays: 0, 
      maxDailyHours: 0, 
      maxDailyMinutes: 0 
    });
    setIsEditing(false);
    setEditingBookId(null);
  };

  const openZengHuanModal = (index: number) => {
    setZengHuanSlotIndex(index);
    const slot = readingSlots[index];
    if (slot && typeof slot === 'object' && 'id' in slot) {
      const isUrl = slot.imageUrl.startsWith('http');
      setZengHuanForm({
        imageUrl: isUrl ? '' : slot.imageUrl,
        imageLink: isUrl ? slot.imageUrl : '',
        imageMode: isUrl ? 'url' : 'local',
        totalYears: slot.totalYears || 0,
        totalHours: slot.totalHours || 0,
        totalMinutes: slot.totalMinutes || 0,
        totalBooks: slot.totalBooks || 0,
        readingDays: slot.readingDays || 0,
      });
    } else if (slot && typeof slot === 'string') {
      const isUrl = slot.startsWith('http');
      setZengHuanForm({
        imageUrl: isUrl ? '' : slot,
        imageLink: isUrl ? slot : '',
        imageMode: isUrl ? 'url' : 'local',
        totalYears: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalBooks: 0,
        readingDays: 0,
      });
    } else {
      setZengHuanForm({
        imageUrl: '',
        imageLink: '',
        imageMode: 'local',
        totalYears: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalBooks: 0,
        readingDays: 0,
      });
    }
    setIsZengHuanOpen(true);
  };

  const handleZengHuanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zengHuanForm.imageLink.trim()) return;
    
    const newSlot: ReadingSlotObject = {
      id: `slot-${zengHuanSlotIndex}`,
      imageUrl: zengHuanForm.imageLink,
      totalYears: zengHuanForm.totalYears || undefined,
      totalHours: zengHuanForm.totalHours || undefined,
      totalMinutes: zengHuanForm.totalMinutes || undefined,
      totalBooks: zengHuanForm.totalBooks || undefined,
      readingDays: zengHuanForm.readingDays || undefined,
    };
    
    updateReadingSlot(zengHuanSlotIndex, newSlot);
    
    const newBroken = brokenSlots.filter(s => s !== zengHuanSlotIndex);
    setBrokenSlots(newBroken);
    
    setZengHuanForm({
      imageUrl: '',
      imageLink: '',
      imageMode: 'local',
      totalYears: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalBooks: 0,
      readingDays: 0,
    });
    setIsZengHuanOpen(false);
  };

  const handleDeleteSlot = (index: number) => {
    deleteReadingSlot(index);
  };

  const openModal = (book: Book) => {
    setSelectedBook(book);
  };

  const handleImageError = (index: number) => {
    if (!brokenSlots.includes(index)) {
      setBrokenSlots([...brokenSlots, index]);
    }
  };

  // 推荐书籍相关函数
  const handleAddRecommended = (e: React.FormEvent) => {
    e.preventDefault();
    const newBook = {
      id: Date.now().toString(),
      title: recommendedForm.title,
      author: recommendedForm.author,
      category: recommendedForm.category,
      coverUrl: recommendedForm.coverUrl,
      description: recommendedForm.description
    };
    setRecommendedBooks([...recommendedBooks, newBook]);
    setRecommendedForm({ title: '', author: '', category: '', coverUrl: '', description: '' });
    setIsAddingRecommended(false);
  };

  const handleEditRecommended = (book: typeof recommendedBooks[0]) => {
    setEditingRecommendedId(book.id);
    setRecommendedForm({
      title: book.title,
      author: book.author,
      category: book.category,
      coverUrl: book.coverUrl,
      description: book.description
    });
    setIsAddingRecommended(true);
  };

  const handleUpdateRecommended = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecommendedId) {
      setRecommendedBooks(recommendedBooks.map(b => 
        b.id === editingRecommendedId ? { ...b, ...recommendedForm } : b
      ));
    }
    setRecommendedForm({ title: '', author: '', category: '', coverUrl: '', description: '' });
    setIsAddingRecommended(false);
    setEditingRecommendedId(null);
  };

  const handleDeleteRecommended = (id: string) => {
    setRecommendedBooks(recommendedBooks.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 推荐书籍展示区 */}
      <div className="bg-gradient-to-br from-gold/10 via-ink/80 to-gold/5 rounded-2xl border border-gold/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-gold flex items-center gap-2">
            ✨ 书籍推荐
          </h3>
          <button 
            onClick={() => {
              setEditingRecommendedId(null);
              setRecommendedForm({ title: '', author: '', category: '', coverUrl: '', description: '' });
              setIsAddingRecommended(true);
            }}
            className="px-3 py-1.5 rounded-lg text-sm bg-gold/20 text-gold hover:bg-gold/30 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            神性加点
          </button>
        </div>
        
        {recommendedBooks.length === 0 ? (
          <div className="text-center py-8 text-paper/30">
            <p className="text-sm">暂无推荐书籍</p>
            <p className="text-xs mt-1">点击上方按钮添加您喜欢的书籍推荐</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendedBooks.map((book) => (
              <div 
                key={book.id}
                className="group relative bg-ink/60 rounded-xl border border-gold/15 hover:border-gold/30 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/10"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gold/10 flex items-center justify-center">
                      <span className="text-gold/40 text-4xl">📚</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {book.description && (
                    <p className="text-sm text-paper/80 line-clamp-3">{book.description}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditRecommended(book)}
                    className="p-1.5 rounded-lg bg-ink/80 text-paper/60 hover:text-gold transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteRecommended(book.id)}
                    className="p-1.5 rounded-lg bg-ink/80 text-paper/60 hover:text-cinnabar transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑推荐书籍弹窗 */}
      {isAddingRecommended && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">
                {editingRecommendedId ? '编辑推荐书籍' : '添加推荐书籍'}
              </h3>
              <button onClick={() => {
                setIsAddingRecommended(false);
                setEditingRecommendedId(null);
                setRecommendedForm({ title: '', author: '', category: '', coverUrl: '', description: '' });
              }} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={editingRecommendedId ? handleUpdateRecommended : handleAddRecommended} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-paper/70 mb-2">书籍名称 *</label>
                  <input
                    type="text"
                    value={recommendedForm.title}
                    onChange={(e) => setRecommendedForm({ ...recommendedForm, title: e.target.value })}
                    placeholder="输入书籍名称"
                    required
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-paper/70 mb-2">作者</label>
                  <input
                    type="text"
                    value={recommendedForm.author}
                    onChange={(e) => setRecommendedForm({ ...recommendedForm, author: e.target.value })}
                    placeholder="输入作者名称（可选）"
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍分类</label>
                <select
                  value={recommendedForm.category}
                  onChange={(e) => setRecommendedForm({ ...recommendedForm, category: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
                >
                  <option value="">选择分类（可选）</option>
                  <option value="哲学">哲学</option>
                  <option value="文学">文学</option>
                  <option value="历史">历史</option>
                  <option value="心理">心理</option>
                  <option value="商业">商业</option>
                  <option value="科技">科技</option>
                  <option value="艺术">艺术</option>
                  <option value="社科">社科</option>
                  <option value="生活">生活</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">封面图片</label>
                <input
                  type="url"
                  value={recommendedForm.coverUrl}
                  onChange={(e) => setRecommendedForm({ ...recommendedForm, coverUrl: e.target.value })}
                  placeholder="输入封面图片URL链接"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">推荐理由</label>
                <textarea
                  value={recommendedForm.description}
                  onChange={(e) => setRecommendedForm({ ...recommendedForm, description: e.target.value })}
                  placeholder="写下推荐这本书的理由（可选）"
                  rows={3}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {
                  setIsAddingRecommended(false);
                  setEditingRecommendedId(null);
                  setRecommendedForm({ title: '', author: '', category: '', coverUrl: '', description: '' });
                }} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" disabled={!recommendedForm.title} className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  {editingRecommendedId ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedMonth === 'all'
                ? 'bg-gold/20 text-gold'
                : 'bg-ink/50 text-paper/60 hover:text-paper'
            }`}
          >
            全部
          </button>
          {monthOptions.map((ym) => (
            <button
              key={ym}
              onClick={() => setSelectedMonth(ym)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedMonth === ym
                  ? 'bg-gold/20 text-gold'
                  : 'bg-ink/50 text-paper/60 hover:text-paper'
              }`}
            >
              {ym.replace('-', '年')}月
            </button>
          ))}
        </div>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          深蓝加点
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">深蓝加点</h3>
              <button onClick={() => setIsAdding(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="输入书籍名称"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
                >
                  <option value="">选择分类</option>
                  <option value="哲学">哲学</option>
                  <option value="文学">文学</option>
                  <option value="历史">历史</option>
                  <option value="心理">心理</option>
                  <option value="商业">商业</option>
                  <option value="科技">科技</option>
                  <option value="艺术">艺术</option>
                  <option value="社科">社科</option>
                  <option value="生活">生活</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">封面图片</label>
                <input
                  type="url"
                  value={form.coverLink}
                  onChange={(e) => setForm({ ...form, coverLink: e.target.value, coverMode: 'url' })}
                  placeholder="输入封面图片URL链接"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">数据图片</label>
                <input
                  type="url"
                  value={form.dataLink}
                  onChange={(e) => setForm({ ...form, dataLink: e.target.value, dataMode: 'url' })}
                  placeholder="输入数据图片URL链接（可选）"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">读完日期</label>
                <input
                  type="date"
                  value={form.readDate}
                  onChange={(e) => setForm({ ...form, readDate: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">累计时长</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="时"
                      value={form.totalHours || ''}
                      onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分"
                      value={form.totalMinutes || ''}
                      onChange={(e) => setForm({ ...form, totalMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-paper/70 mb-2">阅读天数</label>
                  <input
                    type="number"
                    min="0"
                    value={form.readingDays}
                    onChange={(e) => setForm({ ...form, readingDays: Number(e.target.value) })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-paper/70 mb-2">单日最久</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="时"
                      value={form.maxDailyHours || ''}
                      onChange={(e) => setForm({ ...form, maxDailyHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分"
                      value={form.maxDailyMinutes || ''}
                      onChange={(e) => setForm({ ...form, maxDailyMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button type="submit" disabled={!form.coverUrl} className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">加点方向</h3>
              <button onClick={() => {
                setIsEditing(false);
                setEditingBookId(null);
              }} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍名称</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="输入书籍名称"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">书籍分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper focus:outline-none focus:border-gold"
                >
                  <option value="">选择分类</option>
                  <option value="哲学">哲学</option>
                  <option value="文学">文学</option>
                  <option value="历史">历史</option>
                  <option value="心理">心理</option>
                  <option value="商业">商业</option>
                  <option value="科技">科技</option>
                  <option value="艺术">艺术</option>
                  <option value="社科">社科</option>
                  <option value="生活">生活</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">封面图片</label>
                <input
                  type="url"
                  value={form.coverLink}
                  onChange={(e) => setForm({ ...form, coverLink: e.target.value, coverMode: 'url' })}
                  placeholder="输入封面图片URL链接"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">数据图片</label>
                <input
                  type="url"
                  value={form.dataLink}
                  onChange={(e) => setForm({ ...form, dataLink: e.target.value, dataMode: 'url' })}
                  placeholder="输入数据图片URL链接（可选）"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-paper/70 mb-2">读完日期</label>
                <input
                  type="date"
                  value={form.readDate}
                  onChange={(e) => setForm({ ...form, readDate: e.target.value })}
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-4 py-2 text-paper focus:outline-none focus:border-gold"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">累计时长</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="时"
                      value={form.totalHours || ''}
                      onChange={(e) => setForm({ ...form, totalHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分"
                      value={form.totalMinutes || ''}
                      onChange={(e) => setForm({ ...form, totalMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-paper/70 mb-2">阅读天数</label>
                  <input
                    type="number"
                    min="0"
                    value={form.readingDays}
                    onChange={(e) => setForm({ ...form, readingDays: Number(e.target.value) })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-paper/70 mb-2">单日最久</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="时"
                      value={form.maxDailyHours || ''}
                      onChange={(e) => setForm({ ...form, maxDailyHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分"
                      value={form.maxDailyMinutes || ''}
                      onChange={(e) => setForm({ ...form, maxDailyMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {
                  setIsEditing(false);
                  setEditingBookId(null);
                }} className="flex-1 btn-secondary">
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={!((form.coverMode === 'local' ? form.coverUrl : form.coverLink))} 
                  className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSlotSummary && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-4"
          onClick={() => setSelectedSlotSummary(null)}
        >
          <div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlotSummary(null)}
              className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper hover:bg-ink transition-colors"
            >
              <X size={24} />
            </button>
            <img src={selectedSlotSummary.imageUrl} alt="" loading="lazy" decoding="async" className="w-full rounded-xl" />
            <div className="absolute top-4 left-4 bg-ink/80 px-3 py-1.5 rounded-lg text-sm text-gold">
              {selectedSlotSummary.year} 数据
            </div>
          </div>
        </div>
      )}

      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="relative w-full max-w-4xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBook(null)}
              className="fixed top-4 right-4 z-50 p-2 rounded-full bg-ink/80 text-paper/70 hover:text-paper hover:bg-ink transition-colors"
            >
              <X size={24} />
            </button>
            <div 
              className="flex gap-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedBook(null);
                }
              }}
            >
              <div className="flex-1 overflow-auto max-h-[80vh]" onWheel={(e) => { e.stopPropagation(); }}>
                <img
                  src={selectedBook.coverUrl}
                  alt="封面"
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-xl"
                  style={{ 
                    height: 'auto',
                    maxHeight: 'none',
                    objectFit: 'contain',
                    cursor: 'default'
                  }}
                />
              </div>
              {selectedBook.dataUrl && (
                <div className="flex-1 overflow-auto max-h-[80vh]" onWheel={(e) => { e.stopPropagation(); }}>
                  <img
                    src={selectedBook.dataUrl}
                    alt="数据"
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded-xl"
                    style={{ 
                      height: 'auto',
                      maxHeight: 'none',
                      objectFit: 'contain',
                      cursor: 'default'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isZengHuanOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ink border border-gold/30 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-serif text-gold text-center flex-1">增寰</h3>
              <button onClick={() => setIsZengHuanOpen(false)} className="text-paper/60 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleZengHuanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-paper/70 mb-2">图片URL</label>
                <input
                  type="url"
                  value={zengHuanForm.imageLink}
                  onChange={(e) => setZengHuanForm({ ...zengHuanForm, imageLink: e.target.value, imageMode: 'url' })}
                  placeholder="输入图片URL链接"
                  className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                />
                {zengHuanForm.imageLink && (
                  <div className="mt-2 relative">
                    <img 
                      src={zengHuanForm.imageLink} 
                      alt="" 
                      className="w-full h-24 object-cover rounded" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-paper/70 mb-2">年份</label>
                  <input
                    type="number"
                    min="0"
                    value={zengHuanForm.totalYears || ''}
                    onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalYears: Number(e.target.value) || 0 })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-paper/70 mb-2">读过多少本</label>
                  <input
                    type="number"
                    min="0"
                    value={zengHuanForm.totalBooks || ''}
                    onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalBooks: Number(e.target.value) || 0 })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">阅读总计</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="小时"
                      value={zengHuanForm.totalHours || ''}
                      onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalHours: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="分钟"
                      value={zengHuanForm.totalMinutes || ''}
                      onChange={(e) => setZengHuanForm({ ...zengHuanForm, totalMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-paper/70 mb-2">阅读天数</label>
                  <input
                    type="number"
                    min="0"
                    value={zengHuanForm.readingDays || ''}
                    onChange={(e) => setZengHuanForm({ ...zengHuanForm, readingDays: Number(e.target.value) || 0 })}
                    className="w-full bg-ink/50 border border-gold/30 rounded-lg px-3 py-2 text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsZengHuanOpen(false)} className="flex-1 btn-secondary">
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={!((zengHuanForm.imageMode === 'local' ? zengHuanForm.imageUrl : zengHuanForm.imageLink).trim())} 
                  className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  确定
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {groupedBooks.length === 0 ? (
        <div className="text-center py-20 text-paper/20">
          <p className="text-lg">暂无已读书籍</p>
          <p className="text-sm mt-2">点击"深蓝加点"上传你的阅读记录</p>
        </div>
      ) : (
        groupedBooks.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gold/10" />
              <span className="text-sm text-paper/40 whitespace-nowrap">
                {group.label} · {group.books.length}本
              </span>
              <div className="h-px flex-1 bg-gold/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
              {group.books.map((book) => (
                <BookCard key={book.id} book={book} onImageClick={openModal} onEdit={openEditModal} />
              ))}
            </div>
          </div>
        ))
      )}

      <div className="bg-ink/70 border border-gold/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-gold">🏯 慧府</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {readingSlots.map((slot, i) => {
            const url = slot && typeof slot === 'object' ? slot.imageUrl : (slot || null);
            return (
              <div key={i} className="aspect-[1/1] rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
                {url ? (
                  brokenSlots.includes(i) ? (
                    <button
                      className="flex flex-col items-center justify-center w-full h-full gap-1 text-cinnabar/40 hover:text-cinnabar hover:bg-cinnabar/5 transition-colors"
                      onClick={() => openZengHuanModal(i)}
                    >
                      <Image size={16} />
                      <span className="text-[10px]">重试</span>
                    </button>
                  ) : (
                  <div className="relative group/slot w-full h-full cursor-pointer" onClick={() => setSelectedSlotSummary({ year: `汇总 ${i + 1}`, imageUrl: url })}>
                    <div className="absolute top-1.5 left-1.5 flex gap-1 z-10 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openZengHuanModal(i);
                        }}
                        className="p-1 rounded bg-ink/80 text-paper/40 hover:text-gold"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlot(i);
                      }}
                      className="absolute top-1.5 right-1.5 z-10 p-1 rounded bg-ink/80 text-paper/40 hover:text-cinnabar opacity-0 group-hover/slot:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                      onError={() => handleImageError(i)}
                    />
                  </div>
                  )
                ) : (
                  <button
                    className="flex flex-col items-center justify-center w-full h-full gap-1 text-paper/30 hover:text-gold hover:bg-gold/5 transition-colors"
                    onClick={() => openZengHuanModal(i)}
                  >
                    <Plus size={16} />
                    <span className="text-[10px]">增寰</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
