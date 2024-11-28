class RuleManager {
    private static instance: RuleManager;
    private rules: Map<string, GameRule> = new Map();
  
    private constructor() {}
  
    static getInstance(): RuleManager {
      if (!RuleManager.instance) {
        RuleManager.instance = new RuleManager();
      }
      return RuleManager.instance;
    }
  
    // Ajouter une nouvelle règle
    addRule(ruleName: string, rule: GameRule): void {
      this.rules.set(ruleName, rule);
    }
  
    // Vérifier si une règle est active
    isRuleActive(ruleName: string): boolean {
      return this.rules.has(ruleName);
    }
  
    // Exécuter une règle
    executeRule(ruleName: string, context: GameContext): void {
      const rule = this.rules.get(ruleName);
      if (rule) {
        rule.execute(context);
      }
    }
  }