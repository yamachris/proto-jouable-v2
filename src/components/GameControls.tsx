import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Flag, ArrowRight, AlertCircle, SkipForward } from 'lucide-react';
import { cn } from '../utils/cn';
import { getPhaseMessage } from '../utils/gameLogic';

export function GameControls() {
  const { 
    phase,
    turn,
    hasDiscarded,
    hasDrawn,
    hasPlayedAction,
    handlePassTurn,
    handleSurrender,
    handleSkipAction,
    currentPlayer
  } = useGameStore();

  const totalCards = currentPlayer.hand.length + currentPlayer.reserve.length;
  const canPassTurn = phase === 'action' && hasDiscarded && hasDrawn;
  const canSkipAction = phase === 'action' && !hasPlayedAction;

  const phaseMessage = getPhaseMessage(phase, hasDiscarded, hasDrawn, hasPlayedAction, totalCards, 0);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium">
              <span>Tour {turn} {phase === 'discard' && '- défausse'}
                            {phase === 'draw' && '- pioche'}
                            {phase === 'action' && '- action'}</span>
            </div>
          </div>

          {phaseMessage && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>{phaseMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleSurrender}
              className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-300 flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              <span>Abandonner</span>
            </button>

            {canSkipAction && (
              <button
                onClick={handleSkipAction}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2",
                  "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
                  "hover:bg-yellow-200 dark:hover:bg-yellow-800"
                )}
              >
                <SkipForward className="w-4 h-4" />
                <span>Passer l'action</span>
              </button>
            )}

            <button
              onClick={handlePassTurn}
              disabled={!canPassTurn}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium flex items-center gap-2",
                canPassTurn 
                  ? "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed",
                "transition-colors duration-300"
              )}
            >
              <span>Fin du Tour</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}