// Importation des dépendances nécessaires
import { create } from 'zustand'; // Zustand est utilisé pour la gestion d'état
import { Card, Player, Phase, Suit, ColumnState } from '../types/game';
import { createDeck, drawCards, shuffleDeck } from '../utils/deck';
import { handleCardPlacement, handleJokerAction as handleJokerEffect, distributeCards } from '../utils/gameLogic';

// Interface définissant la structure de l'état du jeu
interface GameState {
  currentPlayer: Player;      // Joueur actuel
  deck: Card[];              // Paquet de cartes
  phase: Phase;              // Phase actuelle du jeu
  turn: number;              // Numéro du tour
  selectedCards: Card[];     // Cartes sélectionnées
  columns: Record<Suit, ColumnState>;  // État des colonnes par couleur
  hasDiscarded: boolean;     // Indique si le joueur a défaussé
  hasDrawn: boolean;         // Indique si le joueur a pioché
  hasPlayedAction: boolean;  // Indique si le joueur a joué une action
  isGameOver: boolean;       // Indique si la partie est terminée
  playedCardsLastTurn: number; // Nombre de cartes jouées au dernier tour
}

interface GameStore {
  currentPlayer: Player;
  updateProfile: (profile: { name: string; epithet: string; avatar?: string }) => void;
  // ... autres propriétés
}

// Création du store avec Zustand
export const useGameStore = create<GameState & GameStore>((set, get) => ({
// État initial du jeu
  currentPlayer: {
    // Configuration initiale du joueur
    id: 'player-1',
    name: 'Joueur 1',
    health: 10,
    maxHealth: 10,
    hand: [],
    reserve: [],
    discardPile: [],
    profile: {
      epithet: 'Maître des Cartes'
    }
  },
  // ... autres états initiaux ...

  // Méthodes principales du jeu :

  deck: [],
  phase: 'setup',
  turn: 1,
  selectedCards: [],
  columns: {
    hearts: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [] },
    diamonds: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [] },
    clubs: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [] },
    spades: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [] }
  },
  hasDiscarded: false,
  hasDrawn: false,
  hasPlayedAction: false,
  isGameOver: false,
  playedCardsLastTurn: 0,

  initializeGame: () => {
    // Initialise une nouvelle partie
    // Crée le deck, distribue les cartes initiales
    const initialDeck = createDeck();
    const jokers = initialDeck.filter(card => card.type === 'joker');
    const regularCards = initialDeck.filter(card => card.type !== 'joker');
    const [remainingDeck, drawnCards] = drawCards(regularCards, 5);
    
    const initialHand = [...jokers, ...drawnCards];
    
    set({
      currentPlayer: {
        id: 'player-1',
        name: 'Joueur 1',
        health: 10,
        maxHealth: 10,
        hand: initialHand,
        reserve: [],
        discardPile: [],
        profile: {
          epithet: 'Maître des Cartes'
        }
      },
      deck: remainingDeck,
      phase: 'setup',
      turn: 1,
      selectedCards: [],
      columns: {
        hearts: { cards: [], isLocked: false, hasLuckyCard: false },
        diamonds: { cards: [], isLocked: false, hasLuckyCard: false },
        clubs: { cards: [], isLocked: false, hasLuckyCard: false },
        spades: { cards: [], isLocked: false, hasLuckyCard: false }
      },
      hasDiscarded: false,
      hasDrawn: false,
      hasPlayedAction: false,
      isGameOver: false,
      playedCardsLastTurn: 0
    });
  },

  selectCard: (card: Card) => {
    set((state) => {
      // Si une action a déjà été jouée, on ne peut plus sélectionner de cartes
      if (state.hasPlayedAction) {
        return state;
      }

      if (!get().canSelectCard(card)) {
        return state;
      }

      const isCardSelected = state.selectedCards.some(c => c.id === card.id);
      
      if (isCardSelected) {
        return {
          selectedCards: state.selectedCards.filter(c => c.id !== card.id)
        };
      }
      
      // Limite de 2 cartes maximum
      if (state.selectedCards.length >= 2) {
        return state;
      }
      
      return {
        selectedCards: [...state.selectedCards, card]
      };
    });
  },

  handleCardPlace: (suit: Suit, position: number) => {
    set((state) => {
      if (state.hasPlayedAction || state.selectedCards.length === 0) {
        return state;
      }

      const allAvailableCards = [
        ...state.currentPlayer.hand,
        ...state.currentPlayer.reserve
      ];

      const areCardsAvailable = state.selectedCards.every(card =>
        allAvailableCards.some(c => c.id === card.id)
      );

      if (!areCardsAvailable) {
        return state;
      }

      const { updatedColumn, updatedPlayer } = handleCardPlacement(
        state.selectedCards,
        state.columns[suit],
        state.currentPlayer
      );

      const updatedHand = updatedPlayer.hand.filter(
        card => !state.selectedCards.some(sc => sc.id === card.id)
      );
      const updatedReserve = updatedPlayer.reserve.filter(
        card => !state.selectedCards.some(sc => sc.id === card.id)
      );

      return {
        columns: {
          ...state.columns,
          [suit]: updatedColumn
        },
        currentPlayer: {
          ...updatedPlayer,
          hand: updatedHand,
          reserve: updatedReserve
        },
        selectedCards: [],
        hasPlayedAction: true,
        playedCardsLastTurn: state.selectedCards.length,
        phase: 'action'
      };
    });
  },

  handleJokerAction: (jokerCard: Card, action: 'heal' | 'attack') => {
    set((state) => {
      if (jokerCard.type !== 'joker' || state.hasPlayedAction || state.phase !== 'action') {
        return state;
      }

      let updatedPlayer = { ...state.currentPlayer };

      if (action === 'heal') {
        const newMaxHealth = updatedPlayer.maxHealth + 3;
        updatedPlayer.maxHealth = newMaxHealth;
        updatedPlayer.health = newMaxHealth;
      }

      updatedPlayer.hand = updatedPlayer.hand.filter(c => c.id !== jokerCard.id);
      updatedPlayer.reserve = updatedPlayer.reserve.filter(c => c.id !== jokerCard.id);
      updatedPlayer.discardPile = [...updatedPlayer.discardPile, jokerCard];

      return {
        currentPlayer: updatedPlayer,
        hasPlayedAction: true,
        selectedCards: [],
        playedCardsLastTurn: 1,
        phase: 'action'
      };
    });
  },

  handleDrawCard: () => {
    console.log("handleDrawCard appelé");
    set((state) => {
      const totalCards = state.currentPlayer.hand.length + state.currentPlayer.reserve.length;
      const maxCards = 7; // 5 en main + 2 en réserve
      
      // Nombre de cartes à piocher basé sur le tour précédent
      let cardsToDrawCount;
      if (state.playedCardsLastTurn > 0) {
        // Si des cartes ont été jouées, on pioche le même nombre
        cardsToDrawCount = Math.min(
          state.playedCardsLastTurn,
          maxCards - totalCards
        );
      } else {
        // Sinon, on pioche une seule carte
        cardsToDrawCount = Math.min(1, maxCards - totalCards);
      }

      if (cardsToDrawCount <= 0) {
        return {
          ...state,
          hasDrawn: true,
          phase: 'action'
        };
      }

      // Pioche des cartes
      const [newDeck, drawnCards] = drawCards(state.deck, cardsToDrawCount);
      
      // Distribution optimisée des cartes entre main et réserve
      const { hand, reserve } = distributeCards(
        [...state.currentPlayer.hand, ...drawnCards],
        state.currentPlayer.reserve,
        5, // max en main
        2  // max en réserve
      );

      return {
        deck: newDeck,
        currentPlayer: {
          ...state.currentPlayer,
          hand,
          reserve
        },
        hasDrawn: true,
        phase: 'action'
      };
    });
  },

  handlePassTurn: () => {
    set((state) => {
      const totalCards = state.currentPlayer.hand.length + state.currentPlayer.reserve.length;
      
      // On passe à la phase de pioche uniquement si on a joué des cartes ET qu'on a moins de 7 cartes
      const nextPhase = (state.playedCardsLastTurn > 0 && totalCards < 7) ? 'draw' : 'discard';
      
      return {
        turn: state.turn + 1,
        hasDiscarded: nextPhase === 'draw',
        hasDrawn: false,
        hasPlayedAction: false,
        selectedCards: [],
        phase: nextPhase,
        playedCardsLastTurn: 0  // Réinitialiser le compteur
      };
    });
  },
  // Méthodes de gestion des cartes :

  handleSkipAction: () => {
    // Gère le passage de la phase d'action
    set({ hasPlayedAction: true });
    get().updatePhaseAndMessage('action');
  },

  handleSurrender: () => {
    // Gère le retrait du joueur de la partie
    set({ isGameOver: true });
  },

  moveToReserve: (card) => {
    // Gère le déplacement d'une carte vers la réserve
    set((state) => {
      if (state.currentPlayer.reserve.length >= 2) return state;

      return {
        currentPlayer: {
          ...state.currentPlayer,
          hand: state.currentPlayer.hand.filter(c => c.id !== card.id),
          reserve: [...state.currentPlayer.reserve, card]
        }
      };
    });
  },

  moveToHand: (card) => {
    // Gère le déplacement d'une carte vers la main
    set((state) => {
      if (state.currentPlayer.hand.length >= 5) return state;

      return {
        currentPlayer: {
          ...state.currentPlayer,
          reserve: state.currentPlayer.reserve.filter(c => c.id !== card.id),
          hand: [...state.currentPlayer.hand, card]
        }
      };
    });
  },

  startGame: () => {
    // Gère le début de la partie
    set((state) => {
      if (state.currentPlayer.reserve.length !== 2) return state;
      return {
        phase: 'discard'
      };
    });
    get().updatePhaseAndMessage('discard');
  },

  handleDiscard: (card) => {
    // Gère la défausse d'une carte
    console.log("handleDiscard appelé");
    set((state) => {
      const isFromHand = state.currentPlayer.hand.some(c => c.id === card.id);
      const isFromReserve = state.currentPlayer.reserve.some(c => c.id === card.id);

      return {
        currentPlayer: {
          ...state.currentPlayer,
          hand: isFromHand ? state.currentPlayer.hand.filter(c => c.id !== card.id) : state.currentPlayer.hand,
          reserve: isFromReserve ? state.currentPlayer.reserve.filter(c => c.id !== card.id) : state.currentPlayer.reserve,
          discardPile: [...state.currentPlayer.discardPile, card]
        },
        hasDiscarded: true,
        selectedCards: []
      };
    });
    get().updatePhaseAndMessage('draw');
  },

  recycleDiscardPile: () => {
    // Récupère les cartes de la défausse pour remplir le deck
    set((state) => {
      if (state.deck.length > 0 || state.currentPlayer.discardPile.length === 0) return state;

      const newDeck = shuffleDeck([...state.currentPlayer.discardPile]);
      
      return {
        deck: newDeck,
        currentPlayer: {
          ...state.currentPlayer,
          discardPile: []
        }
      };
    });
  },

  exchangeCards: (handCard: Card, reserveCard: Card) => {
    // Échange des cartes entre la main et la réserve
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        hand: [
          ...state.currentPlayer.hand.filter(c => c.id !== handCard.id),
          reserveCard
        ],
        reserve: [
          ...state.currentPlayer.reserve.filter(c => c.id !== reserveCard.id),
          handCard
        ]
      }
    }));
  },
  // Méthodes utilitaires :

  updateProfile: (profile) => {
    // Met à jour le profil du joueur
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        name: profile.name,
        profile: {
          ...state.currentPlayer.profile,
          epithet: profile.epithet,
          avatar: profile.avatar
        }
      }
    }));
  },

  updatePhaseAndMessage: (phase: Phase) => {
    set((state) => {
      const messages = {
        setup: '🎮 Phase de préparation : Choisissez vos 2 cartes de réserve',
        discard: '♻️ Phase de défausse : Vous devez défausser une carte',
        draw: '🎴 Phase de pioche : Piochez pour compléter votre main',
        action: '⚔️ Phase d\'action : Jouez vos cartes ou passez votre tour'
      };

      return {
        phase,
        message: messages[phase] || state.message
      };
    });
  },

  debugGiveJokers: () => {
    // Fonction de debug pour ajouter des jokers à la main
    set((state) => {
      const redJoker: Card = {
        id: 'joker-red',
        type: 'joker',
        value: 'JOKER',
        suit: 'special',
        color: 'red',
        isRedJoker: true
      };
      
      const blackJoker = {
        id: 'joker-black',
        type: 'joker',
        value: 'JOKER',
        suit: 'special',
        color: 'black',
        isRedJoker: false
      };

      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          hand: [...state.currentPlayer.hand, redJoker, blackJoker]
        }
      };
    });
  },

  // Fonction utilitaire pour vérifier si une carte peut être sélectionnée
  canSelectCard: (card: Card) => {
    // Une carte peut être sélectionnée si elle est dans la main OU dans la réserve
    const state = get();
    return state.currentPlayer.hand.some(c => c.id === card.id) ||
           state.currentPlayer.reserve.some(c => c.id === card.id);
  },

  // Fonction utilitaire pour vérifier si un Joker peut être joué
  canPlayJoker: (jokerCard: Card) => {
    const state = get();
    return (
      jokerCard.type === 'joker' && 
      state.phase === 'action' &&
      !state.hasPlayedAction && // Vérifie qu'aucune action n'a été jouée ce tour
      (state.currentPlayer.hand.some(c => c.id === jokerCard.id) ||
       state.currentPlayer.reserve.some(c => c.id === jokerCard.id))
    );
  },

  // Ajout d'une nouvelle fonction pour vérifier si des actions sont encore possibles
  canPerformActions: () => {
    const state = get();
    // Si un Joker a été joué, aucune autre action n'est possible
    if (state.phase === 'endTurn') {
      return false;
    }
    return true;
  },

  // Fonction utilitaire pour vérifier si des cartes peuvent être jouées
  canPlayCards: () => {
    const state = get();
    return (
      state.phase === 'action' &&
      !state.hasPlayedAction // Vérifie qu'aucune action n'a été jouée ce tour
    );
  }
}));

// Expose le store pour le debugging
window.store = useGameStore.getState();
store.debugGiveJokers();

export function getPhaseMessage(
  phase: Phase, 
  hasDiscarded: boolean, 
  hasDrawn: boolean, 
  hasPlayedAction: boolean,
  playedCardsLastTurn: number
): string {
  switch (phase) {
    case 'discard':
      if (playedCardsLastTurn > 0) {
        return '';
      }
      return hasDiscarded ? '' : "Défaussez une carte pour continuer";
      
    case 'draw':
      return hasDrawn ? '' : "Sélectionnez une destination pour piocher";
      return "Piochez une carte pour compléter votre main";
    case 'action':
      if (hasPlayedAction) {
        return "Vous pouvez terminer votre tour";
      }
      return "Phase d'action - Jouez vos cartes ou passez";
      
    default:
      return '';
  }
}