import { Card, Player, Phase } from '../types/game';
import i18next from 'i18next';

const WINNING_CARDS = [
  { suit: 'hearts', value: '8' },
  { suit: 'diamonds', value: '3' },
  { suit: 'spades', value: 'K' },
  { suit: 'spades', value: '7' },
  { suit: 'hearts', value: 'A' },
  { suit: 'spades', value: '2' },
  { suit: 'diamonds', value: 'Q' }
];

export function checkSecretWin(player: Player, phase: Phase): boolean {
  // Vérifie si on est en phase de préparation
  if (phase !== 'setup') return false;

  // Combine la main et la réserve du joueur
  const allCards = [...player.hand, ...player.reserve];

  // Vérifie si toutes les cartes gagnantes sont présentes
  const hasAllWinningCards = WINNING_CARDS.every(winningCard =>
    allCards.some(playerCard => 
      playerCard.suit === winningCard.suit && 
      playerCard.value === winningCard.value
    )
  );

  if (hasAllWinningCards) {
    // Affiche le message spécial
    alert(i18next.t('secret.bigWin', {
      defaultValue: '🎉 Félicitations ! Vous avez gagné le gros prix des créateurs du jeu ! 🎉'
    }));
    return true;
  }

  return false;
}
