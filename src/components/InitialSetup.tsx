import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { DraggableCard } from './DraggableCard';
import { DroppableZone } from './DroppableZone';
import { useTranslation } from 'react-i18next';

export function InitialSetup() {
  const { currentPlayer, moveToReserve, canMoveToReserve } = useGameStore();
  const { t } = useTranslation();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || over.id !== 'reserve') return;
    
    const cardId = active.id as string;
    if (canMoveToReserve(currentPlayer.id)) {
      moveToReserve(currentPlayer.id, cardId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('game.setup.title')}
        </h2>
        
        <p className="text-center mb-8">
          {t('game.setup.welcome')}
        </p>
        
        <DndContext onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {/* Zone de la main */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('game.setup.yourHand')} ({currentPlayer.hand.length} {t('game.setup.handCount')})
              </h3>
              <div className="flex gap-4 flex-wrap justify-center">
                {currentPlayer.hand.map((card) => (
                  <DraggableCard key={card.id} card={card} />
                ))}
              </div>
            </div>

            {/* Zone de réserve */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                {t('game.setup.reserve')} ({currentPlayer.reserve.length}/2)
              </h3>
              <DroppableZone
                id="reserve"
                className="min-h-[150px] border-2 border-dashed border-gray-300 rounded-xl p-4 flex gap-4 justify-center items-center"
                acceptCards={currentPlayer.reserve.length < 2}
              >
                {currentPlayer.reserve.length === 0 ? (
                  <p className="text-gray-500">{t('game.setup.selectCards')}</p>
                ) : (
                  <div className="flex gap-4">
                    {currentPlayer.reserve.map((card) => (
                      <DraggableCard key={card.id} card={card} />
                    ))}
                  </div>
                )}
              </DroppableZone>
            </div>
          </div>
        </DndContext>

        {currentPlayer.reserve.length === 2 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => useGameStore.getState().startGame()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('game.setup.startGame')}
            </button>
          </div>
        )}

        <div className="blue-badge">
          {t('game.ui.cardCount', { current: currentPlayer.reserve.length, max: 2 })}
        </div>
        <div className="green-badge">
          {t('game.ui.cardCount', { current: currentPlayer.hand.length, max: 7 })}
        </div>
      </div>
    </div>
  );
}