import { RootState } from '../../app/store'
import { useSelector } from 'react-redux'
import {SocketContext} from "../../SocketManager";
import {useContext, useEffect} from "react";
import "./PipesMap.css"

function PipesMap(): JSX.Element {
  const socket = useContext(SocketContext);

  const level = useSelector((state: RootState) => state.level.value)
  const map = useSelector((state: RootState) => state.map.value)

  function rotateSegment(lineIndex: number, segmentIndex: number) {
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
            >{segment}</button>
          }
        )}
      </div>)}
    </div>
  </div>
}

export default PipesMap;