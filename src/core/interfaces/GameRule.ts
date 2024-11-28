interface GameRule {
    execute(context: GameContext): void;
    validate(context: GameContext): boolean;
  }
  
  interface GameContext {
    gameState: GameState;
    players: Player[];
    currentPlayer: Player;
    // Autres propriétés pertinentes...
  }