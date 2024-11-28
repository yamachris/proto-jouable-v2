import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameTimer() {
  const {
    phase,
    isGameOver
  } = useGameStore();

  const timeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (phase === 'setup' || isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      timeRef.current += 1;
      useGameStore.setState(state => ({
        ...state,
        totalGameTime: timeRef.current
      }));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase, isGameOver]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return {
    totalGameTime: timeRef.current,
    formattedTotalTime: formatTime(timeRef.current)
  };
}