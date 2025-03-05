import { RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../SocketManager";
import { useContext, useEffect } from "react";
import "./PipesMap.css";
import useSegmentColor from "./useSegmentColor";
import { removeOldConnections } from "../../app/verifier";
import { updateConnections } from "../../app/temporaryConnectionsSlice";
import Segment from "./Segment";
import { increment } from "../../app/levelSlice";

type Props = {
  level: number;
};

function PipesMap({ level }: Props): JSX.Element {
  const socket = useContext(SocketContext);

  const map = useSelector((state: RootState) => state.map.value);
  const connections = useSelector(
    (state: RootState) => state.connections.value,
  );
  const dispatch = useDispatch();

  const getSegmentColor = useSegmentColor();

  function rotateSegment(lineIndex: number, segmentIndex: number) {
    const temporaryConnections = removeOldConnections(
      map,
      connections,
      lineIndex,
      segmentIndex,
    );
    dispatch(updateConnections(temporaryConnections));

    socket.sendMessage(`rotate ${segmentIndex} ${lineIndex}`);
    socket.sendMessage("map");
  }

  const isSocketReady = () => socket.socket.readyState === 1;

  useEffect(() => {
    if (isSocketReady()) {
      dispatch(updateConnections([]));
      socket.sendMessage(`new ${level}`);
      socket.sendMessage("map");
    }
  }, [level, socket]);

  function getJustifyItems(segment: string) {
    if (segment === "╺") {
      return "end";
    } else if (segment === "╸") {
      return "start";
    } else {
      return "center";
    }
  }

  function getAlignItems(segment: string) {
    if (segment === "╻" || segment === "┏" || segment === "┓") {
      return "end";
    } else if (segment === "╹" || segment === "┗" || segment === "┛") {
      return "start";
    } else {
      return "center";
    }
  }

  function nextLevel() {
    dispatch(increment());
  }

  return (
    <div>
      <h1>Level {level}</h1>
      <div className="puzzle">
        {map.map((line: string, lineIndex) => (
          <div className="puzzle-line" key={lineIndex}>
            {line.split("").map((segment, segmentIndex) => {
              return (
                <button
                  className="puzzle-segment"
                  key={`${lineIndex}-${segmentIndex}`}
                  onClick={() => rotateSegment(lineIndex, segmentIndex)}
                  style={{
                    color: getSegmentColor(lineIndex, segmentIndex),
                    justifyContent: getJustifyItems(segment),
                    alignItems: getAlignItems(segment),
                  }}
                >
                  <Segment
                    segment={segment}
                    color={getSegmentColor(lineIndex, segmentIndex)}
                  />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <button onClick={nextLevel} className="next-button">
        Next level
      </button>
    </div>
  );
}

export default PipesMap;
