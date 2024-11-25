import { useGameStore } from './stores/gameStore';

const getMessage = (turnCount: number) => {
  // Si c'est le premier tour (turnCount === 1)
  if (turnCount === 1) {
    return "Pour commencer la partie veuillez vous défausser d'une carte";
  }
  
  // Message par défaut pour les autres tours
  return "Défaussez une carte pour continuer";
}
