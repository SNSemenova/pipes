import { RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../SocketManager";
import { useContext, useEffect } from "react";
import "./PipesMap.css";
import useSegmentColor from "./useSegmentColor";
import { removeOldConnections } from "../../app/verifier";
import { updateConnections } from "../../app/temporaryConnectionsSlice";
import Segment from "./Segment";

function PipesMap(): JSX.Element {
  const socket = useContext(SocketContext);

  const level = useSelector((state: RootState) => state.level.value);
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

  useEffect(() => {
    if (level > 1) {
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
    </div>
  );
}

export default PipesMap;
