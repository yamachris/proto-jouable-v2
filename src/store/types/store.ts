import type { Card, Phase, Suit, Player, ColumnState, GameState } from '../../types/game';

export interface GameStore extends GameState {
  // Card Actions
  selectCard: (card: Card) => void;
  handleDiscard: (card: Card) => void;
  handleDrawCard: () => void;
  exchangeCards: (card1: Card, card2: Card) => void;
  handleJokerAction: (joker: Card, action: 'heal' | 'attack') => void;

  // Column Actions
  handleCardPlace: (suit: Suit, position: number) => void;

  // Game Flow Actions
  setPhase: (phase: Phase) => void;
  handleStrategicShuffle: () => void;
  endTurn: () => void;
  setAttackMode: (mode: boolean) => void;
  setMessage: (message: string) => void;
  canUseStrategicShuffle: () => boolean;
  confirmStrategicShuffle: () => void;
  
  // Utility Actions
  getState: () => GameStore;
  initializeGame: () => void;
} 