import { useEffect } from 'react';
import { useAppStore } from '@/store';

// 使用 performance.now + setInterval 驱动计时，降低 rAF 主线程压力。
let consumerCount = 0;
let intervalId: number | null = null;
let lastTickAt: number | null = null;
let unsubscribeStore: (() => void) | null = null;

const stopInterval = () => {
  if (intervalId === null) return;
  window.clearInterval(intervalId);
  intervalId = null;
  lastTickAt = null;
};

const startInterval = () => {
  if (intervalId !== null) return;
  if (typeof window === 'undefined') return;
  lastTickAt = performance.now();
  intervalId = window.setInterval(() => {
    const now = performance.now();
    const delta = now - (lastTickAt ?? now);
    lastTickAt = now;
    if (delta > 0) {
      useAppStore.getState().session.actions.tick(delta);
    }
  }, 200);
};

const updateIntervalState = () => {
  const { status, isPaused } = useAppStore.getState().session;
  if (status === 'running' && !isPaused) {
    startInterval();
  } else {
    stopInterval();
  }
};

const ensureDriver = () => {
  if (unsubscribeStore) return;
  unsubscribeStore = useAppStore.subscribe((state, prevState) => {
    if (
      state.session.status === prevState.session.status &&
      state.session.isPaused === prevState.session.isPaused
    ) {
      return;
    }
    updateIntervalState();
  });
  updateIntervalState();
};

const teardownDriver = () => {
  stopInterval();
  if (unsubscribeStore) {
    unsubscribeStore();
    unsubscribeStore = null;
  }
};

export const useSessionTimer = () => {
  useEffect(() => {
    consumerCount += 1;
    if (consumerCount === 1) {
      ensureDriver();
    }
    return () => {
      consumerCount = Math.max(0, consumerCount - 1);
      if (consumerCount === 0) {
        teardownDriver();
      }
    };
  }, []);
};
