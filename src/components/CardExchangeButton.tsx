import React, { useState } from 'react';
import { Card, ColumnState } from '../types/game';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, ArrowDown, ArrowsUpDown } from 'lucide-react';
import { cn } from '../utils/cn';
import { useGameStore } from '../store/gameStore';

interface CardExchangeButtonProps {
  activatorCard: Card;
  column: ColumnState;
}

export const CardExchangeButton: React.FC<CardExchangeButtonProps> = ({ activatorCard, column }) => {
  const { t } = useTranslation();
  const { 
    currentPlayer, 
    phase, 
    hasPlayedAction, 
    selectedCards,
    handleActivatorExchange,
    handleSevenAction 
  } = useGameStore();

  // === FONDATIONS : Logique d'échange originale ===
  const hasValidCard = selectedCards.length === 1 && 
    (selectedCards[0].value === '7' || selectedCards[0].type === 'joker');
  const canExchange = phase === 'action' && !hasPlayedAction && hasValidCard;

  // === NOUVEL ÉTAGE : Logique de placement automatique ===
  const sixthCard = column.cards.find((_, index) => index === 5);
  const is6AtPosition6 = sixthCard?.value === '6';
  
  const hasCorrectCardInHandOrReserve = (
    currentPlayer.hand.some(card => 
      (card.value === '7' && card.suit === sixthCard?.suit) || 
      card.type === 'joker'
    ) ||
    currentPlayer.reserve.some(card => 
      (card.value === '7' && card.suit === sixthCard?.suit) || 
      card.type === 'joker'
    )
  );

  const reserveSuitCard = column.reserveSuit;
  const canPlaceCard = is6AtPosition6 && 
    hasCorrectCardInHandOrReserve &&
    reserveSuitCard &&
    phase === 'action' && 
    !hasPlayedAction;

  // Priorité au placement automatique si les conditions sont réunies
  if (canPlaceCard && reserveSuitCard && sixthCard) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Trouver le bon 7 ou JOKER dans la main ou la réserve
          const correctCardFromHand = currentPlayer.hand.find(card => 
            (card.value === '7' && card.suit === sixthCard.suit) || 
            card.type === 'joker'
          );
          const correctCardFromReserve = currentPlayer.reserve.find(card => 
            (card.value === '7' && card.suit === sixthCard.suit) || 
            card.type === 'joker'
          );
          const correctCard = correctCardFromHand || correctCardFromReserve;

          if (!correctCard) return;

          // Mettre à jour la colonne avec le bon 7 ou JOKER
          const newColumn = {
            ...column,
            cards: [...column.cards, correctCard],
            reserveSuit: null,
            activatorType: null
          };

          // Mettre à jour la main ou la réserve du joueur avec la carte de la reserveSuit
          const newPlayerHand = correctCardFromHand 
            ? currentPlayer.hand.map(card => card === correctCard ? reserveSuitCard : card)
            : currentPlayer.hand;
          const newPlayerReserve = correctCardFromReserve
            ? currentPlayer.reserve.map(card => card === correctCard ? reserveSuitCard : card)
            : currentPlayer.reserve;
          
          useGameStore.setState(state => ({
            ...state,
            columns: {
              ...state.columns,
              [sixthCard.suit]: newColumn
            },
            currentPlayer: {
              ...state.currentPlayer,
              hand: newPlayerHand,
              reserve: newPlayerReserve
            },
            hasPlayedAction: true,
            message: correctCard.type === 'joker' 
              ? t('game.messages.jokerPlaced')
              : t('game.messages.sevenPlaced')
          }));
        }}
        className="flex items-center gap-1 px-2 py-1 text-sm rounded dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-slate-900"
      >
        <ArrowDown className="w-4 h-4" />
        {t('Placer')}
      </button>
    );
  }

  // Sinon, permettre l'échange entre 7/JOKER
  if (hasValidCard && reserveSuitCard) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          const selectedCard = selectedCards[0];

          // Vérifier que les deux cartes sont des 7 ou JOKER
          if ((selectedCard.value === '7' || selectedCard.type === 'joker') && 
              (reserveSuitCard.value === '7' || reserveSuitCard.type === 'joker')) {
            handleActivatorExchange(reserveSuitCard, selectedCard);
          }
        }}
        className="flex items-center gap-1 px-2 py-1 text-sm rounded dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-slate-900"
      >
        <ArrowLeftRight className="w-4 h-4" />
        {t('Échanger')}
      </button>
    );
  }

  return null;
};

// Composant de test séparé
export const TestButton: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const gameStore = useGameStore();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const testGameLogic = () => {
    setLogs([]); // Réinitialiser les logs
    try {
      // Créer une séquence de test pour le remplacement du 7
      const testCards = [
        { id: '6-diamonds', value: '6', suit: 'diamonds', type: 'number', color: 'red' },
        { id: '7-spades', value: '7', suit: 'spades', type: 'number', color: 'black' },
        { id: '7-diamonds', value: '7', suit: 'diamonds', type: 'number', color: 'red' }
      ];

      if (gameStore.currentPlayer && gameStore.setPhase && gameStore.handleCardPlace) {
        addLog("Début du test de remplacement du 7...");

        // Placer le 6 de carreau
        gameStore.currentPlayer.hand = [testCards[0]];
        addLog("1. Placement du 6 de carreau");
        gameStore.setPhase('action');
        const success1 = gameStore.handleCardPlace('diamonds', 0);
        addLog(success1 ? "✅ 6 de carreau placé" : "❌ Échec du placement du 6");

        // Placer le 7 de pique (activateur)
        gameStore.currentPlayer.hand = [testCards[1]];
        addLog("\n2. Placement du 7 de pique (activateur)");
        gameStore.setPhase('action');
        const success2 = gameStore.handleCardPlace('diamonds', 1);
        addLog(success2 ? "✅ 7 de pique placé" : "❌ Échec du placement du 7 de pique");

        // Tenter de remplacer par le 7 de carreau
        gameStore.currentPlayer.hand = [testCards[2]];
        addLog("\n3. Tentative de remplacement par le 7 de carreau");
        gameStore.setPhase('action');
        const success3 = gameStore.handleCardPlace('diamonds', 1);
        addLog(success3 ? "✅ 7 de carreau placé et 7 de pique retourné" : "❌ Échec du remplacement");

        addLog("\nTest terminé!");
      }

      setTestResult('Test de remplacement du 7 terminé');
    } catch (error) {
      addLog(`\n❌ ERREUR: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setTestResult(`Échec du test : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={testGameLogic}
        className="px-4 py-2 rounded text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        Tester le remplacement
      </button>
      {(testResult || logs.length > 0) && (
        <div className="mt-2 p-2 rounded border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm text-sm max-h-96 overflow-y-auto" style={{ minWidth: '300px' }}>
          {logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap mb-1">
              {log}
            </div>
          ))}
          {testResult && (
            <div className="mt-2 pt-2 border-t font-bold">
              {testResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};