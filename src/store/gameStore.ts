// Importation des dépendances nécessaires
import { create } from 'zustand'; // Zustand est utilisé pour la gestion d'état
import { Card, Player, Phase, Suit, ColumnState } from '../types/game';
import { createDeck, drawCards, shuffleDeck } from '../utils/deck';
import { handleCardPlacement, handleJokerAction as handleJokerEffect, distributeCards } from '../utils/gameLogic';
import i18next from 'i18next';  // Importez i18next directement
import i18n from '../i18n/config';
import { createColumnActions } from './slices/columnActions';

// Au début du fichier, après les autres imports
const t = (key: string) => i18next.t(key);

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
  attackMode: boolean;
  message: string;
  hasUsedFirstStrategicShuffle: boolean;
  awaitingStrategicShuffleConfirmation: boolean;
  language: string;
  winner: string | null;
  canEndTurn: boolean;
  queenChallenge: {
    isActive: boolean;
    queen: Card | null;
  };
  isMessageClickable: boolean;
}

// Ajout du type pour le store complet
export interface GameStore extends GameState {
  selectCard: (card: CardType) => void;
  handleDiscard: (card: CardType) => void;
  handleDrawCard: () => void;
  exchangeCards: (card1: CardType, card2: CardType) => void;
  handleJokerAction: (joker: CardType, action: 'heal' | 'attack') => void;
  setAttackMode: (mode: boolean) => void;
  setMessage: (message: string) => void;
  handleStrategicShuffle: () => void;
  endTurn: () => void;
  setPhase: (phase: Phase) => void;
  canUseStrategicShuffle: () => boolean;
  confirmStrategicShuffle: () => void;
  getState: () => GameStore;
  handleCardPlace: (suit: Suit, position: number) => void;
  handleQueenChallenge: (isCorrect: boolean) => void;
}

// Création du store avec Zustand
export const useGameStore = create<GameStore>((set, get) => ({
// État initial du jeu
  currentPlayer: {
    id: 'player-1',
    name: 'Joueur 1',
    health: 10,
    maxHealth: 10,
    hand: [],
    reserve: [],
    discardPile: [],
    deck: [],
    hasUsedStrategicShuffle: false,
    profile: {
      epithet: 'Maître des Cartes'
    }
  },
  deck: [],
  phase: 'setup' as Phase,
  turn: 1,
  selectedCards: [],
  columns: {
    hearts: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null },
    diamonds: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null },
    clubs: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null },
    spades: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null }
  },
  hasDiscarded: false,
  hasDrawn: false,
  hasPlayedAction: false,
  playedCardsLastTurn: 0,
  attackMode: false,
  message: '',
  isGameOver: false,
  winner: null as string | null,
  canEndTurn: true,
  language: i18n.language || 'fr',
  queenChallenge: {
    isActive: false,
    queen: null
  },
  isMessageClickable: false,

  initializeGame: () => {
    // Création et mélange du deck complet
    const fullDeck = shuffleDeck(createDeck());
    
    // Distribution aléatoire de 7 cartes
    const [remainingDeck, initialHand] = drawCards(fullDeck, 7);

    set({
      currentPlayer: {
        id: 'player-1',
        name: 'Joueur 1',
        health: 10,
        maxHealth: 10,
        hand: initialHand,
        reserve: [],
        discardPile: [],
        deck: remainingDeck,
        hasUsedStrategicShuffle: false,
        profile: {
          epithet: 'Maître des Cartes'
        }
      },
      deck: remainingDeck,
      phase: 'setup',
      turn: 1,
      selectedCards: [],
      columns: {
        hearts: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null },
        diamonds: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null },
        clubs: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null },
        spades: { cards: [], isLocked: false, hasLuckyCard: false, activatorType: null, sequence: [], reserveSuit: null }
      },
      hasDiscarded: false,
      hasDrawn: false,
      hasPlayedAction: false,
      playedCardsLastTurn: 0,
      attackMode: false,
      message: '',
      isGameOver: false,
      winner: null,
      canEndTurn: true,
      hasUsedFirstStrategicShuffle: false,
      awaitingStrategicShuffleConfirmation: false
    });
  },

  selectCard: (card: Card) => {
    set((state) => {
      // Si une action a déjà été jouée, on ne peut plus sélectionner de cartes
      if (state.hasPlayedAction) return state;

      const isCardSelected = state.selectedCards.some(c => c.id === card.id);
      
      // Si la carte est déjà sélectionnée, on la désélectionne
      if (isCardSelected) {
        return {
          ...state,
          selectedCards: state.selectedCards.filter(c => c.id !== card.id),
          message: ''
        };
      }

      // Si on a déjà 2 cartes sélectionnées, on ne peut pas en sélectionner plus
      if (state.selectedCards.length >= 2) {
        return state;
      }

      // Sélection de la carte
      const newSelectedCards = [...state.selectedCards, card];
      let message = '';

      // Messages selon la combinaison
      if (newSelectedCards.length === 1) {
        if (card.value === 'A') {
          message = 'Sélectionnez un Joker ou un 7 pour activer la colonne';
        } else if (card.type === 'joker' || card.value === '7') {
          message = 'Sélectionnez un As pour activer une colonne';
        }
      } else if (newSelectedCards.length === 2) {
        const [card1, card2] = newSelectedCards;
        const hasAs = card1.value === 'A' || card2.value === 'A';
        const hasActivator = (card1.type === 'joker' || card1.value === '7') || 
                            (card2.type === 'joker' || card2.value === '7');
        
        if (hasAs && hasActivator) {
          message = 'Cliquez sur une colonne pour l\'activer';
        }
      }

      return {
        ...state,
        selectedCards: newSelectedCards,
        message
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
        // Augmente les PV max et actuels de 3
        const newHealth = updatedPlayer.health + 3;
        updatedPlayer.maxHealth = newHealth;
        updatedPlayer.health = newHealth;
        
        // Déplace le Joker vers la défausse
        updatedPlayer.hand = updatedPlayer.hand.filter(c => c.id !== jokerCard.id);
        updatedPlayer.reserve = updatedPlayer.reserve.filter(c => c.id !== jokerCard.id);
        updatedPlayer.discardPile = [...updatedPlayer.discardPile, jokerCard];

        return {
          ...state,
          currentPlayer: updatedPlayer,
          hasPlayedAction: true,
          selectedCards: [],
          playedCardsLastTurn: 1,
          message: `🎭 Joker : PV augmentés à ${newHealth}/${newHealth}`,
          canEndTurn: true,
          phase: 'action'
        };
      } 
      else if (action === 'attack') {
        // Simule une attaque en mode solo
        updatedPlayer.hand = updatedPlayer.hand.filter(c => c.id !== jokerCard.id);
        updatedPlayer.reserve = updatedPlayer.reserve.filter(c => c.id !== jokerCard.id);
        updatedPlayer.discardPile = [...updatedPlayer.discardPile, jokerCard];

        return {
          ...state,
          currentPlayer: updatedPlayer,
          hasPlayedAction: true,
          selectedCards: [],
          playedCardsLastTurn: 1,
          message: "🗡️ Le Joker a détruit une carte adverse !",
          canEndTurn: true,
          phase: 'action'
        };
      }

      return state;
    });
  },

  handleDrawCard: () => {
    set((state) => {
      if (state.phase !== 'draw' || state.hasDrawn) return state;

      // Calculer combien de cartes manquent pour compléter la main et la réserve
      const currentHandCount = state.currentPlayer.hand.length;
      const currentReserveCount = state.currentPlayer.reserve.length;
      const maxHandCards = 5;
      const maxReserveCards = 2;

      // Calculer combien de cartes on peut ajouter
      const handSpace = Math.max(0, maxHandCards - currentHandCount);
      const reserveSpace = Math.max(0, maxReserveCards - currentReserveCount);
      const cardsNeeded = handSpace + reserveSpace;

      // Si on a déjà le maximum de cartes
      if (cardsNeeded <= 0) {
        return {
          ...state,
          phase: 'action',
          hasDrawn: true,
          message: t('game.messages.actionPhase')
        };
      }

      // Piocher les cartes nécessaires
      const [newDeck, drawnCards] = drawCards(state.deck, cardsNeeded);

      // Distribuer les cartes en priorité à la main
      const newHand = [...state.currentPlayer.hand];
      const newReserve = [...state.currentPlayer.reserve];

      drawnCards.forEach(card => {
        if (newHand.length < maxHandCards) {
          newHand.push(card);
        } else if (newReserve.length < maxReserveCards) {
          newReserve.push(card);
        }
      });

      return {
        ...state,
        deck: newDeck,
        currentPlayer: {
          ...state.currentPlayer,
          hand: newHand,
          reserve: newReserve
        },
        phase: 'action',
        hasDrawn: true,
        message: t('game.messages.actionPhase')
      };
    });
  },

  handlePassTurn: () => {
    set((state) => {
      // On ne peut passer le tour que si on est en phase d'action et qu'on a soit joué une action soit passé
      if (state.phase !== 'action' || !state.hasPlayedAction) {
        return state;
      }

      // Si on a joué des cartes au tour précédent, on passe directement à la phase de pioche
      if (state.playedCardsLastTurn > 0) {
        return {
          ...state,
          phase: 'draw', // On passe directement à la pioche
          hasDiscarded: true, // On marque la défausse comme déjà faite
          hasDrawn: false,
          hasPlayedAction: false,
          currentPlayer: {
            ...state.currentPlayer,
            hasUsedStrategicShuffle: false
          },
          selectedCards: [],
          turn: state.turn + 1,
          message: t('game.messages.drawPhase')
        };
      }

      // Si on n'a pas joué de cartes
      return {
        ...state,
        phase: 'discard',
        hasDiscarded: false,
        hasDrawn: false,
        hasPlayedAction: false,
        currentPlayer: {
          ...state.currentPlayer,
          hasUsedStrategicShuffle: false
        },
        selectedCards: [],
        turn: state.turn + 1,
        message: t('game.messages.discardPhase')
      };
    });
  },
  // Méthodes de gestion des cartes :

  handleSkipAction: () => {
    set((state) => {
      if (state.phase !== 'action' || state.hasPlayedAction) {
        return state;
      }

      return {
        ...state,
        hasPlayedAction: true,
        canEndTurn: true,
        playedCardsLastTurn: 0,
        message: "Action passée"
      };
    });
  },

  handleSurrender: () => {
    set((state) => ({
      ...state,
      isGameOver: true,
      winner: 'opponent',
      message: "Vous avez abandonné la partie"
    }));
  },

  moveToReserve: (card: Card) => {
    // Gère le déplacement d'une carte vers la réserve
    set((state) => {
      const updatedReserve = [...state.currentPlayer.reserve, card];
      return {
        currentPlayer: {
          ...state.currentPlayer,
          reserve: updatedReserve,
          hand: state.currentPlayer.hand.filter(c => c.id !== card.id)
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
    set((state) => {
      if (state.currentPlayer.reserve.length !== 2) return state;
      return {
        ...state,
        phase: 'discard',
        hasDiscarded: false,
        hasDrawn: false,
        hasPlayedAction: false,
        hasUsedFirstStrategicShuffle: false,
        message: t('game.messages.strategicShuffleFirst')
      };
    });
  },

  handleDiscard: (card: Card) => {
    set((state) => {
      // On vérifie d'abord si on a plus de 6 cartes
      const totalCards = state.currentPlayer.hand.length + state.currentPlayer.reserve.length;
      if (totalCards <= 6) {
        // Si on a 6 cartes ou moins, on passe directement à la phase de pioche
        return {
          ...state,
          phase: 'draw',
          hasDiscarded: false,
          message: t('game.messages.drawPhase')
        };
      }

      // Sinon, on procède à la défausse normalement
      if (state.phase !== 'discard' || state.hasDiscarded) {
        return state;
      }

      const isFromHand = state.currentPlayer.hand.some(c => c.id === card.id);
      const isFromReserve = state.currentPlayer.reserve.some(c => c.id === card.id);
      
      const newHand = isFromHand 
        ? state.currentPlayer.hand.filter(c => c.id !== card.id)
        : [...state.currentPlayer.hand];
        
      const newReserve = isFromReserve
        ? state.currentPlayer.reserve.filter(c => c.id !== card.id)
        : [...state.currentPlayer.reserve];
      
      const newDiscardPile = [...state.currentPlayer.discardPile, card];

      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          hand: newHand,
          reserve: newReserve,
          discardPile: newDiscardPile
        },
        hasDiscarded: true,
        selectedCards: [],
        phase: 'draw',
        message: t('game.messages.drawPhase')
      };
    });
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

  exchangeCards: (card1: Card, card2: Card) => {
    set((state) => {
      const hand = [...state.currentPlayer.hand];
      const reserve = [...state.currentPlayer.reserve];

      // Trouver les indices des cartes
      const handIndex = hand.findIndex(c => c.id === card1.id);
      const reserveIndex = reserve.findIndex(c => c.id === card2.id);

      // Si l'une des cartes n'est pas trouvée, annuler l'échange
      if (handIndex === -1 || reserveIndex === -1) {
        return state;
      }

      // Échanger les cartes
      const tempCard = hand[handIndex];
      hand[handIndex] = reserve[reserveIndex];
      reserve[reserveIndex] = tempCard;

      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          hand,
          reserve
        },
        message: t('game.messages.exchangeComplete')
      };
    });
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
        discard: state.turn === 1 
          ? ' Pour commencer la partie, veuillez défausser votre première carte'
          : '♻️ Phase de défausse : Vous devez défausser une carte',
        draw: '🎴 Phase de pioche : Piochez pour complter votre main',
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
      // Utilise les cartes de test prédéfinies
      const testHand = [
        // Jokers
        {
          id: 'joker-red',
          type: 'joker',
          value: 'JOKER',
          suit: 'special',
          color: 'red',
          isRedJoker: true
        },
        {
          id: 'joker-black',
          type: 'joker',
          value: 'JOKER',
          suit: 'special',
          color: 'black',
          isRedJoker: false
        },
        // As
        {
          id: 'ace-hearts',
          type: 'number',
          value: 'A',
          suit: 'hearts',
          color: 'red'
        },
        {
          id: 'ace-spades',
          type: 'number',
          value: 'A',
          suit: 'spades',
          color: 'black'
        },
        // Sept
        {
          id: 'seven-hearts',
          type: 'number',
          value: '7',
          suit: 'hearts',
          color: 'red'
        }
      ];

      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          hand: testHand
        }
      };
    });
  },

  // Fonction utilitaire pour vérifier si une carte peut être sélectionnée
  canSelectCard: (card: Card) => {
    // Une carte peut être sélectionnée si elle est dans la main OU dans la rserve
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
  },

  setAttackMode: (value: boolean) => set({ attackMode: value }),
  setMessage: (message: string) => set({ message: message }),

  endTurn: () => {
    set((state) => {
      // Calculer combien de cartes manquent pour avoir 7 cartes
      const totalCards = state.currentPlayer.hand.length + state.currentPlayer.reserve.length;
      const cardsNeeded = 7 - totalCards;

      // Si on a joué des cartes au tour précédent
      if (state.playedCardsLastTurn > 0) {
        // On passe directement à la phase de pioche pour compléter la main
        return {
          ...state,
          phase: 'draw',
          turn: state.turn + 1,
          hasDiscarded: true, // On skip la phase de défausse
          hasDrawn: false,
          hasPlayedAction: false,
          message: t('game.messages.drawPhase'),
          canEndTurn: false
        };
      }

      // Si on n'a pas joué de cartes, on doit défausser
      return {
        ...state,
        phase: 'discard',
        turn: state.turn + 1,
        hasDiscarded: false,
        hasDrawn: false,
        hasPlayedAction: false,
        message: t('game.messages.discardPhase'),
        canEndTurn: false
      };
    });
  },

  canUseStrategicShuffle: () => {
    const state = get();
    return (
      state.phase === 'discard' &&  // Uniquement en phase de défausse (début du tour)
      !state.hasDiscarded &&        // Pas encore défaussé
      !state.hasDrawn &&            // Pas encore pioché
      !state.hasPlayedAction &&     // Pas encore joué d'action
      !state.currentPlayer.hasUsedStrategicShuffle  // N'a pas encore utilisé le mélange ce tour-ci
    );
  },

  handleStrategicShuffle: () => {
    set((state) => {
      if (!state.canUseStrategicShuffle()) {
        return state;
      }

      const allDiscardedCards = [
        ...state.currentPlayer.hand,
        ...state.currentPlayer.discardPile
      ];
      const allCards = [...state.deck, ...allDiscardedCards];
      const newDeck = shuffleDeck(allCards);
      const [remainingDeck, newHand] = drawCards(newDeck, 5);

      if (!state.hasUsedFirstStrategicShuffle) {
        return {
          ...state,
          deck: remainingDeck,
          currentPlayer: {
            ...state.currentPlayer,
            hand: newHand,
            discardPile: [],
            hasUsedStrategicShuffle: true
          },
          hasUsedFirstStrategicShuffle: true,
          phase: 'action',
          hasDiscarded: true,
          hasDrawn: true,
          hasPlayedAction: false,
          message: t('game.messages.strategicShuffleFirst'),
          isMessageClickable: true
        };
      }

      // Si ce n'est pas le premier mélange stratégique
      return {
        ...state,
        deck: remainingDeck,
        currentPlayer: {
          ...state.currentPlayer,
          hand: newHand,
          discardPile: [],
          hasUsedStrategicShuffle: true
        },
        phase: 'action',
        hasDiscarded: true,
        hasDrawn: true,
        hasPlayedAction: true,
        canEndTurn: true,
        message: t('game.messages.strategicShuffleNext'),
        isMessageClickable: true
      };
    });
  },

  confirmStrategicShuffle: () => {
    set((state) => ({
      ...state,
      deck: shuffleDeck([...state.deck, ...state.currentPlayer.discardPile, ...state.currentPlayer.hand]),
      currentPlayer: {
        ...state.currentPlayer,
        hand: [],
        reserve: state.currentPlayer.reserve,
        discardPile: []
      },
      phase: 'discard',
      hasDiscarded: true,
      hasPlayedAction: true,
      awaitingStrategicShuffleConfirmation: false,
      message: t('game.messages.strategicShuffleNext')
    }));
  },

  setLanguage: (lang: string) => {
    set({ language: lang });
  },

  handleStrategicShuffleAction: () => {
    set((state) => {
      if (state.currentPlayer.hasUsedStrategicShuffle) {
        return state;
      }

      const allCards = [...state.deck, ...state.currentPlayer.discardPile];
      const newDeck = shuffleDeck(allCards);
      const [remainingDeck, newHand] = drawCards(newDeck, 5);

      return {
        ...state,
        deck: remainingDeck,
        currentPlayer: {
          ...state.currentPlayer,
          hand: newHand,
          discardPile: [],
          hasUsedStrategicShuffle: true
        },
        hasPlayedAction: true,
        message: t('game.messages.strategicShuffleFirst')
      };
    });
  },

  canEndTurn: () => {
    const state = get();
    return (
      state.phase === 'action' && // Doit être en phase d'action
      state.hasPlayedAction      // Doit avoir joué ou passé une action
    );
  },

  handleCardPlace: (suit: Suit, position: number) => {
    set((state) => {
      const column = state.columns[suit];
      
      // Cas d'activation avec As + Activateur
      if (state.selectedCards.length === 2) {
        const hasAs = state.selectedCards.some(card => card.value === 'A');
        const hasActivator = state.selectedCards.some(card => 
          card.type === 'joker' || card.value === '7'
        );
        
        if (hasAs && hasActivator && position === 0) {
          const ace = state.selectedCards.find(card => card.value === 'A');
          const activator = state.selectedCards.find(card => 
            card.type === 'joker' || card.value === '7'
          );
          
          if (ace?.suit === suit && (column.cards.length === 0 || !column.hasLuckyCard)) {
            // Retirer les cartes de la main/réserve
            const newHand = state.currentPlayer.hand.filter(
              card => !state.selectedCards.some(selected => selected.id === card.id)
            );
            const newReserve = state.currentPlayer.reserve.filter(
              card => !state.selectedCards.some(selected => selected.id === card.id)
            );

            return {
              ...state,
              columns: {
                ...state.columns,
                [suit]: {
                  ...column,
                  hasLuckyCard: true,
                  cards: [ace],
                  reserveSuit: activator?.type === 'joker' || activator?.value === '7' 
                    ? activator 
                    : null,
                  activatorType: activator?.type === 'joker' ? 'JOKER' : '7'
                }
              },
              currentPlayer: {
                ...state.currentPlayer,
                hand: newHand,
                reserve: newReserve
              },
              selectedCards: [],
              hasPlayedAction: true,
              playedCardsLastTurn: 2,
              message: t('game.messages.columnActivated')
            };
          }
        }
      }

      // Cas d'activation avec Tête + Activateur (même structure que l'As)
      if (state.selectedCards.length === 2) {
        const hasFaceCard = state.selectedCards.some(card => card.value === 'J' || card.value === 'K');
        const hasActivator = state.selectedCards.some(card => 
          card.type === 'joker' || card.value === '7'
        );
        
        if (hasFaceCard && hasActivator && position === 0) {
          const faceCard = state.selectedCards.find(card => card.value === 'J' || card.value === 'K');
          const activator = state.selectedCards.find(card => 
            card.type === 'joker' || card.value === '7'
          );
          
          if (faceCard?.suit === suit) {
            // Retirer les cartes de la main/réserve (exactement comme pour l'As)
            const newHand = state.currentPlayer.hand.filter(
              card => !state.selectedCards.some(selected => selected.id === card.id)
            );
            const newReserve = state.currentPlayer.reserve.filter(
              card => !state.selectedCards.some(selected => selected.id === card.id)
            );

            return {
              ...state,
              columns: {
                ...state.columns,
                [suit]: {
                  ...column,
                  faceCards: {
                    ...column.faceCards,
                    [faceCard.value]: faceCard
                  }
                }
              },
              currentPlayer: {
                ...state.currentPlayer,
                hand: newHand,
                reserve: newReserve,
                discardPile: [...state.currentPlayer.discardPile, activator]
              },
              selectedCards: [],
              hasPlayedAction: true,
              playedCardsLastTurn: 2,
              message: t('game.messages.faceCardPlaced', {
                value: faceCard.value === 'J' ? 'Valet' : 'Roi'
              })
            };
          }
        }
      }

      // Placement normal d'une carte
      if (state.selectedCards.length === 1) {
        const card = state.selectedCards[0];
        
        // Vérifier si c'est un 7 ou un Joker pour la reserveSuit
        const isActivator = card.type === 'joker' || card.value === '7';
        
        if (isActivator) {
          // Vérifier si la reserveSuit est déjà occupée
          if (column.reserveSuit !== null) {
            return {
              ...state,
              message: t('game.messages.reserveSuitOccupied')
            };
          }

          // Placement dans reserveSuit uniquement pour 7 et Joker
          const newHand = state.currentPlayer.hand.filter(c => c.id !== card.id);
          const newReserve = state.currentPlayer.reserve.filter(c => c.id !== card.id);

          return {
            ...state,
            columns: {
              ...state.columns,
              [suit]: {
                ...column,
                reserveSuit: card
              }
            },
            currentPlayer: {
              ...state.currentPlayer,
              hand: newHand,
              reserve: newReserve
            },
            selectedCards: [],
            hasPlayedAction: true,
            playedCardsLastTurn: 1,
            message: t('game.messages.cardPlaced')
          };
        }

        // Pour les cartes numériques (As à 10)
        if (card.suit !== suit || !column.hasLuckyCard) {
          return state;
        }

        // Vérifier si c'est une carte numérique (As à 10)
        const numericValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        if (!numericValues.includes(card.value)) {
          return state;
        }

        // Vérifier l'ordre chronologique
        const currentValue = card.value;
        const expectedValue = numericValues[column.cards.length];
        if (currentValue !== expectedValue) {
          return state;
        }

        // Placement normal dans la séquence
        const newHand = state.currentPlayer.hand.filter(c => c.id !== card.id);
        const newReserve = state.currentPlayer.reserve.filter(c => c.id !== card.id);

        return {
          ...state,
          columns: {
            ...state.columns,
            [suit]: {
              ...column,
              cards: [...column.cards, card]
            }
          },
          currentPlayer: {
            ...state.currentPlayer,
            hand: newHand,
            reserve: newReserve
          },
          selectedCards: [],
          hasPlayedAction: true,
          playedCardsLastTurn: 1,
          message: t('game.messages.cardPlaced')
        };
      }

      // Cas d'activation avec Dame + Activateur
      if (state.selectedCards.length === 2) {
        const hasQueen = state.selectedCards.some(card => card.value === 'Q');
        const hasActivator = state.selectedCards.some(card => 
          card.type === 'joker' || card.value === '7'
        );
        
        if (hasQueen && hasActivator) {
          const queen = state.selectedCards.find(card => card.value === 'Q');
          const activator = state.selectedCards.find(card => 
            card.type === 'joker' || card.value === '7'
          );
          
          // Retirer les cartes de la main/réserve
          const newHand = state.currentPlayer.hand.filter(
            card => !state.selectedCards.some(selected => selected.id === card.id)
          );
          const newReserve = state.currentPlayer.reserve.filter(
            card => !state.selectedCards.some(selected => selected.id === card.id)
          );

          // Calculer les points de vie à gagner
          const healAmount = activator?.type === 'joker' ? 4 : 2;
          const newMaxHealth = state.currentPlayer.maxHealth + healAmount;

          return {
            ...state,
            currentPlayer: {
              ...state.currentPlayer,
              hand: newHand,
              reserve: newReserve,
              health: newMaxHealth,
              maxHealth: newMaxHealth,
              discardPile: [...state.currentPlayer.discardPile, queen, activator]
            },
            selectedCards: [],
            hasPlayedAction: true,
            playedCardsLastTurn: 2,
            canEndTurn: true,
            message: t('game.messages.queenHealing', {
              amount: healAmount
            })
          };
        }
      }

      return state;
    });
  },

  handleQueenChallenge: (isCorrect: boolean) => {
    set((state) => {
      const healAmount = isCorrect ? 5 : 1;
      const newMaxHealth = state.currentPlayer.maxHealth + healAmount;

      const queen = state.selectedCards.find(card => card.value === 'Q');
      const joker = state.selectedCards.find(card => card.type === 'joker');

      if (!queen || !joker) return state;

      const newHand = state.currentPlayer.hand.filter(
        card => !state.selectedCards.some(selected => selected.id === card.id)
      );
      const newReserve = state.currentPlayer.reserve.filter(
        card => !state.selectedCards.some(selected => selected.id === card.id)
      );

      return {
        ...state,
        currentPlayer: {
          ...state.currentPlayer,
          hand: newHand,
          reserve: newReserve,
          health: newMaxHealth,
          maxHealth: newMaxHealth,
          discardPile: [...state.currentPlayer.discardPile, queen, joker]
        },
        selectedCards: [],
        queenChallenge: {
          isActive: false,
          queen: null
        },
        hasPlayedAction: true,
        playedCardsLastTurn: 2, // Pour passer directement à la pioche au tour suivant
        message: t('game.messages.queenChallengeResult', {
          amount: healAmount,
          result: isCorrect ? 'correct' : 'incorrect'
        }),
        canEndTurn: true
      };
    });
  },

  clearMessage: () => set(state => ({ ...state, message: '', isMessageClickable: false })),
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
      return hasDiscarded ? '' : t('phase.discard');
      
    case 'draw':
      return hasDrawn ? '' : t('phase.draw');
      
    case 'action':
      if (hasPlayedAction) {
        return t('actions.endTurn');
      }
      return t('phase.action');
      
    default:
      return '';
  }
}

