import { Card, Player } from '../types/game';
import { shuffleDeck } from './deck';

export function shuffleWithDiscard(player: Player): {
  newDeck: Card[];
  newDiscardPile: Card[];
} {
  const allCards = [...player.discardPile];
  const newDeck = shuffleDeck(allCards);
  
  return {
    newDeck,
    newDiscardPile: [],
  };
}

export function canShuffleWithDiscard(player: Player): boolean {
  return player.discardPile.length > 0 && player.hand.length === 0;
}

export function isCompleteTurn(deck: Card[], discardPile: Card[]): boolean {
  return deck.length === 0 && discardPile.length > 0;
}