import React, { createContext, useEffect, useState } from "react";
import { useDispatch, useStore } from "react-redux";
import { update } from "./app/mapSlice";
import { increment } from "./app/levelSlice";
import { checkConnections } from "./app/verifier";
import { update as connectionUpdate } from "./app/connectionsSlice";
import { update as setInitialMap } from "./app/initialMapSlice";
import onLevelFinish from "./utils/onLevelFinish";
import { webSocket } from "rxjs/webSocket";
import { switchMap, interval, Subject, takeUntil, tap, startWith } from "rxjs";
import { newMap } from "./app/rotationsSlice";

const SERVER_URL = "wss://lasting-buzzing-catfish.gigalixirapp.com/api/ws";
const KEEP_ALIVE_INTERVAL = 30 * 1000;

export const SocketContext = createContext<SocketContext | null>(null);

type SocketContext = {
  message$: Subject<string>;
  isConnectionOpen: boolean;
};

export const SocketManager: React.FC<null> = ({ children }) => {
  const [isConnectionOpen, setIsConnectionOpen] = useState(true);
  const socket$ = webSocket<string>({
    url: SERVER_URL,
    serializer: (msg) => msg,
    deserializer: (event) => event.data,
  });
  const message$ = React.useRef(new Subject<string>()).current;
  const unsubscribe$ = React.useRef(new Subject<void>()).current;

  const dispatch = useDispatch();

  useEffect(() => {
    const keepAliveTrigger$ = new Subject<void>();

    const keepAliveSubscription = keepAliveTrigger$
      .pipe(
        startWith(null),
        switchMap(() =>
          interval(KEEP_ALIVE_INTERVAL).pipe(
            tap(() => message$.next("ping")),
            takeUntil(unsubscribe$),
          ),
        ),
      )
      .subscribe();

    const subscription = socket$
      .pipe(
        takeUntil(unsubscribe$),
        tap({ next: (message: string) => handleMessage(message) }),
      )
      .subscribe({
        error: (err) => {
          console.error("Socket error:", err);
          setIsConnectionOpen(false);
        },
        complete: () => setIsConnectionOpen(false),
      });

    const sendSubscription = message$
      .pipe(
        tap({
          next: (message: string) => {
            socket$.next(message);
            keepAliveTrigger$.next();
          },
        }),
      )
      .subscribe();

    socket$.next("new 1");
    socket$.next("map");

    return () => {
      unsubscribe$.next();
      unsubscribe$.complete();
      keepAliveTrigger$.complete();
      keepAliveSubscription.unsubscribe();
      subscription.unsubscribe();
      sendSubscription.unsubscribe();
    };
  }, []);

  const store = useStore();

  function handleMessage(event: string) {
    const eventName = event.split(" ")[0].split("\n")[0];
    switch (eventName) {
      case "map:": {
        const puzzleMap = event.split("\n").slice(1, -1);
        const initial = store.getState().initialMap.value;
        if (initial.length === 0) {
          dispatch(setInitialMap(puzzleMap));
          dispatch(newMap(puzzleMap.length));
        }
        dispatch(update(puzzleMap));
        const connections = checkConnections(
          puzzleMap,
          store.getState().temporaryConnections.value,
        );
        if (
          connections.length === 1 &&
          connections[0].elements.length === puzzleMap.length * puzzleMap.length
        ) {
          message$.next("verify");
        }
        dispatch(connectionUpdate(connections));
        return;
      }
      case "verify:": {
        if (event.includes("Correct!")) {
          onLevelFinish();
          dispatch(increment());
        }
        return;
      }
    }
  }

  return (
    <SocketContext.Provider value={{ message$, isConnectionOpen }}>
      {children}
    </SocketContext.Provider>
  );
};
