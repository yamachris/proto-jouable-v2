import { useState, useEffect } from 'react';
import { Card, Player } from '../types/game';
import { createDeck, drawCards } from '../utils/deck';

export function useGameSetup() {
  const [player, setPlayer] = useState<Player>({
    id: 'player-1',
    name: 'Joueur 1',
    health: 10,
    hand: [],
    reserve: [],
    discardPile: []
  });

  const [deck, setDeck] = useState<Card[]>([]);

  useEffect(() => {
    const initialDeck = createDeck();
    const [remainingDeck, initialHand] = drawCards(initialDeck, 7);
    
    setDeck(remainingDeck);
    setPlayer(prev => ({
      ...prev,
      hand: initialHand
    }));
  }, []);

  const moveToReserve = (card: Card) => {
    if (player.reserve.length >= 2) return;

    setPlayer(prev => ({
      ...prev,
      hand: prev.hand.filter(c => c.id !== card.id),
      reserve: [...prev.reserve, card]
    }));
  };

  const canStartGame = () => {
    const hasLuckySeven = player.hand.some(card => card.value === '7');
    const hasStartingCard = player.hand.some(card => 
      card.value === 'A' || ['J', 'Q', 'K'].includes(card.value)
    );
    return hasLuckySeven && hasStartingCard && player.reserve.length === 2;
  };

  return {
    player,
    deck,
    moveToReserve,
    canStartGame
  };
}