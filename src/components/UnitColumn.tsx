import React from 'react';
import { Heart, Diamond, Club, Spade, Sword, Crown } from 'lucide-react';
import { Suit, ColumnState } from '../types/game';
import { cn } from '../utils/cn';

interface UnitColumnProps {
  suit: Suit;
  column: ColumnState;
  onCardPlace: (position: number) => void;
  isActive?: boolean;
}

export function UnitColumn({ suit, column, onCardPlace, isActive }: UnitColumnProps) {
  const getSuitIcon = (suit: Suit) => {
    const className = cn(
      'w-4 h-4',
      ['hearts', 'diamonds'].includes(suit) ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'
    );
    
    switch (suit) {
      case 'hearts': return <Heart className={className} />;
      case 'diamonds': return <Diamond className={className} />;
      case 'clubs': return <Club className={className} />;
      case 'spades': return <Spade className={className} />;
    }
  };

  const getActivatorIndicator = () => {
    if (!column.hasLuckyCard) return null;

    if (column.activatorType === '7') {
      return (
        <span className="ml-1 text-[0.6rem] font-medium text-yellow-600 dark:text-yellow-400">
          7<sub className="text-[0.4rem]">{getSuitIcon(column.luckyCard?.suit!)}</sub>
        </span>
      );
    }

    return (
      <span className={cn(
        "ml-1 text-[0.6rem] font-medium",
        column.activatorColor === 'red' 
          ? "text-red-600 dark:text-red-400" 
          : "text-gray-800 dark:text-gray-200"
      )}>
        J<span className="text-[0.4rem]">{column.activatorColor === 'red' ? '♦' : '♠'}</span>
      </span>
    );
  };

  return (
    <div className={cn(
      'w-full bg-white/95 dark:bg-gray-900/95 rounded-lg shadow-md p-3',
      isActive ? 'ring-2 ring-blue-400' : 'ring-1 ring-gray-200 dark:ring-gray-700',
      'transition-all duration-200'
    )}>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {getSuitIcon(suit)}
          {getActivatorIndicator()}
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {column.cards.filter(Boolean).length}/10
        </span>
      </div>

      {/* Emplacements des cartes */}
      <div className="space-y-1.5">
        {['10', '9', '8', '7', '6', '5', '4', '3', '2', 'As'].map((value, index) => {
          const position = 9 - index;
          const card = column.cards[position];
          
          return (
            <div
              key={value}
              onClick={() => isActive && !card && onCardPlace(position)}
              className={cn(
                'h-7 rounded flex items-center justify-center text-sm transition-all duration-200',
                card ? 'bg-white dark:bg-gray-800 shadow-sm' : 'border border-dashed',
                !card && isActive && 'hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer'
              )}
            >
              {card ? (
                <span className={cn(
                  'font-medium',
                  ['hearts', 'diamonds'].includes(card.suit) 
                    ? 'text-red-500' 
                    : 'text-gray-800 dark:text-gray-200'
                )}>
                  {card.value}
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {value}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Zone spéciale pour Valet et Roi */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
          <Sword className="w-4 h-4 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">Valet</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
          <Crown className="w-4 h-4 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">Roi</span>
        </div>
      </div>
    </div>
  );
}