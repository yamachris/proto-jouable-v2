import { AIPlayer } from './AIPlayer';
import { GameState } from '../store/gameStore';

export class AIGameManager {
  private ai1: AIPlayer;
  private ai2: AIPlayer;
  private gameHistory: any[] = [];

  constructor(private gameState: GameState) {
    this.ai1 = new AIPlayer(gameState);
    this.ai2 = new AIPlayer(gameState);
  }

  startAIGame() {
    // Initialiser la partie
    this.gameState.initializeGame();
    this.runAITurn();
  }

  private runAITurn() {
    const currentAI = this.gameState.currentPlayer.id === 'ai1' ? this.ai1 : this.ai2;
    const decision = currentAI.makeDecision();

    if (decision) {
      this.executeDecision(decision);
      this.recordGameState();
    }

    // Vérifier la fin de partie
    if (this.isGameOver()) {
      this.endGame();
      return;
    }

    // Programmer le prochain tour
    setTimeout(() => this.runAITurn(), 1000);
  }

  private executeDecision(decision: any) {
    switch (decision.action) {
      case 'discard':
        this.gameState.handleDiscard(decision.card);
        break;
      case 'play':
        if (decision.target) {
          this.gameState.handleCardPlace(
            decision.target.suit,
            decision.target.position || 0
          );
        }
        break;
    }
  }

  private recordGameState() {
    this.gameHistory.push({
      timestamp: Date.now(),
      state: { ...this.gameState },
      currentPlayer: this.gameState.currentPlayer.id
    });
  }

  private isGameOver(): boolean {
    return this.gameState.isGameOver || 
           this.gameState.currentPlayer.health <= 0;
  }

  private endGame() {
    // Sauvegarder les données de la partie pour l'apprentissage
    console.log('Game Over - Saving game data for AI learning');
    console.log('Game History:', this.gameHistory);
  }
}