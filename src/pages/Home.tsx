import GameBoard from "../components/GameBoard/GameBoard";
import Layout from "../components/Layout/Layout";
import WinDialog from "../components/WinDialog/WinDialog";

const Home = () => {
  return (
    <Layout>
      <GameBoard />
      <WinDialog />
    </Layout>
  );
};

export default Home;
