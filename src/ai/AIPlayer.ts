import { Card, Player, Phase, Suit, ColumnState } from '../types/game';
import { GameState } from '../store/gameStore';

interface AIDecision {
  action: 'discard' | 'play' | 'reserve';
  card: Card;
  target?: {
    suit?: Suit;
    position?: number;
  };
}

export class AIPlayer {
  private readonly rewardWeights = {
    playLuckySeven: 100,
    completeSequence: 200,
    damageOpponent: 150,
    useSpecialCard: 80,
    timeoutPenalty: -50,
    inefficientPlay: -30
  };

  constructor(private gameState: GameState) {}

  evaluateMove(card: Card, column: ColumnState): number {
    let score = 0;

    // Évaluer le placement d'un 7 de chance
    if (card.value === '7' && !column.hasLuckyCard) {
      score += this.rewardWeights.playLuckySeven;
    }

    // Évaluer les cartes spéciales
    if (['A', 'J', 'Q', 'K'].includes(card.value) && column.hasLuckyCard) {
      score += this.rewardWeights.useSpecialCard;
    }

    // Bonus pour compléter une séquence
    if (this.wouldCompleteSequence(column, card)) {
      score += this.rewardWeights.completeSequence;
    }

    return score;
  }

  private wouldCompleteSequence(column: ColumnState, card: Card): boolean {
    const cards = [...column.cards];
    const position = this.findValidPosition(cards, card);
    if (position === -1) return false;
    
    cards[position] = card;
    return cards.length === 10 && !cards.includes(undefined);
  }

  private findValidPosition(cards: Card[], card: Card): number {
    const valueOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return valueOrder.indexOf(card.value);
  }

  makeDecision(): AIDecision | null {
    const { currentPlayer, phase, columns } = this.gameState;
    
    switch (phase) {
      case 'discard':
        return this.decideDiscard(currentPlayer);
      case 'action':
        return this.decideAction(currentPlayer, columns);
      default:
        return null;
    }
  }

  private decideDiscard(player: Player): AIDecision | null {
    if (player.hand.length === 0) return null;

    // Trouver la carte la moins utile à défausser
    const cardScores = player.hand.map(card => ({
      card,
      score: this.evaluateCardValue(card)
    }));

    const worstCard = cardScores.reduce((prev, curr) => 
      prev.score < curr.score ? prev : curr
    );

    return {
      action: 'discard',
      card: worstCard.card
    };
  }

  private decideAction(player: Player, columns: Record<Suit, ColumnState>): AIDecision | null {
    let bestMove: AIDecision | null = null;
    let bestScore = -Infinity;

    // Évaluer chaque carte possible
    const playableCards = [...player.hand, ...player.reserve];
    
    for (const card of playableCards) {
      for (const suit of Object.keys(columns) as Suit[]) {
        const column = columns[suit];
        const score = this.evaluateMove(card, column);
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = {
            action: 'play',
            card,
            target: { suit }
          };
        }
      }
    }

    return bestMove;
  }

  private evaluateCardValue(card: Card): number {
    let value = 0;

    // Les 7 sont très précieux
    if (card.value === '7') {
      value += 100;
    }

    // Les cartes spéciales sont importantes
    if (['A', 'J', 'Q', 'K'].includes(card.value)) {
      value += 80;
    }

    // Les cartes numériques ont une valeur basée sur leur position
    if (!isNaN(Number(card.value))) {
      value += Number(card.value) * 5;
    }

    return value;
  }
}