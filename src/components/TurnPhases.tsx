import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { DraggableCard } from './DraggableCard';
import { DroppableZone } from './DroppableZone';

export function TurnPhases() {
  const { currentPlayer, phase, discardCard, drawCard, nextPhase } = useGameStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const cardId = active.id as string;
    if (over.id === 'discard' && phase === 'discard') {
      discardCard(currentPlayer.id, cardId);
      drawCard(currentPlayer.id);
      nextPhase();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex justify-between items-center">
          {/* Phase de défausse */}
          {phase === 'discard' && (
            <>
              <div className="flex gap-4">
                {currentPlayer.hand.map((card) => (
                  <DraggableCard key={card.id} card={card} />
                ))}
              </div>
              
              <DroppableZone
                id="discard"
                className="w-32 h-48 border-2 border-dashed border-red-300 rounded-xl flex items-center justify-center"
                acceptCards={true}
              >
                <p className="text-center text-gray-500">
                  Glissez une carte ici pour la défausser
                </p>
              </DroppableZone>
            </>
          )}

          {/* Phase de pioche */}
          {phase === 'draw' && (
            <div className="text-center">
              <p className="text-lg mb-4">
                Piochez une carte pour compléter votre main
              </p>
              <button
                onClick={() => {
                  drawCard(currentPlayer.id);
                  nextPhase();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Piocher une carte
              </button>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}