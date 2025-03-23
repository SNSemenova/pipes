import React, { createContext, useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { update } from "./app/mapSlice";
import { increment } from "./app/levelSlice";
import { checkConnections } from "./app/verifier";
import { update as connectionUpdate } from "./app/connectionsSlice";
import onLevelFinish from "./utils/onLevelFinish";
import { webSocket } from "rxjs/webSocket";
import { switchMap, timer, Subject, takeUntil, tap, repeat } from "rxjs";

const SERVER_URL = "wss://lasting-buzzing-catfish.gigalixirapp.com/api/ws";

export const SocketContext = createContext<SocketContext | null>(null);

type SocketContext = {
  message$: Subject<string>;
};

export const SocketManager: React.FC<null> = ({ children }) => {
  const socket$ = webSocket<string>({
    url: SERVER_URL,
    serializer: (msg) => msg,
    deserializer: (event) => event.data,
  });
  const message$ = new Subject<string>();
  const unsubscribe$ = new Subject<void>();

  const dispatch = useDispatch();

  useEffect(() => {
    const keepAliveTrigger$ = new Subject<void>();

    const keepAliveSubscription = keepAliveTrigger$
      .pipe(
        switchMap(() =>
          timer(30000).pipe(
            tap(() => {
              socket$.next("ping");
            }),
            repeat(),
          ),
        ),
        takeUntil(unsubscribe$),
      )
      .subscribe();

    const subscription = socket$
      .pipe(
        takeUntil(unsubscribe$),
        tap({ next: (message: string) => handleMessage(message) }),
      )
      .subscribe();

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
    <SocketContext.Provider value={{ message$ }}>
      {children}
    </SocketContext.Provider>
  );
};
