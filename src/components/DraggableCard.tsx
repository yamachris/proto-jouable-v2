import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types/game';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface DraggableCardProps {
  card: Card;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DraggableCard({ card, isSelected, size = 'md' }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 999 : 'auto',
  };

  const getSuitIcon = (className: string) => {
    const icon = {
      hearts: <Heart className={className} />,
      diamonds: <Diamond className={className} />,
      clubs: <Club className={className} />,
      spades: <Spade className={className} />,
    }[card.suit];

    return <div className="flex items-center justify-center">{icon}</div>;
  };

  const sizeClasses = {
    sm: 'w-12 h-20',
    md: 'w-16 h-24',
    lg: 'w-24 h-36',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getColorClass = () => {
    if (card.value === 'JOKER') return 'text-purple-600';
    return ['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-gray-800';
  };

  const colorClass = getColorClass();
  const iconClass = `${iconSizes[size]} ${colorClass}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        ${sizeClasses[size]} bg-white rounded-lg shadow-md border-2
        ${isDragging ? 'shadow-xl scale-105' : ''}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${card.value === 'JOKER'
          ? 'border-purple-300 hover:border-purple-400'
          : ['hearts', 'diamonds'].includes(card.suit)
          ? 'border-red-300 hover:border-red-400'
          : 'border-gray-300 hover:border-gray-400'
        }
        transition-all duration-200 cursor-grab active:cursor-grabbing
        hover:shadow-lg transform hover:-translate-y-1 select-none
      `}
    >
      <div className="relative w-full h-full p-1">
        {/* Top value */}
        <div className="absolute top-1 left-1 flex flex-col items-center">
          <span className={`${textSizes[size]} font-bold ${colorClass}`}>
            {card.value}
          </span>
          {getSuitIcon(iconClass)}
        </div>

        {/* Center suit */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {getSuitIcon(`${iconSizes[size]} scale-[2] opacity-25 ${colorClass}`)}
        </div>

        {/* Bottom value */}
        <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180">
          <span className={`${textSizes[size]} font-bold ${colorClass}`}>
            {card.value}
          </span>
          {getSuitIcon(iconClass)}
        </div>
      </div>
    </div>
  );
}