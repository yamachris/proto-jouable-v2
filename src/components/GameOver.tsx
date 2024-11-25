import React from 'react';
import { Flag, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';

interface GameOverProps {
  reason: 'surrender' | 'defeat';
  onRestart: () => void;
}

export function GameOver({ reason, onRestart }: GameOverProps) {
  const { currentPlayer } = useGameStore();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transition-colors duration-300">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50">
            <Flag className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Partie Terminée
          </h2>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {reason === 'surrender' 
                ? 'Vous avez abandonné la partie.'
                : 'Vous avez perdu tous vos points de vie.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Score final : {currentPlayer.health} points de vie
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onRestart}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium",
              "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
              "text-white shadow-lg hover:shadow-xl",
              "transform hover:scale-105"
            )}
          >
            <RefreshCw className="w-5 h-5" />
            Nouvelle Partie
          </button>
        </div>
      </div>
    </div>
  );
}