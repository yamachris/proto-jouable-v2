import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store/gameStore';
import { ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface PhaseManagerProps {
  totalCards: number;
}

export function PhaseManager({ totalCards }: PhaseManagerProps) {
  const { t } = useTranslation();
  const { 
    setPhase,
    phase,
    currentPlayer
  } = useGameStore();

  const handleNextPhase = () => {
    if (totalCards === 7) {
      console.log("Phase suivante : Défausse");
      setPhase('discard');
    } else if (totalCards < 7) {
      console.log("Phase suivante : Pioche");
      setPhase('draw');
    } else {
      console.error("Erreur : Nombre de cartes en main supérieur à 7");
    }
  };

  const canProceed = phase !== 'action' && currentPlayer.hand.length <= 7;

  return (
    <button
      onClick={handleNextPhase}
      disabled={!canProceed}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300",
        canProceed
          ? "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:hover:bg-blue-800/70 dark:text-blue-300"
          : "bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600 cursor-not-allowed"
      )}
    >
      <ArrowRight className="w-4 h-4" />
      <span>{t('game.actions.nextPhase')}</span>
    </button>
  );
}

interface TurnStartProps {
  onTurnStart: () => void;
}

export function TurnStart({ onTurnStart }: TurnStartProps) {
  const { t } = useTranslation();
  const { 
    currentPlayer,
    phase,
    setPhase
  } = useGameStore();

  const handleTurnStart = () => {
    const totalCards = currentPlayer.hand.length;
    console.log("Début du tour avec", totalCards, "cartes");
    
    if (totalCards <= 7) {
      if (totalCards === 7) {
        setPhase('discard');
      } else {
        setPhase('draw');
      }
    }
    
    onTurnStart();
  };

  const canStartTurn = phase === 'action';

  return (
    <button
      onClick={handleTurnStart}
      disabled={!canStartTurn}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300",
        canStartTurn
          ? "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:hover:bg-green-800/70 dark:text-green-300"
          : "bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600 cursor-not-allowed"
      )}
    >
      <ArrowRight className="w-4 h-4" />
      <span>{t('game.actions.startTurn')}</span>
    </button>
  );
}
