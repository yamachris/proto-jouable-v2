import { Card } from '../types/game';

export const testCards = {
  // Jokers
  redJoker: {
    id: 'joker-red',
    type: 'joker',
    value: 'JOKER',
    suit: 'special',
    color: 'red',
    isRedJoker: true
  } as Card,
  
  blackJoker: {
    id: 'joker-black',
    type: 'joker',
    value: 'JOKER',
    suit: 'special',
    color: 'black',
    isRedJoker: false
  } as Card,

  // As
  aceHearts: {
    id: 'ace-hearts',
    type: 'number',
    value: 'A',
    suit: 'hearts',
    color: 'red'
  } as Card,

  aceSpades: {
    id: 'ace-spades',
    type: 'number',
    value: 'A',
    suit: 'spades',
    color: 'black'
  } as Card,

  // Sept
  sevenHearts: {
    id: 'seven-hearts',
    type: 'number',
    value: '7',
    suit: 'hearts',
    color: 'red'
  } as Card,

  sevenSpades: {
    id: 'seven-spades',
    type: 'number',
    value: '7',
    suit: 'spades',
    color: 'black'
  } as Card
};

// Fonction utilitaire pour obtenir une main de test
export function getTestHand(): Card[] {
  return [
    testCards.redJoker,
    testCards.blackJoker,
    testCards.aceHearts,
    testCards.aceSpades,
    testCards.sevenHearts,
    testCards.sevenSpades
  ];
} 