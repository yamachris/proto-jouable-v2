import React from 'react';
import { Clock } from 'lucide-react';
import { useGameTimer } from '../hooks/useGameTimer';
import { cn } from '../utils/cn';

export function GameTimer() {
  const { 
    timeLeft, 
    formattedTotalTime, 
    isWarning
  } = useGameTimer();

  return (
    <div className="space-y-2">
      {/* Temps total de jeu */}
      <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-lg shadow-sm">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="font-mono text-xl tabular-nums text-gray-900 dark:text-gray-100">
          {formattedTotalTime}
        </span>
      </div>

      {/* Compte à rebours */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300',
        isWarning 
          ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      )}>
        <Clock className={cn(
          'w-4 h-4',
          isWarning && 'animate-pulse'
        )} />
        <span className="font-mono text-lg tabular-nums font-medium">
          {timeLeft}s
        </span>
      </div>
    </div>
  );
}