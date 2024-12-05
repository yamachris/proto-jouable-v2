import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { Card, Suit } from '../types/game';
import { useGameStore } from '../store/gameStore';

// Props du composant PlaceButton
interface PlaceButtonProps {
  hasSixthCard: boolean;      // Si la colonne a une 6ème carte
  columnSuit: Suit;           // Couleur de la colonne
  onPlace: () => void;        // Callback après placement
  playerHand: Card[];         // Main du joueur
  playerReserve: Card[];      // Réserve du joueur
  reserveSuitCard?: Card | null; // Carte dans la reserveSuit
}

export function PlaceButton({ // Destructuration
  hasSixthCard, // Destructuration
  columnSuit, // Destructuration
  onPlace,
  playerHand,
  playerReserve,
  reserveSuitCard
}: PlaceButtonProps) {
  const { t } = useTranslation();
  const [canShowButton, setCanShowButton] = useState(false); // Etat du bouton
  
  // Récupération des fonctions du store
  const { 
    hasPlayedAction,
    phase, 
    turn,
    placeCardInColumn,
    removeReserveSuit,
    moveToHand,
    moveToReserve
  } = useGameStore();

  // Active le bouton quand la 6ème carte est jouée
  useEffect(() => {
    if (hasSixthCard) {
      setCanShowButton(true);
    }
  }, [turn]);

  // Vérifie si le bon 7 est dans la main ou la réserve
  const hasCorrectSevenInHand = () => {
    // Vérifie d'abord si un 7 est présent dans une colonne
    const columns = useGameStore.getState().columns;
    const has7InAnyColumn = Object.values(columns).some(column => 
      column.cards.some(c => c.value === '7')
    );

    // Si un 7 est présent, on ne peut pas utiliser de 7 ou de JOKER
    if (has7InAnyColumn) {
      return false;
    }

    return playerHand.some(card => card.value === '7' && card.suit === columnSuit) ||
           playerReserve.some(card => card.value === '7' && card.suit === columnSuit);
  };

  // Vérifie si le bon 7 est dans la reserveSuit
  const hasCorrectSevenInReserveSuit = () => {
    // Vérifie d'abord si un 7 est présent dans une colonne
    const columns = useGameStore.getState().columns;
    const has7InAnyColumn = Object.values(columns).some(column => 
      column.cards.some(c => c.value === '7')
    );

    // Si un 7 est présent, on ne peut pas utiliser de 7 ou de JOKER
    if (has7InAnyColumn) {
      return false;
    }

    return reserveSuitCard?.value === '7' && reserveSuitCard?.suit === columnSuit;
  };

  // Gestion du placement de carte
  const handlePlace = () => {
    if (!hasPlayedAction && reserveSuitCard && phase === 'action') {
      // Sauvegarde de la carte avant modification
      const cardToMove = reserveSuitCard; // Sauvegarde de la carte

      if (hasCorrectSevenInReserveSuit()) {
        // Place le 7 directement s'il est dans la reserveSuit
        placeCardInColumn(reserveSuitCard, columnSuit); // Place le 7
      } else if (hasCorrectSevenInHand()) { // Si le 7 est dans la main/réserve
        // Si le 7 est dans la main/réserve
        const sevenCard = playerHand.find(card => card.value === '7' && card.suit === columnSuit) || // Cherche le 7 dans la main
                         playerReserve.find(card => card.value === '7' && card.suit === columnSuit); // Cherche le 7 dans la réserve
        if (sevenCard) {
          // Place d'abord le 7
          placeCardInColumn(sevenCard, columnSuit);
          
          // Déplace la carte de la reserveSuit vers la main ou réserve
          if (cardToMove.type === 'joker') {
            moveToReserve(cardToMove);
          } else {
            moveToHand(cardToMove);
          }
        }
      }
      
      // Vide la reserveSuit
      removeReserveSuit(columnSuit); // Vide la reserveSuit
      onPlace(); // Appelle le callback
      setCanShowButton(false); // Desactive le bouton
    }
  };

  // Conditions d'affichage du bouton
  const shouldShowButton = 
    hasSixthCard && // 6ème carte présente
    (hasCorrectSevenInHand() || hasCorrectSevenInReserveSuit()) && // 7 disponible
    reserveSuitCard !== null && // Carte dans reserveSuit
    !hasPlayedAction && // Pas encore joué d'action
    phase === 'action' && // En phase d'action
    canShowButton; // Bouton activé

  if (!shouldShowButton) return null; // Rendu conditionnel

  return (
    <button
      onClick={handlePlace}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300",
        "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
        "hover:bg-emerald-200 dark:hover:bg-emerald-800"
      )}
      title={t('game.actions.place')}
    >
      <ArrowDown className="w-4 h-4" />
      <span>{t('game.actions.place')}</span>
    </button>
  );
}
