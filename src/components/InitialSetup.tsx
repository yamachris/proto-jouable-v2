import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { DraggableCard } from './DraggableCard';
import { DroppableZone } from './DroppableZone';

export function InitialSetup() {
  const { currentPlayer, moveToReserve, canMoveToReserve } = useGameStore();

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
          Sélectionnez 2 cartes pour votre réserve
        </h2>
        
        <DndContext onDragEnd={handleDragEnd}>
          <div className="space-y-8">
            {/* Zone de la main */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Votre main ({currentPlayer.hand.length} cartes)</h3>
              <div className="flex gap-4 flex-wrap justify-center">
                {currentPlayer.hand.map((card) => (
                  <DraggableCard key={card.id} card={card} />
                ))}
              </div>
            </div>

            {/* Zone de réserve */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Réserve ({currentPlayer.reserve.length}/2)
              </h3>
              <DroppableZone
                id="reserve"
                className="min-h-[150px] border-2 border-dashed border-gray-300 rounded-xl p-4 flex gap-4 justify-center items-center"
                acceptCards={currentPlayer.reserve.length < 2}
              >
                {currentPlayer.reserve.length === 0 ? (
                  <p className="text-gray-500">Glissez ici 2 cartes pour votre réserve</p>
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
              Commencer la partie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}