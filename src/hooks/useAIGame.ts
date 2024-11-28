import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { AIGameManager } from '../ai/AIGameManager';

export function useAIGame(isAIMode: boolean = false) {
  const gameState = useGameStore();
  const aiManagerRef = useRef<AIGameManager | null>(null);

  useEffect(() => {
    if (isAIMode && !aiManagerRef.current) {
      aiManagerRef.current = new AIGameManager(gameState);
      aiManagerRef.current.startAIGame();
    }

    return () => {
      aiManagerRef.current = null;
    };
  }, [isAIMode]);

  return {
    isAIPlaying: !!aiManagerRef.current
  };
}