import { useState } from 'react';
import { Card, Suit, ColumnState } from '../types/game';

export function useColumnLogic() {
  const [columns, setColumns] = useState<Record<Suit, ColumnState>>({
    hearts: { cards: [], isLocked: false, hasLuckyCard: false },
    diamonds: { cards: [], isLocked: false, hasLuckyCard: false },
    clubs: { cards: [], isLocked: false, hasLuckyCard: false },
    spades: { cards: [], isLocked: false, hasLuckyCard: false }
  });

  const canPlaceCard = (card: Card, column: ColumnState, position: number): boolean => {
    if (column.isLocked) return false;

    if (card.value === '7' && !column.hasLuckyCard) {
      return true;
    }

    if (!column.hasLuckyCard && card.value !== '7') {
      return false;
    }

    const expectedValue = getExpectedValue(position);
    if (!expectedValue) return false;

    return card.value === expectedValue || card.value === 'JOKER';
  };

  const getExpectedValue = (position: number) => {
    const valueMap: Record<number, string> = {
      0: 'A', 1: '2', 2: '3', 3: '4', 4: '5',
      5: '6', 6: '7', 7: '8', 8: '9', 9: '10'
    };
    return valueMap[position];
  };

  const placeCard = (card: Card, suit: Suit, position: number) => {
    if (!canPlaceCard(card, columns[suit], position)) return false;

    setColumns(prev => {
      const newColumns = { ...prev };
      const newColumn = { ...newColumns[suit] };
      
      newColumn.cards = [...newColumn.cards];
      newColumn.cards[position] = card;
      
      if (card.value === '7') {
        newColumn.hasLuckyCard = true;
      }
      
      newColumns[suit] = newColumn;
      return newColumns;
    });

    return true;
  };

  return {
    columns,
    canPlaceCard,
    placeCard
  };
}