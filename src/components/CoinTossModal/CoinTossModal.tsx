import { useState, useEffect } from "react";
import type { Player } from "@/types";

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
    <div>
      <div>
        <h2>Respotted Black Coin Toss</h2>

        {isFlipping ? (
          <p>Flipping coin...</p>
        ) : tossWinner ? (
          <>
            <p>{tossWinner.name} won!</p>
            <p>{tossWinner.name} selects who starts.</p>
            <div>
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
          </>
        ) : null}
      </div>
    </div>
  );
}

export default CoinTossModal;
