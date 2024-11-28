import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/gameStore';
import { Card } from '../types/game';

describe('Game Store - JOKER Actions', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentPlayer: {
        id: 'player-1',
        health: 10,
        maxHealth: 10,
        hand: [],
        reserve: [],
        discardPile: [],
        name: 'Joueur 1',
        profile: {
          epithet: 'Maître des Cartes'
        }
      },
      isPlayerTurn: true,
      phase: 'action'
    });
  });

  const redJoker: Card = {
    id: 'joker-1',
    type: 'joker',
    value: 'JOKER',
    suit: 'hearts',
    color: 'red'
  };

  describe('handleJokerAction', () => {
    it('should increase health and maxHealth when using JOKER heal action', () => {
      const store = useGameStore.getState();
      store.handleJokerAction(redJoker, 'heal');

      const state = useGameStore.getState();
      expect(state.currentPlayer.health).toBe(13);
      expect(state.currentPlayer.maxHealth).toBe(13);
      expect(state.currentPlayer.discardPile).toContainEqual(redJoker);
      expect(state.hasPlayedAction).toBe(true);
    });

    it('should allow multiple JOKER heals to stack', () => {
      const store = useGameStore.getState();
      store.handleJokerAction(redJoker, 'heal');
      
      const secondJoker: Card = {
        id: 'joker-2',
        type: 'joker',
        value: 'JOKER',
        suit: 'spades',
        color: 'black'
      };
      store.handleJokerAction(secondJoker, 'heal');

      const state = useGameStore.getState();
      expect(state.currentPlayer.health).toBe(16);
      expect(state.currentPlayer.maxHealth).toBe(16);
    });

    it('should not allow healing during opponent turn', () => {
      useGameStore.setState({ isPlayerTurn: false });
      
      const store = useGameStore.getState();
      const initialHealth = store.currentPlayer.health;
      store.handleJokerAction(redJoker, 'heal');

      const state = useGameStore.getState();
      expect(state.currentPlayer.health).toBe(initialHealth);
      expect(state.hasPlayedAction).toBe(false);
    });
  });
});