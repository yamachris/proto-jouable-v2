import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameService } from '../services/api';

export function useGameState() {
  const { 
    initializeGame, 
    updateGameState,
    currentPlayer,
    phase,
    deck,
    columns,
    isGameOver
  } = useGameStore();

  // Initialize game service
  useEffect(() => {
    gameService.init().catch(console.error);
  }, []);

  // Save game state when important changes occur
  useEffect(() => {
    if (!isGameOver) {
      const gameState = {
        currentPlayer,
        phase,
        deck,
        columns
      };

      gameService.saveGameState(gameState).catch(console.error);
    }
  }, [currentPlayer, phase, deck, columns, isGameOver]);

  // Load saved game on mount
  useEffect(() => {
    const gameId = localStorage.getItem('currentGameId');
    
    if (gameId) {
      gameService.loadGame(gameId)
        .then(({ game_state }) => {
          if (game_state) {
            updateGameState(game_state);
          } else {
            initializeGame();
          }
        })
        .catch(() => {
          initializeGame();
        });
    } else {
      initializeGame();
    }
  }, []);

  return null;
}