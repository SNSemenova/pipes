import "./App.css";
import GameBoard from "./components/GameBoard/GameBoard";
import WinDialog from "./components/WinDialog/WinDialog";
import Header from "./components/Header/Header";

function App() {
  return (
    <div className="App">
      <Header />
      <GameBoard />
      <WinDialog />
    </div>
  );
}

export default App;
