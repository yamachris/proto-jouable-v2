import { Card, Suit, Value } from '../types/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({ suit, value });
    });
  });
  
  // Ajouter les jokers
  deck.push({ suit: 'hearts', value: 'JOKER' });
  deck.push({ suit: 'spades', value: 'JOKER' });
  
  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function drawCards(deck: Card[], count: number): [Card[], Card[]] {
  const drawnCards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return [remainingDeck, drawnCards];
}