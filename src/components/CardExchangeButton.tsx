import React from 'react';
import { Card } from '../types/game';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { useGameStore } from '../store/gameStore';

interface CardExchangeButtonProps {
  activatorCard: Card;
}

export function CardExchangeButton({ activatorCard }: CardExchangeButtonProps) {
  const { t } = useTranslation();
  const { 
    currentPlayer, 
    phase, 
    hasPlayedAction, 
    selectedCards,
    handleActivatorExchange 
  } = useGameStore();

  // Vérifier si le joueur a un 7 ou un Joker dans sa main/réserve
  const hasValidCard = [...currentPlayer.hand, ...currentPlayer.reserve].some(
    card => (card.type === 'joker' || card.value === '7') && 
           (activatorCard.type === 'joker' || activatorCard.value === '7')
  );

  // Si aucune carte valide n'est disponible, on ne rend pas le bouton
  if (!hasValidCard) return null;

  // Vérifier si une carte valide est sélectionnée
  const selectedValidCard = selectedCards.find(
    card => (card.type === 'joker' || card.value === '7')
  );

  const canExchange = phase === 'action' && 
                     !hasPlayedAction && 
                     selectedValidCard;

  const handleExchangeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedValidCard) {
      handleActivatorExchange(activatorCard, selectedValidCard);
    }
  };

  return (
    <button
      onClick={handleExchangeClick}
      disabled={!canExchange}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all",
        canExchange 
          ? "bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-800/70 dark:text-amber-300"
          : "bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600 cursor-not-allowed",
        "border border-gray-300 dark:border-gray-700"
      )}
      title={t('game.actions.exchange')}
    >
      <ArrowLeftRight className="w-4 h-4" />
      <span>Échanger</span>
    </button>
  );
} 