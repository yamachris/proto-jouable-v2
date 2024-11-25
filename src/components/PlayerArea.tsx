import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Card } from './Card';
import { Shield, ArrowLeftRight } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Card as CardType } from '../types/game';

export function PlayerArea() {
  const { 
    currentPlayer, 
    phase,
    isPlayerTurn,
    selectedCards,
    selectCard,
    handleDiscard,
    handleDrawCard,
    hasDiscarded,
    exchangeCards,
    handleJokerAction
  } = useGameStore();

  const [exchangeMode, setExchangeMode] = useState(false);
  const [selectedForExchange, setSelectedForExchange] = useState<{
    card: CardType;
    from: 'hand' | 'reserve';
  } | null>(null);

  const totalCards = currentPlayer.hand.length + currentPlayer.reserve.length;
  const canDiscard = phase === 'discard' && !hasDiscarded;
  const canDraw = phase === 'draw' && totalCards < 7;

  const handleCardClick = (card: CardType, from: 'hand' | 'reserve') => {
    if (card.value === 'JOKER' && isPlayerTurn && phase === 'action') {
      selectCard(card);
      return;
    }

    if (exchangeMode) {
      if (selectedForExchange) {
        if (selectedForExchange.from !== from) {
          exchangeCards(
            selectedForExchange.from === 'hand' ? selectedForExchange.card : card,
            selectedForExchange.from === 'reserve' ? selectedForExchange.card : card
          );
        }
        setExchangeMode(false);
        setSelectedForExchange(null);
      } else {
        setSelectedForExchange({ card, from });
      }
      return;
    }

    if (phase === 'discard' && canDiscard) {
      handleDiscard(card);
      return;
    }

    selectCard(card);
  };

  const handleJokerActionClick = (action: 'heal' | 'attack') => {
    const selectedJoker = selectedCards[0];
    if (selectedJoker?.value === 'JOKER') {
      handleJokerAction(selectedJoker, action);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-36 transition-colors duration-300">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-start gap-8">
          {/* Main */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Main ({currentPlayer.hand.length}/5)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {totalCards}/7 cartes
                </span>
                <button
                  onClick={() => {
                    setExchangeMode(!exchangeMode);
                    setSelectedForExchange(null);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors",
                    exchangeMode
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  )}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Échanger</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              {currentPlayer.hand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  isSelected={
                    selectedCards.some(c => c.id === card.id) ||
                    selectedForExchange?.card.id === card.id
                  }
                  onClick={() => handleCardClick(card, 'hand')}
                  isDisabled={phase === 'draw'}
                  size="md"
                  className="transform hover:-translate-y-4 transition-all duration-300"
                  isPlayerTurn={isPlayerTurn}
                  currentHealth={currentPlayer.health}
                  onJokerAction={handleJokerActionClick}
                />
              ))}
            </div>
          </div>

          {/* Reserve */}
          <div className="w-48 space-y-2">
            <div className="flex items-center gap-2 px-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Réserve ({currentPlayer.reserve.length}/2)
              </span>
            </div>

            <div className="flex gap-4">
              {currentPlayer.reserve.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  isSelected={
                    selectedCards.some(c => c.id === card.id) ||
                    selectedForExchange?.card.id === card.id
                  }
                  onClick={() => handleCardClick(card, 'reserve')}
                  isDisabled={phase === 'draw'}
                  size="md"
                  className={cn(
                    "transform hover:-translate-y-4 transition-all duration-300",
                    "ring-2 ring-blue-200 dark:ring-blue-500"
                  )}
                  isPlayerTurn={isPlayerTurn}
                  currentHealth={currentPlayer.health}
                  onJokerAction={handleJokerActionClick}
                />
              ))}
              {Array.from({ length: 2 - currentPlayer.reserve.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-16 h-24 border-2 border-dashed border-blue-200 dark:border-blue-500 rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}