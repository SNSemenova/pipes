import React, { createContext, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { update } from "./app/mapSlice";
import { increment } from "./app/levelSlice";
import { checkConnections } from "./app/verifier";
import { update as connectionUpdate } from "./app/connectionsSlice";
import onLevelFinish from "./utils/onLevelFinish";

export const SocketContext = createContext({} as WS);

const SERVER_URL = "wss://lasting-buzzing-catfish.gigalixirapp.com/api/ws";

type WS = {
  socket: WebSocket;
  sendMessage: (message: string) => void;
};

export const SocketManager: React.FC<null> = ({ children }) => {
  const socket = new WebSocket(SERVER_URL);
  const sendMessage = (message: string) => {
    socket.send(message);
  };
  const ws = {
    socket: socket,
    sendMessage,
  };

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      socket.removeEventListener("message", getMessage);
    };
  });

  const store = useStore();

  function getMessage(event: MessageEvent) {
    let eventName = event.data.split(" ")[0];
    if (typeof eventName === "string") {
      eventName = eventName.split("\n")[0];
    }
    switch (eventName) {
      case "map:": {
        const puzzleMap = event.data.split("\n").slice(1, -1);
        dispatch(update(puzzleMap));
        const connections = checkConnections(
          puzzleMap,
          store.getState().temporaryConnections.value,
        );
        if (
          connections.length === 1 &&
          connections[0].elements.length === puzzleMap.length * puzzleMap.length
        ) {
          sendMessage("verify");
        }
        dispatch(connectionUpdate(connections));
        return;
      }
      case "verify:": {
        if (event.data.includes("Correct!")) {
          onLevelFinish();
          dispatch(increment());
        }
        return;
      }
    }
  }

  function startNewLevel(currentLevel: number) {
    socket.send(`new ${currentLevel}`);
    socket.send("map");
  }

  socket.addEventListener("open", () => startNewLevel(1));
  socket.addEventListener("message", getMessage);

  return <SocketContext.Provider value={ws}>{children}</SocketContext.Provider>;
};
