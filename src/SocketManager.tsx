import React, {createContext, useEffect} from "react";
import {useDispatch} from "react-redux";
import {update} from "./app/mapSlice";
import {increment} from "./app/levelSlice";
import {verify} from "./app/verifier";

export const SocketContext = createContext({} as WS);

const SERVER_URL = 'wss://lasting-buzzing-catfish.gigalixirapp.com/api/ws';

type WS = {
  socket: WebSocket,
  sendMessage: (message: string) => void
}

export const SocketManager: React.FC<null> = ({children}) => {
  let socket: WebSocket;
  let ws: WS;

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
        const puzzleMap = event.data.split('\n').slice(1, -1);
        if (verify(puzzleMap)) {
          sendMessage('verify');
        }
        dispatch(update(puzzleMap));
        return;
      }
      case 'verify:': {
        if (event.data.includes('Correct!')) {
          const password = event.data.split(' ').pop();
          console.log(`password: ${password}`);
          alert('You win');
          dispatch(increment());
        }
        return;
      }
    }
  }

  function startNewLevel(currentLevel: number) {
    socket.send(`new ${currentLevel}`);
    socket.send('map');
  }

  const sendMessage = (message: string) => {
    socket.send(message);
  }

  socket = new WebSocket(SERVER_URL);

  socket.addEventListener('open', () => startNewLevel(1));
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
