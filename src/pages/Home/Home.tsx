import AddPlayer from "@/components/AddPlayer/AddPlayer";
import GameMenu from "@/components/GameMenu/GameMenu";
import FrameContainer from "@/components/FrameContainer/FrameContainer";

function Home() {
  return (
    <>
      <GameMenu />
      <AddPlayer />
      <FrameContainer />
    </>
  );
}

export default Home;