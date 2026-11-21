import { RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../SocketManager";
import { useContext, useEffect } from "react";
import "./PipesMap.css";
import useSegmentColor from "./useSegmentColor";
import {
  checkConnections,
  removeOldConnections,
  rotationMap,
} from "../../app/verifier";
import { updateConnections } from "../../app/temporaryConnectionsSlice";
import { update as updateConnectionGroups } from "../../app/connectionsSlice";
import Segment from "./Segment";
import Spinner from "../Spinner/Spinner";
import { rotate } from "../../app/rotationsSlice";
import { update as setInitialMap } from "../../app/initialMapSlice";
import { update as setMap } from "../../app/mapSlice";

type Props = {
  level: number;
};

function PipesMap({ level }: Props): JSX.Element {
  const socketContext = useContext(SocketContext);

  if (!socketContext) {
    return <p>Error: no WebSocket context</p>;
  }

  const { message$, transport } = socketContext;

  const map = useSelector((state: RootState) => state.map.value);
  const initialMap = useSelector((state: RootState) => state.initialMap.value);
  const connections = useSelector(
    (state: RootState) => state.connections.value,
  );
  const rotations = useSelector((state: RootState) => state.rotations.value);
  const dispatch = useDispatch();

  const getSegmentColor = useSegmentColor();

  function rotateSegment(lineIndex: number, segmentIndex: number) {
    const preservedConnections = removeOldConnections(
      map,
      connections,
      lineIndex,
      segmentIndex,
    );

    const updatedMap = map.map((line, row) => {
      if (row !== lineIndex) return line;
      const segments = line.split("");
      segments[segmentIndex] = rotationMap[segments[segmentIndex]];
      return segments.join("");
    });
    const updatedConnections = checkConnections(
      updatedMap,
      preservedConnections,
    );

    dispatch(setMap(updatedMap));
    dispatch(updateConnectionGroups(updatedConnections));
    dispatch(updateConnections(updatedConnections));

    message$.next(`rotate ${segmentIndex} ${lineIndex}`);
    message$.next("map");
    if (
      transport === "http" &&
      updatedConnections.length === 1 &&
      updatedConnections[0].elements.length ===
        updatedMap.length * updatedMap.length
    ) {
      message$.next("verify");
    }
    dispatch(rotate({ lineIndex, segmentIndex }));
  }

  useEffect(() => {
    dispatch(setInitialMap([]));
    dispatch(updateConnections([]));
    message$.next(`new ${level}`);
    message$.next("map");
  }, [level]);

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

  function getRotation(lineIndex: number, segmentIndex: number) {
    return `rotate(${rotations[lineIndex] ? rotations[lineIndex][segmentIndex] * 90 : 0}deg)`;
  }

  return (
    <div className="puzzle">
      {initialMap.length === 0 && <Spinner />}
      {initialMap.length > 0 && (
        <div
          className="puzzle-grid"
          style={{
            gridTemplateColumns: `repeat(${initialMap.length}, 1fr)`,
            gridTemplateRows: `repeat(${initialMap.length}, 1fr)`,
          }}
        >
          {initialMap.map((line: string, lineIndex) =>
            line.split("").map((segment, segmentIndex) => {
              return (
                <button
                  className="puzzle-segment"
                  key={`${lineIndex}-${segmentIndex}`}
                  onClick={() => rotateSegment(lineIndex, segmentIndex)}
                >
                  <div
                    className="puzzle-element"
                    style={{
                      transform: getRotation(lineIndex, segmentIndex),
                      justifyContent: getJustifyItems(segment),
                      alignItems: getAlignItems(segment),
                      color: getSegmentColor(lineIndex, segmentIndex),
                    }}
                  >
                    <Segment
                      segment={segment}
                      color={getSegmentColor(lineIndex, segmentIndex)}
                    />
                  </div>
                </button>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}

export default PipesMap;
