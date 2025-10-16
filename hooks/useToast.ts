import { useState, useCallback } from 'react';
import type { Insight } from '../types';

interface ToastState {
  insight: Insight | null;
  isVisible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    insight: null,
    isVisible: false
  });

  const showToast = useCallback((insight: Insight) => {
    setToast({
      insight,
      isVisible: true
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const clearToast = useCallback(() => {
    setToast({
      insight: null,
      isVisible: false
    });
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    clearToast
  };
};
