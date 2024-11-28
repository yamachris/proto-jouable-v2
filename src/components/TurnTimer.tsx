import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useTurnTimer } from '../hooks/useTurnTimer';

export function TurnTimer() {
  const { timeLeft, isWarning, consecutiveTimeouts } = useTurnTimer();

  return (
    <div className="space-y-2">
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        ${isWarning ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}
        transition-colors duration-300
      `}>
        <Clock className={`w-4 h-4 ${isWarning ? 'animate-pulse' : ''}`} />
        <span className="font-mono text-lg tabular-nums font-medium">
          {timeLeft}s
        </span>
      </div>

      {consecutiveTimeouts > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>
            {consecutiveTimeouts === 1 
              ? 'Attention : 1 timeout'
              : `Attention : ${consecutiveTimeouts} timeouts consécutifs`}
            {consecutiveTimeouts === 2 && 
              ' - Prochain timeout : perte d\'une carte de réserve !'}
          </span>
        </div>
      )}
    </div>
  );
}