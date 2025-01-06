import { RootState } from '../../app/store'
import { useDispatch, useSelector } from 'react-redux'
import {SocketContext} from "../../SocketManager";
import {useContext, useEffect} from "react";
import "./PipesMap.css"
import useSegmentColor from './useSegmentColor';
import {removeOldConnections} from "../../app/verifier";
import {update} from "../../app/connectionsSlice";

function PipesMap(): JSX.Element {
  const socket = useContext(SocketContext);

  const level = useSelector((state: RootState) => state.level.value)
  const map = useSelector((state: RootState) => state.map.value)
  const connections = useSelector((state: RootState) => state.connections.value)
  const dispatch = useDispatch()

  const getSegmentColor = useSegmentColor();

  function rotateSegment(lineIndex: number, segmentIndex: number) {
    let newConnections = removeOldConnections(map, connections, lineIndex, segmentIndex);
    dispatch(update(newConnections));
    
    socket.sendMessage(`rotate ${segmentIndex} ${lineIndex}`);
    socket.sendMessage('map');
  }

  useEffect(() => {
    if (level > 1) {
      socket.sendMessage(`new ${level}`);
      socket.sendMessage('map');
    }
  }, [level, socket])

  return <div>
    <h1>Level {level}</h1>
    <div className="puzzle">
      {map.map((line: string, lineIndex) => <div className="puzzle-line" key={lineIndex}>
        { line.split('').map((segment, segmentIndex) => {
            return <button
              className="puzzle-segment"
              key={`${lineIndex}-${segmentIndex}`}
              onClick={() => rotateSegment(lineIndex, segmentIndex)}
              style={{color: getSegmentColor(lineIndex, segmentIndex)}}
            >{segment}</button>
          }
        )}
      </div>)}
    </div>
  </div>
}

export default PipesMap;
