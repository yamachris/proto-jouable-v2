import React from 'react';
import { Heart, Sword } from 'lucide-react';
import { Card } from '../types/game';
import { cn } from '../utils/cn';

interface JokerActionsProps {
  card: Card;
  onAction: (action: 'heal' | 'attack') => void;
  isPlayerTurn: boolean;
}

export function JokerActions({ card, onAction, isPlayerTurn }: JokerActionsProps) {
  if (!isPlayerTurn) return null;

  return (
    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
      <button
        onClick={() => onAction('heal')}
        className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
        title="Soigner 3 PV"
      >
        <Heart className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onAction('attack')}
        className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        title="Attaquer une carte"
      >
        <Sword className="w-4 h-4" />
      </button>
    </div>
  );
}