export type Phase = 'setup' | 'discard' | 'draw' | 'action';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'special';
export type StandardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Value = StandardValue | 'JOKER';
export type ActivatorType = '7' | 'JOKER' | null;
export type CardColor = 'red' | 'black';

export type Card = {
  id: string;
  suit: Suit;
  value: Value;
  type: 'standard' | 'joker';
  color: CardColor;
  isRedJoker?: boolean;
};

export interface GameState {
  currentPlayer: Player;
  phase: Phase;
  isPlayerTurn: boolean;
  selectedCards: Card[];
  hasDiscarded: boolean;
  hasPlayedAction: boolean;
  message: string;
  columns: Record<Suit, ColumnState>;
  hasUsedFirstStrategicShuffle: boolean;
  awaitingStrategicShuffleConfirmation: boolean;
  deck: Card[];
  turn: number;
  playedCardsLastTurn: number;
  attackMode: boolean;
  isGameOver: boolean;
  winner: string | null;
  canEndTurn: boolean;
  language: string;
}

export interface GameStore extends GameState {
  selectCard: (card: Card) => void;
  handleDiscard: (card: Card) => void;
  handleDrawCard: () => void;
  exchangeCards: (card1: Card, card2: Card) => void;
  handleJokerAction: (joker: Card, action: 'heal' | 'attack') => void;
  setAttackMode: (mode: boolean) => void;
  setMessage: (message: string) => void;
  handleStrategicShuffle: () => void;
  endTurn: () => void;
  setPhase: (phase: Phase) => void;
  canUseStrategicShuffle: () => boolean;
  handlePassTurn: () => void;
  handleSurrender: () => void;
  handleSkipAction: () => void;
  confirmStrategicShuffle: () => void;
}

export interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  hand: Card[];
  reserve: Card[];
  discardPile: Card[];
  deck: Card[];
  hasUsedStrategicShuffle: boolean;
  profile: {
    epithet: string;
    avatar?: string;
  };
}

export interface ColumnState {
  cards: Card[];
  isLocked: boolean;
  hasLuckyCard: boolean;
  activatorType: 'JOKER' | '7' | null;
  sequence: Card[];
  reserveSuit: Card | null;
  faceCards: {
    J?: Card;  // Valet
    K?: Card;  // Roi
  };
}