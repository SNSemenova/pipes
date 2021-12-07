import './App.css';
import {useContext} from "react";
import {SocketContext} from "./SocketManager.tsx";
import {Counter} from "./features/counter/Counter";

function App() {
  const socket = useContext(SocketContext);

  return (
    <div className="App">
      <header>
      </header>
      <main>
        {/*{ map ? map.map(line => <div>*/}
        {/*  { line.split('').map(segment => <button>{segment}</button>) }*/}
        {/*</div>) : typeof map }*/}
        <button onClick={() => socket.sendMessage(1, 'map')}>Start</button>
        <Counter/>
      </main>
    </div>
  );
}

export default App;
