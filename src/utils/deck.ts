import { Card, Suit, Value } from '../types/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];

  // Création du deck standard
  SUITS.forEach(suit => {
    VALUES.forEach(value => {
      deck.push({
        id: `${suit}-${value}`,
        value,
        suit
      });
    });
  });

  // Ajout des deux Jokers
  deck.push(
    {
      id: 'joker-red',
      type: 'joker',
      value: 'JOKER',
      suit: 'hearts', // Changé de 'special' à 'hearts' pour correspondre au type Suit
      color: 'red',
      isRedJoker: true
    },
    {
      id: 'joker-black',
      type: 'joker',
      value: 'JOKER',
      suit: 'special',
      color: 'black',
      isRedJoker: false
    }
  );

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

// Fonction simple pour gérer l'effet du Joker
export function handleJokerEffect(player: Player, action: 'heal' | 'attack'): Player {
  const updatedPlayer = { ...player };
  
  if (action === 'heal') {
    updatedPlayer.health = Math.min(player.health + 3, player.maxHealth);
  } else {
    updatedPlayer.health = Math.max(player.health - 3, 0);
  }
  
  return updatedPlayer;
}