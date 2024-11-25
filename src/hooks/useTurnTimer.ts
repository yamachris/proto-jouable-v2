import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useTurnTimer() {
  const { 
    timeLeft, 
    phase,
    currentPlayer,
    handleTimeOut,
    consecutiveTimeouts,
    updateConsecutiveTimeouts
  } = useGameStore();

  useEffect(() => {
    if (phase === 'setup') return;

    const timer = setInterval(() => {
      if (timeLeft <= 0) {
        handleTimeOut();
        updateConsecutiveTimeouts();
      } else {
        useGameStore.setState(state => ({
          timeLeft: state.timeLeft - 1
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, phase]);

  return {
    timeLeft,
    isWarning: timeLeft <= 5,
    consecutiveTimeouts
  };
}