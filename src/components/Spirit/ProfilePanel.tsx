import { useState, useRef, useEffect } from 'react';
import { Edit, X, User } from 'lucide-react';
import { useStore } from '../../store';
import { Profile } from '../../types';

export default function ProfilePanel() {
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (profile) {
      setInputVal(profile.content);
    }
  }, [profile]);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    const text = inputVal.trim();
    if (!text) return;
    updateProfile(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      if (profile) setInputVal(profile.content);
    }
  };

  return (
    <div className="panel-spirit mb-6">
      {/* top accent shimmer */}
      <div className="absolute top-0 left-6 right-6 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)'
      }} />
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <User size={16} style={{ color: '#a855f7' }} />
          <h3 className="text-lg font-serif" style={{ color: '#c084fc' }}>关于 King</h3>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: 'rgba(168,85,247,0.6)', border: '1px solid rgba(168,85,247,0.15)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#c084fc';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.08)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(168,85,247,0.6)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(168,85,247,0.15)';
          }}
        >
          <Edit size={12} />
          编辑
        </button>
      </div>

      {/* 编辑模式 */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在这里写下关于 King 的介绍……"
            className="w-full h-40 rounded-xl px-4 py-3 text-sm text-paper placeholder-paper/25 focus:outline-none resize-none"
            style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.25)',
              lineHeight: '1.8',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(168,85,247,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(168,85,247,0.25)')}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                if (profile) setInputVal(profile.content);
              }}
              className="px-4 py-2 rounded-xl text-sm text-paper/40 hover:text-paper/70 transition-all"
              style={{ border: '1px solid rgba(168,85,247,0.15)' }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!inputVal.trim()}
              className="px-4 py-2 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'rgba(168,85,247,0.15)',
                color: '#c084fc',
                border: '1px solid rgba(168,85,247,0.3)',
              }}
              onMouseEnter={e => !inputVal.trim() || ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.25)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(168,85,247,0.15)')}
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        /* 显示模式 */
        <div className="space-y-4">
          {profile && profile.content ? (
            <div 
              className="text-paper/80 leading-relaxed whitespace-pre-wrap text-sm"
              style={{ lineHeight: '1.9' }}
            >
              {profile.content}
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all text-paper/25 text-sm gap-2"
              style={{ borderColor: 'rgba(168,85,247,0.15)' }}
              onClick={() => setIsEditing(true)}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.35)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.15)')}
            >
              <Edit size={16} />
              点击添加关于 King 的介绍
            </div>
          )}
          
          {profile?.updatedAt && (
            <div className="text-xs text-paper/30">
              最后更新：{profile.updatedAt}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
