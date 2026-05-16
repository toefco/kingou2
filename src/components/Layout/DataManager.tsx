import { useState, useEffect } from 'react';
import { Database, Save } from 'lucide-react';
import { useStore, isOwnerMode } from '../../store';

export function DataManager() {
  const saveToStaticData = useStore(s => s.saveToStaticData);
  const [isOpen, setIsOpen] = useState(false);
  const [ownerOn, setOwnerOn] = useState(isOwnerMode());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setOwnerOn(isOwnerMode());
  }, []);

  const handleSave = async () => {
    if (confirm('确定要保存数据到 staticData.ts 文件吗？')) {
      setIsSaving(true);
      try {
        const success = await saveToStaticData();
        if (success) {
          alert('✅ 数据保存成功！');
        } else {
          alert('❌ 数据保存失败，请检查后端服务是否启动');
        }
      } catch (error) {
        alert('❌ 保存出错：' + error);
      } finally {
        setIsSaving(false);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
        style={{
          color: 'rgba(255,255,255,0.45)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <Database size={12} />
        <span>数据</span>
        {ownerOn && (
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#6ee7b7', boxShadow: '0 0 4px #6ee7b7',
            display: 'inline-block',
          }} />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 w-56 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(10,10,28,0.96)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors"
              style={{ 
                color: isSaving ? 'rgba(255,255,255,0.3)' : 'rgba(167, 139, 250, 0.9)',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={e => !isSaving && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Save size={14} />
              <span>{isSaving ? '保存中...' : '一键保存'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
