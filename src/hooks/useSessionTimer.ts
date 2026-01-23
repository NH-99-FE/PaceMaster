import { useEffect, useRef } from 'react';
import {
  useSessionIsPaused,
  useSessionStatus,
  useSessionActions,
} from '@/store/selectors';

// 使用 performance.now + setInterval 驱动计时，降低 rAF 主线程压力。
export const useSessionTimer = () => {
  const status = useSessionStatus();
  const isPaused = useSessionIsPaused();
  const { tick } = useSessionActions();
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'running' || isPaused) {
      lastRef.current = null;
      return;
    }

    lastRef.current = performance.now();
    const intervalId = window.setInterval(() => {
      const now = performance.now();
      const delta = now - (lastRef.current ?? now);
      lastRef.current = now;
      if (delta > 0) {
        tick(delta);
      }
    }, 200);

    return () => window.clearInterval(intervalId);
  }, [status, isPaused, tick]);
};
