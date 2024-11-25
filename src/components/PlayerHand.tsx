import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Card, Phase } from '../types/game';
import { DraggableCard } from './DraggableCard';
import { DroppableZone } from './DroppableZone';

interface PlayerHandProps {
  cards: Card[];
  currentPhase: Phase;
  onCardSelect: (card: Card) => void;
  onMoveToReserve: (card: Card) => void;
  onDiscard: (card: Card) => void;
  onPassPhase: () => void;
  onPassTurn: () => void;
  selectedCard: Card | null;
}

export function PlayerHand({
  cards,
  currentPhase,
  onCardSelect,
  onMoveToReserve,
  onDiscard,
  onPassPhase,
  onPassTurn,
  selectedCard,
}: PlayerHandProps) {
  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as Card;
    if (card) {
      onCardSelect(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const card = event.active.data.current?.card as Card;
    if (!card) return;

    const targetId = event.over?.id;
    if (!targetId) return;

    if (targetId === 'reserve' && currentPhase === 'action') {
      onMoveToReserve(card);
    } else if (targetId === 'discard' && currentPhase === 'discard') {
      onDiscard(card);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="fixed bottom-0 left-0 right-0">
        <div className="bg-gradient-to-t from-white/95 to-white/90 p-6 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="flex justify-between items-center">
            <DroppableZone
              id="hand"
              className="flex gap-4"
              acceptCards={currentPhase === 'action'}
            >
              <div className="flex gap-4">
                {cards.map((card) => (
                  <div
                    key={`card-${card.id}`}
                    className="transform hover:-translate-y-4 transition-transform duration-200"
                  >
                    <DraggableCard
                      card={card}
                      isSelected={selectedCard?.id === card.id}
                      size="md"
                    />
                  </div>
                ))}
              </div>
            </DroppableZone>

            <div className="flex items-center gap-6">
              <DroppableZone
                id="discard"
                className={`w-16 h-24 border-2 border-dashed rounded-lg flex items-center justify-center ${
                  currentPhase === 'discard'
                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                    : 'border-gray-300'
                } transition-colors duration-200`}
                acceptCards={currentPhase === 'discard'}
              >
                <span className="text-sm text-gray-500 text-center px-2">
                  Défausser
                </span>
              </DroppableZone>

              <DroppableZone
                id="reserve"
                className={`w-16 h-24 border-2 border-dashed rounded-lg flex items-center justify-center ${
                  currentPhase === 'action'
                    ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'

              {currentPhase === 'action' ? (
                <button
                  onClick={onPassTurn}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Fin du Tour
                </button>
              ) : (
                <button
                  onClick={onPassPhase}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  Phase Suivante
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}