import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Shield, Sword } from 'lucide-react';

export function GameStatus() {
  const { currentPlayer, gamePhase } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-lg font-bold">{currentPlayer.health}/10</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm">
              {currentPlayer.reserve.length} cartes en réserve
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-purple-500" />
            <span className="text-sm">
              {currentPlayer.hand.length} cartes en main
            </span>
          </div>
        </div>

        <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
          Phase: {gamePhase}
        </div>
      </div>

      {currentPlayer.health <= 3 && (
        <div className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm">
          ⚠️ Attention: Points de vie critiques !
        </div>
      )}
    </div>
  );
}