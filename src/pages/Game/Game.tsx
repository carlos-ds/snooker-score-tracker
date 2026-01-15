import FrameContainer from "@/components/FrameContainer";
import GameControls from "@/components/GameControls";

function Game() {
  return (
    <>
      <main>
        <FrameContainer />
        <div>
          <GameControls />
        </div>
      </main>
    </>
  )
}

export default Game