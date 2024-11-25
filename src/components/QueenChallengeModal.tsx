import React, { useState } from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import { Suit } from '../types/game';
import { cn } from '../utils/cn';

interface QueenChallengeModalProps {
  onGuess: (suit: Suit) => void;
  onCancel: () => void;
}

export function QueenChallengeModal({ onGuess, onCancel }: QueenChallengeModalProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

  const suitButtons: { suit: Suit; icon: typeof Heart; label: string }[] = [
    { suit: 'hearts', icon: Heart, label: 'Cœurs' },
    { suit: 'diamonds', icon: Diamond, label: 'Carreaux' },
    { suit: 'clubs', icon: Club, label: 'Trèfles' },
    { suit: 'spades', icon: Spade, label: 'Piques' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Défi de la Bonne Dame
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Devinez la couleur de la Dame qui sera jouée
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {suitButtons.map(({ suit, icon: Icon, label }) => (
            <button
              key={suit}
              onClick={() => setSelectedSuit(suit)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-200",
                selectedSuit === suit
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={cn(
                  "w-8 h-8",
                  suit === 'hearts' || suit === 'diamonds'
                    ? "text-red-500"
                    : "text-gray-800 dark:text-gray-200"
                )} />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => selectedSuit && onGuess(selectedSuit)}
            disabled={!selectedSuit}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              selectedSuit
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            )}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}