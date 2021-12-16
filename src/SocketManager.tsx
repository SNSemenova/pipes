import React, {createContext, useContext, useEffect} from "react";
import {useDispatch} from "react-redux";
import {update} from "./components/mapSlice";

export const SocketContext = createContext({} as WS);

const SERVER_URL = 'wss://hometask.eg1236.com/game-pipes/';

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
    switch (event.data.split(' ')[0]) {
      case 'map:': {
        console.log(typeof event.data, event.data.split('\n').slice(1, -1));
        dispatch(update(event.data.split('\n').slice(1, -1)));
        return;
      }
      case 'verify:': {
        if (event.data.includes('Correct!')) {
          const password = event.data.split(' ').pop();
          console.log(`password: ${password}`)
          alert('You win')
        }
      }
    }
    if (event.data.includes
    ('map:')) {
      console.log(typeof event.data, event.data.split('\n').slice(1, -1));
      dispatch(update(event.data.split('\n').slice(1, -1)))
    }
  }

  const sendMessage = (message: string) => {
    socket.send(message);
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
