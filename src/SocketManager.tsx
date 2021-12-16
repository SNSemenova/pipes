import React, {createContext, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {update} from "./components/mapSlice";
import {increment} from "./components/levelSlice";
import {RootState} from "./app/store";

export const SocketContext = createContext({} as WS);

const SERVER_URL = 'wss://hometask.eg1236.com/game-pipes/';

type WS = {
  socket: WebSocket,
  sendMessage: (message: string) => void
}

export const SocketManager: React.FC<null> = ({children}) => {
  let socket: WebSocket;
  let ws: WS;

  const level = useSelector((state: RootState) => state.level.value)

  const dispatch = useDispatch()

  useEffect(() => {
    return () => {
      socket.removeEventListener('message', getMessage);
    }
  })

  function getMessage(event: MessageEvent) {
    let eventName = event.data.split(' ')[0];
    if (typeof eventName === 'string') {
      eventName = eventName.split('\n')[0];
    }
    switch (eventName) {
      case 'map:': {
        console.log(typeof event.data, event.data.split('\n').slice(1, -1));
        dispatch(update(event.data.split('\n').slice(1, -1)));
        return;
      }
      case 'verify:': {
        if (event.data.includes('Correct!')) {
          const password = event.data.split(' ').pop();
          console.log(`password: ${password}`);
          alert('You win');
          dispatch(increment());
          startNewLevel();
        }
        return;
      }
    }
  }

  function startNewLevel() {
    socket.send(`new ${level}`);
    socket.send('map');
  }

  const sendMessage = (message: string) => {
    switch (message) {
      case 'start': {
        startNewLevel();
        return;
      }
      default: {
        socket.send(message);
        return;
      }
    }
  }

  socket = new WebSocket(SERVER_URL);

  socket.addEventListener('message', getMessage);

  ws = {
    socket: socket,
    sendMessage
  }

  return (
    <SocketContext.Provider value = {ws}>
      {children}
    </SocketContext.Provider>
  )
}
