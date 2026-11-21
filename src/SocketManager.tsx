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

const SERVER_URL = process.env.REACT_APP_WEB_SOCKET_URL || "";
const KEEP_ALIVE_INTERVAL = 30 * 1000;
const USE_HTTP_GAME_API = process.env.REACT_APP_GAME_TRANSPORT === "http";

export const SocketContext = createContext<SocketContext | null>(null);

type SocketContext = {
  message$: Subject<string>;
  isConnectionOpen: boolean;
  transport: "websocket" | "http";
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
  const httpStateToken = React.useRef<string | null>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (USE_HTTP_GAME_API) {
      httpStateToken.current = null;
      let commandQueue = Promise.resolve();
      let initializationQueued = false;
      let skipNextMapRead = false;

      const sendSubscription = message$.subscribe((message) => {
        if (message.startsWith("new ")) initializationQueued = true;
        commandQueue = commandQueue
          .then(async () => {
            const [command, first, second] = message.trim().split(" ");
            if (command === "new") {
              const result = await postGame("new", {
                level: Number(first || 1),
              });
              httpStateToken.current = result.stateToken;
              applyMap(result.map);
              skipNextMapRead = true;
              return;
            }

            if (!httpStateToken.current)
              throw new Error("Game state has not been initialized");

            if (command === "map") {
              if (skipNextMapRead) {
                skipNextMapRead = false;
                return;
              }
              const result = await postGame("map", {
                stateToken: httpStateToken.current,
              });
              httpStateToken.current = result.stateToken;
              await applyHttpMap(result.map);
            } else if (command === "rotate") {
              const result = await postGame("rotate", {
                stateToken: httpStateToken.current,
                column: Number(first),
                row: Number(second),
              });
              httpStateToken.current = result.stateToken;
              skipNextMapRead = true;
            } else if (command === "verify") {
              const result = await postGame("verify", {
                stateToken: httpStateToken.current,
              });
              httpStateToken.current = result.stateToken;
              if (result.correct) {
                markCompleted(store.getState().level.value);
                onLevelFinish();
                dispatch(increment());
              }
            }
          })
          .catch((error: unknown) => {
            console.error("Game API error:", error);
            setIsConnectionOpen(false);
          });
      });

      Promise.resolve().then(() => {
        if (!initializationQueued) {
          message$.next("new 1");
          message$.next("map");
        }
      });

      return () => sendSubscription.unsubscribe();
    }

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
        const puzzleMap = event.split("\n").slice(1);
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
          markCompleted(store.getState().level.value);
          onLevelFinish();
          dispatch(increment());
        }
        return;
      }
    }
  }

  function applyMap(puzzleMap: string[]) {
    if (!puzzleMap || puzzleMap.length === 0) {
      throw new Error("Game API returned an empty map");
    }
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
    dispatch(connectionUpdate(connections));
    return (
      connections.length === 1 &&
      connections[0].elements.length === puzzleMap.length * puzzleMap.length
    );
  }

  async function applyHttpMap(puzzleMap: string[]) {
    if (applyMap(puzzleMap) && httpStateToken.current) {
      const result = await postGame("verify", {
        stateToken: httpStateToken.current,
      });
      httpStateToken.current = result.stateToken;
      if (result.correct) {
        markCompleted(store.getState().level.value);
        onLevelFinish();
        dispatch(increment());
      }
    }
  }

  const markCompleted = (level: number) => {
    const storageItem = localStorage.getItem("completed");
    const completed = storageItem ? storageItem.split(" ") : "";
    if (!completed.includes(level.toString())) {
      localStorage.setItem("completed", `${completed} ${level}`);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        message$,
        isConnectionOpen,
        transport: USE_HTTP_GAME_API ? "http" : "websocket",
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

type GameApiResult = {
  map: string[];
  stateToken: string;
  correct?: boolean;
};

async function postGame(
  action: "new" | "map" | "rotate" | "verify",
  values: Record<string, string | number>,
): Promise<GameApiResult> {
  const response = await fetch("/api/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...values }),
  });
  const result = (await response.json()) as GameApiResult & { error?: string };
  if (!response.ok) throw new Error(result.error || "Game API request failed");
  return result;
}
