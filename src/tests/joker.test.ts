import { describe, it, expect } from 'vitest';
import { getCardEffect, isJokerActionAvailable, canJokerTarget } from '../utils/cardEffects';
import { Card } from '../types/game';

describe('JOKER Logic', () => {
  const redJoker: Card = {
    id: '1',
    value: 'JOKER',
    suit: 'hearts',
    isRedJoker: true
  };

  const blackJoker: Card = {
    id: '2',
    value: 'JOKER',
    suit: 'spades',
    isRedJoker: false
  };

  describe('getCardEffect', () => {
    it('should return correct effect for JOKER', () => {
      const effect = getCardEffect(redJoker);
      expect(effect).toEqual({
        type: 'special',
        value: 3,
        description: expect.any(String),
        moveToGraveyard: true,
        isJoker: true,
        availableActions: ['heal', 'attack', 'defend']
      });
    });
  });

  describe('isJokerActionAvailable', () => {
    it('should allow heal during player turn', () => {
      expect(isJokerActionAvailable('heal', true)).toBe(true);
      expect(isJokerActionAvailable('heal', false)).toBe(false);
    });

    it('should allow attack during player turn', () => {
      expect(isJokerActionAvailable('attack', true)).toBe(true);
      expect(isJokerActionAvailable('attack', false)).toBe(false);
    });

    it('should allow defend during opponent turn', () => {
      expect(isJokerActionAvailable('defend', false)).toBe(true);
      expect(isJokerActionAvailable('defend', true)).toBe(false);
    });
  });

  describe('canJokerTarget', () => {
    it('should not allow targeting As, 7, or 10', () => {
      const forbiddenCards: Card[] = [
        { id: '1', suit: 'hearts', value: 'A' },
        { id: '2', suit: 'hearts', value: '7' },
        { id: '3', suit: 'hearts', value: '10' }
      ];

      forbiddenCards.forEach(card => {
        expect(canJokerTarget(card)).toBe(false);
      });
    });

    it('should allow targeting other cards', () => {
      const allowedCards: Card[] = [
        { id: '1', suit: 'hearts', value: '2' },
        { id: '2', suit: 'hearts', value: 'K' },
        { id: '3', suit: 'hearts', value: 'Q' }
      ];

      allowedCards.forEach(card => {
        expect(canJokerTarget(card)).toBe(true);
      });
    });
  });
});