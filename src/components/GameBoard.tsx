import React from 'react';
import { useGameStore } from '../store/gameStore';
import { UnitColumn } from './UnitColumn';
import { Suit } from '../types/game';
import { canActivateColumn } from '../utils/gameLogic';

export function GameBoard() {
  const { 
    selectedCards,
    columns,
    handleCardPlace,
    phase
  } = useGameStore();

  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

  const canPlaceCard = (suit: Suit) => {
    if (phase !== 'action') return false;

    // Pour l'activation avec As + 7/JOKER
    if (selectedCards.length === 2) {
      return canActivateColumn(selectedCards, suit);
    }

    // Pour le placement normal de cartes
    if (selectedCards.length === 1) {
      const column = columns[suit];
      if (!column.hasLuckyCard) return false;
      return selectedCards[0].suit === suit || selectedCards[0].value === 'JOKER';
    }

    return false;
  };

  return (
    <div className="bg-gradient-to-br from-green-50/95 to-green-100/95 dark:from-gray-800/95 dark:to-gray-700/95 rounded-2xl p-4 md:p-6 shadow-xl transition-colors duration-300">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {suits.map((suit) => (
          <UnitColumn
            key={suit}
            suit={suit}
            column={columns[suit]}
            onCardPlace={(position) => handleCardPlace(suit, position)}
            isActive={canPlaceCard(suit)}
          />
        ))}
      </div>
    </div>
  );
}