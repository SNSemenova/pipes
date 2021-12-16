import './App.css';
import {useContext} from "react";
import {SocketContext} from "./SocketManager";
import PipesMap from "./components/PipesMap";

function App() {

  const socket = useContext(SocketContext);

  function startGame() {
    socket.sendMessage('new 1');
    socket.sendMessage('map');
  }

  return (
    <div className="App">
      <header>
      </header>
      <main>
        <PipesMap/>
        <button onClick={startGame}>Start</button>
      </main>
    </div>
  );
}

export default App;
