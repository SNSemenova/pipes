import "./App.css";
import GameBoard from "./components/GameBoard/GameBoard";
import WinDialog from "./components/WinDialog/WinDialog";

function App() {
  return (
    <div className="App">
      <GameBoard />
      <WinDialog />
    </div>
  );
}

export default App;
