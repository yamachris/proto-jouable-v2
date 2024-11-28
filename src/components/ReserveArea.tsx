import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Card } from './Card';
import { Shield } from 'lucide-react';

export function ReserveArea() {
  const { currentPlayer, phase, handleReserveAction, selectCard } = useGameStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-600">
          Réserve ({currentPlayer.reserve.length}/2)
        </span>
      </div>

      <div className="flex gap-4">
        {currentPlayer.reserve.map((card) => (
          <Card
            key={card.id}
            card={card}
            size="sm"
            onClick={() => selectCard(card)}
            className="hover:ring-2 hover:ring-blue-400"
          />
        ))}
        {Array.from({ length: 2 - currentPlayer.reserve.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-12 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
          >
            <span className="text-xs text-gray-400">Vide</span>
          </div>
        ))}
      </div>
    </div>
  );
}