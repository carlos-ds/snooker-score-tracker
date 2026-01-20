import { useState, useEffect } from "react";
import type { Player } from "@/types";

import './CoinTossModal.css'

interface CoinTossModalProps {
  isOpen: boolean;
  playerOne: Player;
  playerTwo: Player;
  onChooseFirstPlayer: (playerId: number) => void;
}

function CoinTossModal({
  isOpen,
  playerOne,
  playerTwo,
  onChooseFirstPlayer,
}: CoinTossModalProps) {
  const [tossWinner, setTossWinner] = useState<Player | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (isOpen && !tossWinner) {
      // Simulate coin flip animation delay
      setIsFlipping(true);
      const timer = setTimeout(() => {
        // Randomly select winner
        const winner = Math.random() < 0.5 ? playerOne : playerTwo;
        setTossWinner(winner);
        setIsFlipping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, tossWinner, playerOne, playerTwo]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTossWinner(null);
      setIsFlipping(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChoice = (playerId: number) => {
    onChooseFirstPlayer(playerId);
  };

  return (
    <div className="coin-toss-modal">
      <h2 className="coin-toss-modal__title">Respotted Black <span className="coin-toss-modal__title--subtitle">Coin Toss</span></h2>

      {isFlipping ? (
        <p>Flipping coin...</p>
      ) : tossWinner ? (
        <>
          <div className="coin-toss-modal__winner">
            <p>{tossWinner.name} won!</p>
          </div>

          <div className="coin-toss-modal__choice">
            <p>{tossWinner.name} selects who starts.</p>
            <div className="coin-toss-modal__buttons">
              <button onClick={() => handleChoice(tossWinner.id!)}>
                {tossWinner.name}
              </button>
              <button
                onClick={() =>
                  handleChoice(
                    tossWinner.id === playerOne.id
                      ? playerTwo.id!
                      : playerOne.id!
                  )
                }
              >
                {tossWinner.id === playerOne.id ? playerTwo.name : playerOne.name}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default CoinTossModal;
