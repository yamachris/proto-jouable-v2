import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameService } from '../services/api';

export function useWebSocket() {
  const { updateGameState } = useGameStore();

  useEffect(() => {
    const gameId = localStorage.getItem('currentGameId');
    
    if (gameId) {
      // Connect to WebSocket and listen for game updates
      gameService.connectToGame(gameId, (data) => {
        updateGameState(data.gameState);
      });

      // Cleanup on unmount
      return () => {
        gameService.disconnect();
      };
    }
  }, []);

  return null;
}