export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';
export type Phase = 'setup' | 'discard' | 'draw' | 'action';
export type ActivatorType = '7' | 'JOKER' | null;
export type CardColor = 'red' | 'black';

export interface Card {
  id: string;
  suit: Suit;
  value: Value;
  isRedJoker?: boolean;
}

export interface PlayerProfile {
  avatar?: string;
  epithet: string;
}

export interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  hand: Card[];
  reserve: Card[];
  discardPile: Card[];
  profile: PlayerProfile;
}

export interface ColumnState {
  cards: Card[];
  isLocked: boolean;
  hasLuckyCard: boolean;
  luckyCard?: Card;
  bridgePosition?: number;
  activatorType: ActivatorType;
  activatorColor?: CardColor;
  activatorSuit?: Suit;
  sequence: Card[];
}