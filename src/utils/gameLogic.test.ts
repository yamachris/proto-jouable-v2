import { canActivateColumn, handleCardPlacement } from './gameLogic';
import { Card, ColumnState, Suit } from '../types/game';

describe('Mécanique d\'activation des colonnes', () => {
  // Cartes de test
  const asCoeur: Card = {
    id: 'as-hearts',
    type: 'number',
    value: 'As',
    suit: 'hearts',
    color: 'red'
  };

  const asCarreau: Card = {
    id: 'as-diamonds',
    type: 'number',
    value: 'As',
    suit: 'diamonds',
    color: 'red'
  };

  const septCoeur: Card = {
    id: '7-hearts',
    type: 'number',
    value: '7',
    suit: 'hearts',
    color: 'red'
  };

  const septPique: Card = {
    id: '7-spades',
    type: 'number',
    value: '7',
    suit: 'spades',
    color: 'black'
  };

  const jokerRouge: Card = {
    id: 'joker-red',
    type: 'joker',
    value: 'JOKER',
    suit: 'special',
    color: 'red',
    isJoker: true
  };

  // État initial d'une colonne
  const emptyColumn: ColumnState = {
    cards: [],
    isLocked: false,
    hasLuckyCard: false,
    activatorType: null,
    sequence: [],
    activatorColor: null,
    activatorSuit: null,
    luckyCard: null
  };

  describe('canActivateColumn', () => {
    test('Activation avec As + 7 de la même couleur', () => {
      expect(canActivateColumn([asCoeur, septCoeur], 'hearts')).toBe(true);
    });

    test('Activation avec As + 7 de couleur différente', () => {
      expect(canActivateColumn([asCoeur, septPique], 'hearts')).toBe(true);
    });

    test('Activation avec As + Joker', () => {
      expect(canActivateColumn([asCarreau, jokerRouge], 'diamonds')).toBe(true);
    });

    test('Refus si As de la mauvaise couleur', () => {
      expect(canActivateColumn([asCoeur, septCoeur], 'diamonds')).toBe(false);
    });

    test('Refus si pas d\'As', () => {
      expect(canActivateColumn([septCoeur, septPique], 'hearts')).toBe(false);
    });
  });

  describe('handleCardPlacement', () => {
    const player = {
      id: 'player-1',
      hand: [asCoeur, septCoeur, jokerRouge],
      reserve: [],
      discardPile: [],
      health: 10,
      maxHealth: 10,
      name: 'Test Player',
      deck: [],
      hasUsedStrategicShuffle: false,
      profile: { epithet: 'Tester' }
    };

    test('Activation réussie avec As + 7', () => {
      const { updatedColumn } = handleCardPlacement(
        [asCoeur, septCoeur],
        emptyColumn,
        player
      );

      expect(updatedColumn.hasLuckyCard).toBe(true);
      expect(updatedColumn.activatorType).toBe('7');
      expect(updatedColumn.cards[0]).toBe(asCoeur);
      expect(updatedColumn.luckyCard).toBe(septCoeur);
    });

    test('Activation réussie avec As + Joker', () => {
      const { updatedColumn } = handleCardPlacement(
        [asCarreau, jokerRouge],
        emptyColumn,
        player
      );

      expect(updatedColumn.hasLuckyCard).toBe(true);
      expect(updatedColumn.activatorType).toBe('JOKER');
      expect(updatedColumn.cards[0]).toBe(asCarreau);
      expect(updatedColumn.luckyCard).toBe(jokerRouge);
    });

    test('Les cartes sont retirées de la main du joueur', () => {
      const { updatedPlayer } = handleCardPlacement(
        [asCoeur, septCoeur],
        emptyColumn,
        player
      );

      expect(updatedPlayer.hand).not.toContain(asCoeur);
      expect(updatedPlayer.hand).not.toContain(septCoeur);
    });
  });
}); 