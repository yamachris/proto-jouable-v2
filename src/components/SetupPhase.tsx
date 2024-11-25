import React from 'react';
import { Card } from './Card';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';

export function SetupPhase() {
  const { 
    currentPlayer, 
    moveToReserve,
    startGame
  } = useGameStore();

  const isReserveComplete = currentPlayer.reserve.length === 2;
  const canStartGame = isReserveComplete;

  const handleMoveToReserve = (card: Card) => {
    if (!isReserveComplete) {
      moveToReserve(card);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
          Phase de Préparation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Sélectionnez 2 cartes de votre main pour les placer en réserve
        </p>

        <div className="space-y-8">
          {/* Zone de réserve */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Réserve</h3>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                isReserveComplete 
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                  : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              )}>
                {currentPlayer.reserve.length}/2 cartes
              </span>
            </div>

            <div className="flex gap-8 justify-center min-h-[200px] p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              {currentPlayer.reserve.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  size="lg"
                  isDisabled
                />
              ))}
              {Array.from({ length: 2 - currentPlayer.reserve.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-24 h-36 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl flex items-center justify-center bg-white/50 dark:bg-gray-800/50"
                >
                  <span className="text-blue-400 dark:text-blue-500 text-center px-4">
                    Emplacement {currentPlayer.reserve.length + i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main du joueur */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Votre Main</h3>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                {currentPlayer.hand.length} cartes
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              {currentPlayer.hand.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleMoveToReserve(card)}
                  isDisabled={isReserveComplete}
                  size="lg"
                  className={cn(
                    "transform hover:-translate-y-4 transition-all duration-300",
                    !isReserveComplete && "cursor-pointer hover:ring-2 hover:ring-blue-400"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bouton de démarrage */}
        <div className="mt-8 text-center">
          <button 
            onClick={startGame}
            disabled={!canStartGame}
            className={cn(
              "px-6 py-3 rounded-lg font-medium shadow-sm transition-all duration-300",
              canStartGame
                ? "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 hover:scale-105" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            )}
          >
            {canStartGame 
              ? 'Commencer la partie'
              : 'Sélectionnez 2 cartes pour la réserve'
            }
          </button>
        </div>
      </div>
    </div>
  );
}