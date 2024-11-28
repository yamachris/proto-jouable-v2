import React, { useState, useRef, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { Card } from './Card';
import { Shield, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Card as CardType, Phase } from '../types/game';
import { JokerActions } from './JokerActions';
import { useTranslation } from 'react-i18next';
import { QueenChallenge } from './QueenChallenge';

interface GameState {
  currentPlayer: {
    hand: CardType[];
    reserve: CardType[];
    discardPile: CardType[];
    hasUsedStrategicShuffle: boolean;
  };
  phase: Phase;
  selectedCards: CardType[];
  hasDiscarded: boolean;
  hasPlayedAction: boolean;
  message: string;
  awaitingStrategicShuffleConfirmation: boolean;
  isPlayerTurn: boolean;
  queenChallenge: {
    isActive: boolean;
    queen: Card | null;
  };
}

interface GameStore extends GameState {
  selectCard: (card: CardType) => void;
  handleDiscard: (card: CardType) => void;
  handleDrawCard: () => void;
  exchangeCards: (card1: CardType, card2: CardType) => void;
  handleJokerAction: (joker: CardType, action: 'heal' | 'attack') => void;
  setAttackMode: (mode: boolean) => void;
  setMessage: (message: string) => void;
  handleStrategicShuffle: () => void;
  endTurn: () => void;
  setPhase: (phase: Phase) => void;
  canUseStrategicShuffle: () => boolean;
  confirmStrategicShuffle: () => void;
  getState: () => GameStore;
  handleQueenChallenge: (isCorrect: boolean) => void;
  handleCardPlace: (suit: string, index: number) => void;
}

export function PlayerArea() {
  const { 
    currentPlayer, 
    phase,
    isPlayerTurn,
    selectedCards,
    selectCard,
    hasDiscarded,
    hasPlayedAction,
    handleDiscard,
    handleDrawCard,
    exchangeCards,
    handleJokerAction,
    handleCardPlace,
    handleQueenChallenge,
    setMessage,
    handleStrategicShuffle: storeHandleStrategicShuffle,
    endTurn
  } = useGameStore();

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const popupTimer = useRef<NodeJS.Timeout>();

  const canUseStrategicShuffle = useGameStore(state => state.canUseStrategicShuffle());
  const message = useGameStore(state => state.message);
  const awaitingConfirmation = useGameStore(state => state.awaitingStrategicShuffleConfirmation);
  const confirmStrategicShuffle = useGameStore(state => state.confirmStrategicShuffle);

  const handleStrategicShuffle = () => {
    if (!canUseStrategicShuffle) return;
    
    storeHandleStrategicShuffle();
    setShowPopup(true);
    
    if (popupTimer.current) {
      clearTimeout(popupTimer.current);
    }
    
    popupTimer.current = setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const [exchangeMode, setExchangeMode] = useState(false);
  const [selectedForExchange, setSelectedForExchange] = useState<{
    card: CardType;
    from: 'hand' | 'reserve';
  } | null>(null);

  const totalCards = currentPlayer.hand.length + currentPlayer.reserve.length;
  const canDiscard = phase === 'discard' && !hasDiscarded;
  const canDraw = phase === 'draw' && totalCards < 7;

  const handleCardClick = (card: CardType, from: 'hand' | 'reserve') => {
    if (card.type === 'joker' && isPlayerTurn && phase === 'action') {      selectCard(card);
      return;
    }

    if (exchangeMode) {
      if (selectedForExchange) {
        if (selectedForExchange.from !== from) {
          exchangeCards(
            selectedForExchange.from === 'hand' ? selectedForExchange.card : card,
            selectedForExchange.from === 'reserve' ? selectedForExchange.card : card
          );
        }
        setExchangeMode(false);
        setSelectedForExchange(null);
      } else {
        setSelectedForExchange({ card, from });
      }
      return;
    }

    if (phase === 'discard' && canDiscard) {
      handleDiscard(card);
      return;
    }

    const isSelected = selectedCards.some(c => c.id === card.id);
    if (isSelected) {
      selectCard(card);
    } else if (selectedCards.length < 2) {
      selectCard(card);
    }
  };

  const handleJokerActionClick = (action: 'heal' | 'attack') => {
    const selectedJoker = selectedCards[0];
    if (selectedJoker?.type === 'joker') {
      handleJokerAction(selectedJoker, action);
    }
  };

  const { t } = useTranslation();

  const [showQueenChallenge, setShowQueenChallenge] = useState(false);
  const [challengeQueen, setChallengeQueen] = useState<Card | null>(null);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-36 transition-colors duration-300">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-start gap-8">
          {/* Main */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {t('game.cards.hand')} ({currentPlayer.hand.length}/5)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('game.cards.total')} {totalCards}/7 {t('game.cards.hand')}
                </span>
                <button
                  onClick={() => {
                    setExchangeMode(!exchangeMode);
                    setSelectedForExchange(null);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors",
                    exchangeMode
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
                    "hover:bg-blue-200 dark:hover:bg-blue-800"
                  )}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{t('game.actions.exchange')}</span>
                </button>
                <button
                  onClick={handleStrategicShuffle}
                  disabled={!canUseStrategicShuffle}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors",
                    canUseStrategicShuffle
                      ? "bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-800/70 text-purple-600 dark:text-purple-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50",
                    "ring-1 ring-purple-400/50 hover:ring-purple-500"
                  )}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('game.ui.strategicShuffle')}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              {currentPlayer.hand.map((card) => (
                <div key={card.id} className="relative group">
                  <Card
                    card={card}
                    isSelected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => {
                      if (exchangeMode) {
                        if (!selectedForExchange) {
                          setSelectedForExchange({ card, from: 'hand' });
                        } else if (selectedForExchange.from === 'reserve') {
                          exchangeCards(card, selectedForExchange.card);
                          setSelectedForExchange(null);
                          setExchangeMode(false);
                        }
                      } else if (phase === 'discard') {
                        handleDiscard(card);
                      } else {
                        selectCard(card);
                      }
                    }}
                    onJokerAction={(action) => handleJokerAction(card, action)}
                    onQueenActivate={() => {
                      const activator = selectedCards.find(c => c.type === 'joker' || c.value === '7');
                      if (activator) {
                        handleCardPlace(card.suit, 0);
                      }
                    }}
                    onQueenChallenge={() => {
                      setShowQueenChallenge(true);
                      setChallengeQueen(card);
                    }}
                    selectedCards={selectedCards}
                    isPlayerTurn={isPlayerTurn}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Reserve */}
          <div className="w-48 space-y-2">
            <div className="flex items-center gap-2 px-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {t('game.cards.reserve')} ({currentPlayer.reserve.length}/2)
              </span>
            </div>

            <div className="flex gap-4 justify-center">
              {currentPlayer.reserve.map((card) => (
                <div key={card.id} className="relative group">
                  <Card
                    card={card}
                    isSelected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => {
                      if (exchangeMode) {
                        if (!selectedForExchange) {
                          setSelectedForExchange({ card, from: 'reserve' });
                        } else if (selectedForExchange.from === 'hand') {
                          exchangeCards(selectedForExchange.card, card);
                          setSelectedForExchange(null);
                          setExchangeMode(false);
                        }
                      } else if (phase === 'discard') {
                        handleDiscard(card);
                      } else {
                        selectCard(card);
                      }
                    }}
                    onJokerAction={(action) => handleJokerAction(card, action)}
                    onQueenActivate={() => {
                      const activator = selectedCards.find(c => c.type === 'joker' || c.value === '7');
                      if (activator) {
                        handleCardPlace(card.suit, 0);
                      }
                    }}
                    onQueenChallenge={() => {
                      setShowQueenChallenge(true);
                      setChallengeQueen(card);
                    }}
                    selectedCards={selectedCards}
                    isPlayerTurn={isPlayerTurn}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-opacity duration-300">
          {message}
        </div>
      )}

      {showQueenChallenge && challengeQueen && (
        <QueenChallenge
          queen={challengeQueen}
          onGuess={(isCorrect) => {
            handleQueenChallenge(isCorrect);
            setShowQueenChallenge(false);
            setChallengeQueen(null);
          }}
        />
      )}
    </div>
  );
}