import { useDispatch, useSelector } from "react-redux";
import PipesMap from "../PipesMap/PipesMap";
import { RootState } from "../../app/store";
import "./GameBoard.css";
import { increment, setLevel } from "../../app/levelSlice";
import { update } from "../../app/mapSlice";
import { useContext } from "react";
import { SocketContext } from "../../SocketManager";
import { updateConnections } from "../../app/temporaryConnectionsSlice";

const GameBoard = () => {
  const socketContext = useContext(SocketContext);

  if (!socketContext) {
    return <p>Error: no WebSocket context</p>;
  }

  const { message$, isConnectionOpen } = socketContext;

  const level = useSelector((state: RootState) => state.level.value);
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(update([]));
    dispatch(setLevel(1));
  };

  if (!isConnectionOpen) {
    return <div>Connection lost. Please refresh the page to reconnect.</div>;
  }

  if (level > 3) {
    return (
      <div className="no-levels">
        There&apos;s no more levels. <br /> You can go
        <button onClick={handleClick} className="back-button">
          back to the first level
        </button>
        .
      </div>
    );
  }

  function nextLevel() {
    dispatch(increment());
  }

  function handleRestart() {
    if (level === 1) {
      dispatch(updateConnections([]));
      message$.next("new 1");
      message$.next("map");
    }
    dispatch(setLevel(1));
  }

  return (
    <>
      <h1 className="game-title">Level {level}</h1>
      <p className="game-description">
        Connect the pipes to let the water flow! Click on elements to rotate
        them and solve the puzzle.
      </p>
      <div className="game-board-container">
        <PipesMap level={level} />
        <div className="controls">
          <button onClick={handleRestart} className="button restart">
            Restart
          </button>
          <button onClick={nextLevel} className="button next">
            Next level
          </button>
        </div>
      </div>
    </>
  );
};

export default GameBoard;
