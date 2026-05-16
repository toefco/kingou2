import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export function useDataSync() {
  const loadFromLocalStorage = useStore((state) => state.loadFromLocalStorage);
  const saveToStaticData = useStore((state) => state.saveToStaticData);
  const ownerMode = useStore((state) => state.ownerMode);
  const autoSaveIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (ownerMode) {
      // 加载本地存储的数据
      loadFromLocalStorage();

      // 30秒自动保存到 staticData.ts
      autoSaveIntervalRef.current = setInterval(async () => {
        try {
          await saveToStaticData();
        } catch (e) {
          console.error('自动保存失败（本地服务未启动）', e);
        }
      }, 30000);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [ownerMode, loadFromLocalStorage, saveToStaticData]);

  return {};
}
