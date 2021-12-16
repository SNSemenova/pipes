import './App.css';
import {useContext} from "react";
import {SocketContext} from "./SocketManager";
import PipesMap from "./components/PipesMap";
import {useSelector} from "react-redux";
import {RootState} from "./app/store";

function App() {
  const level = useSelector((state: RootState) => state.level.value)

  const socket = useContext(SocketContext);

  function startGame() {
    socket.sendMessage('start');
  }

  return (
    <div className="App">
      <header>
      </header>
      <main>
        <span>Level {level}</span>
        <PipesMap/>
        <button onClick={startGame}>Start</button>
      </main>
    </div>
  );
}

export default App;
