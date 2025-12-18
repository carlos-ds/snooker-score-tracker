import AddPlayer from "@/components/AddPlayer";
import GameControls from "@/components/GameControls";
import FrameContainer from "@/components/FrameContainer";

function Home() {
  return (
    <>
      <AddPlayer />
      <GameControls />
      <FrameContainer />
    </>
  );
}

export default Home;