import { useDispatch, useSelector } from "react-redux";
import PipesMap from "../PipesMap/PipesMap";
import { RootState } from "../../app/store";
import "./GameBoard.css";
import { setLevel } from "../../app/levelSlice";
import { update } from "../../app/mapSlice";

const GameBoard = () => {
  const level = useSelector((state: RootState) => state.level.value);
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(update([]));
    dispatch(setLevel(1));
  };

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
  return <PipesMap level={level} />;
};

export default GameBoard;
