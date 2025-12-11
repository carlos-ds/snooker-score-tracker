import AddPlayer from "@/components/AddPlayer";
import Header from "@/components/Header/Header";

const Players = () => {
  return (
    <>
      <Header pageType="text" pageTitle="PLAYERS" />
      <main>
        <AddPlayer />
      </main>
    </>
  )
}

export default Players;