import { RootState } from '../app/store'
import { useSelector } from 'react-redux'
import {SocketContext} from "../SocketManager";
import {useContext} from "react";
import "./PipesMap.css"

function PipesMap(): JSX.Element {
  const socket = useContext(SocketContext);

  const map = useSelector((state: RootState) => state.map.value)

  function rotateSegment(lineIndex: number, segmentIndex: number) {
    socket.sendMessage(`rotate ${segmentIndex} ${lineIndex}`);
    socket.sendMessage('map');
  }

  return <div className="puzzle">
    {map.map((line: string, lineIndex) => <div className="puzzle-line" key={lineIndex}>
      { line.split('').map((segment, segmentIndex) =>
        <button
          className="puzzle-segment"
          key={`${lineIndex}-${segmentIndex}`}
          onClick={() => rotateSegment(lineIndex, segmentIndex)}
        >{segment}</button>
      )}
    </div>)}
    <button onClick={() => socket.sendMessage('verify')}>verify</button>
    <button onClick={() => socket.sendMessage('map')}>map</button>
  </div>
}

export default PipesMap;