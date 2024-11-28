import io from 'socket.io-client';

// Get development token on startup
async function getDevToken() {
  const response = await fetch('/api/dev/token', {
    method: 'POST'
  });
  const { token } = await response.json();
  localStorage.setItem('gameToken', token);
  return token;
}

const socket = io('http://localhost:3000');

export const gameService = {
  // Initialize service
  init: async () => {
    if (!localStorage.getItem('gameToken')) {
      await getDevToken();
    }
  },

  // Connexion WebSocket
  connectToGame: (gameId: string, onGameUpdate: (data: any) => void) => {
    socket.emit('joinGame', { gameId });
    socket.on('gameUpdated', onGameUpdate);
  },

  // Envoi d'une action
  sendGameAction: async (action: any) => {
    socket.emit('gameAction', action);
  },

  // Sauvegarde de l'état du jeu
  saveGameState: async (gameState: any) => {
    const token = localStorage.getItem('gameToken');
    
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ gameState })
    });
    
    return response.json();
  },

  // Récupération d'une partie
  loadGame: async (gameId: string) => {
    const token = localStorage.getItem('gameToken');
    
    const response = await fetch(`/api/games/${gameId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.json();
  },

  // Déconnexion
  disconnect: () => {
    socket.disconnect();
  }
};

// Intercepteur d'erreurs
socket.on('error', (error) => {
  console.error('Erreur WebSocket:', error);
});