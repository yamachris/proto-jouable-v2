// ... existing code ...
class GameManager {
    private ruleManager: RuleManager;
    
    constructor() {
      this.ruleManager = RuleManager.getInstance();
    }
  
    executeGameAction(action: GameAction): void {
      // Vérifier les règles avant d'exécuter l'action
      if (this.validateAction(action)) {
        // Exécuter les règles applicables
        this.ruleManager.executeRule(action.type, this.createGameContext());
        // Exécuter l'action
        this.processAction(action);
      }
    }
  
    private createGameContext(): GameContext {
      return {
        gameState: this.currentState,
        players: this.players,
        currentPlayer: this.currentPlayer,
      };
    }
  }
  // ... existing code ...