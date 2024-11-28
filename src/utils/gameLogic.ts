import { Card, Player, Phase, Suit, ColumnState, CardColor } from '../types/game';
import { useTranslation } from 'react-i18next';

const MAX_HAND_SIZE = 5;
const MAX_RESERVE_SIZE = 2;
const TOTAL_CARDS = 7;

export function getCardColor(card: Card): CardColor {
  if (card.type === 'joker') {
    return card.color;
  }
  return ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
}

export function getPhaseMessage(
  phase: Phase, 
  hasDiscarded: boolean, 
  hasDrawn: boolean, 
  hasPlayedAction: boolean,
  playedCardsLastTurn: number,
  turn: number
): string {
  const { t } = useTranslation();

  switch (phase) {
    case 'discard':
      if (turn === 1) {
        return t('game.ui.startMessage');
      }
      return hasDiscarded ? '' : t('game.messages.discardPhase');
      
    case 'draw':
      return hasDrawn ? '' : t('game.messages.drawPhase');
      
    case 'action':
      if (hasPlayedAction) {
        return t('game.messages.canEndTurn');
      }
      return t('game.messages.actionPhase');
      
    default:
      return '';
  }
}

export function handleJokerAction(player: Player, action: 'heal' | 'attack'): Player {
  if (action === 'heal') {
    return {
      ...player,
      health: Math.min(player.health + 3, player.maxHealth)
    };
  }
  // Logique d'attaque à implémenter
  return player;
}

export function canActivateColumn(cards: Card[], suit: Suit): boolean {
  if (cards.length !== 2) return false;

  // L'As doit correspondre à la couleur de la colonne
  const asCard = cards.find(c => c.value === 'As' && c.suit === suit);
  // Le 7 ou JOKER peut être de n'importe quelle couleur
  const activator = cards.find(c => c.value === '7' || c.type === 'joker');
  
  return !!asCard && !!activator;
}

export function canPlaceCard(card: Card, column: ColumnState, position: number): boolean {
  // Position As - uniquement As de la même couleur
  if (position === 0) {
    return card.value === 'As' && card.suit === column.activatorSuit;
  }

  if (!column.hasLuckyCard) {
    return false;
  }

  // Vérifier que la carte est dans la séquence autorisée
  const sequence = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const cardIndex = sequence.indexOf(card.value);
  if (cardIndex === -1) return false;

  // Vérifier l'ordre croissant
  const previousCard = column.cards[position - 1];
  if (previousCard) {
    const prevIndex = sequence.indexOf(previousCard.value);
    if (cardIndex <= prevIndex) return false;
  }

  return card.suit === column.cards[0]?.suit;
}

export function handleCardPlacement(
  cards: Card[],
  column: ColumnState,
  player: Player
): { updatedColumn: ColumnState; updatedPlayer: Player } {
  let updatedColumn = { ...column };

  // Activation avec As + 7/JOKER
  if (!column.hasLuckyCard && cards.length === 2) {
    const asCard = cards.find(c => c.value === 'As')!;
    const activator = cards.find(c => c.value === '7' || c.type === 'joker')!;

    updatedColumn = {
      ...updatedColumn,
      hasLuckyCard: true,
      activatorType: activator.type === 'joker' ? 'JOKER' : '7',
      activatorColor: getCardColor(activator),
      activatorSuit: activator.suit,
      luckyCard: activator,
      cards: [asCard, ...updatedColumn.cards.slice(1)]
    };
  }
  // Placement normal
  else if (cards.length === 1) {
    const [card] = cards;
    const position = getCardPosition(card);
    if (position !== -1) {
      updatedColumn.cards[position] = card;
    }
  }

  // Retirer les cartes jouées de la main/réserve du joueur
  const cardsToRemove = new Set(cards.map(c => c.id));
  const updatedPlayer = {
    ...player,
    hand: player.hand.filter(c => !cardsToRemove.has(c.id)),
    reserve: player.reserve.filter(c => !cardsToRemove.has(c.id))
  };

  return { updatedColumn, updatedPlayer };
}

function getCardPosition(card: Card): number {
  const sequence = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  return sequence.indexOf(card.value);
}

export function getExpectedValue(position: number): string | null {
  const sequence = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  return sequence[position] || null;
}

export function distributeCards(hand: Card[], reserve: Card[]): { hand: Card[]; reserve: Card[] } {
  const totalCards = [...hand, ...reserve];
  const newHand = totalCards.slice(0, Math.min(MAX_HAND_SIZE, totalCards.length));
  const newReserve = totalCards.slice(MAX_HAND_SIZE, Math.min(MAX_HAND_SIZE + MAX_RESERVE_SIZE, totalCards.length));
  
  return {
    hand: newHand,
    reserve: newReserve
  };
}