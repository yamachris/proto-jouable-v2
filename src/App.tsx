import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { SetupPhase } from './components/SetupPhase';
import { PlayerArea } from './components/PlayerArea';
import { DeckArea } from './components/DeckArea';
import { GameOver } from './components/GameOver';
import { TimeoutWarning } from './components/TimeoutWarning';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';

export default function App() {
  const { phase, initializeGame, isGameOver } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ThemeToggle />
        <LanguageSelector />
        <GameOver reason="surrender" onRestart={initializeGame} />
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ThemeToggle />
        <LanguageSelector />
        <SetupPhase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      <LanguageSelector />
      
      <div className="pb-[calc(144px+80px)] container mx-auto px-4 py-4">
        <Header />
        
        <main className="mt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <aside className="md:w-40 flex-shrink-0">
              <DeckArea />
            </aside>
            
            <div className="flex-1">
              <GameBoard />
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0">
        <PlayerArea />
        <GameControls />
      </div>

      <TimeoutWarning />
    </div>
  );
}