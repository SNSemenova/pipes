import { RootState } from './store'

export type Map = {
  [key: string]: Direction[];
};

enum Direction {
  Bottom = "bottom",
  Right = "right",
  Top = "top",
  Left = "left",
}

type VerificationMap = {
  [key in Direction]: (puzzleMap: string[], lineIndex: number, symbolIndex: number) => boolean;
};

export const symbolsMap: Map = {
  '╻': [Direction.Bottom],
  '╺': [Direction.Right],
  '╹': [Direction.Top],
  '╸': [Direction.Left],
  '┗': [Direction.Top, Direction.Right],
  '┏': [Direction.Right, Direction.Bottom],
  '┓': [Direction.Bottom, Direction.Left],
  '┛': [Direction.Left, Direction.Top],
  '━': [Direction.Left, Direction.Right],
  '┃': [Direction.Top, Direction.Bottom],
  '┫': [Direction.Top, Direction.Bottom, Direction.Left],
  '┳': [Direction.Left, Direction.Right, Direction.Bottom],
  '┻': [Direction.Left, Direction.Right, Direction.Top],
  '┣': [Direction.Top, Direction.Bottom, Direction.Right],
  '╋': [Direction.Top, Direction.Bottom, Direction.Right, Direction.Left]
};

const verificationMap: VerificationMap = {
  [Direction.Top]: function verifyTop(puzzleMap: string[], lineIndex: number, symbolIndex: number) {
    return lineIndex !== 0 &&
      symbolsMap[puzzleMap[lineIndex - 1].split('')[symbolIndex]].includes(Direction.Bottom);
  },
  [Direction.Bottom]: function verifyBottom(puzzleMap: string[], lineIndex: number, symbolIndex: number) {
    return lineIndex < puzzleMap.length - 1 &&
      symbolsMap[puzzleMap[lineIndex + 1].split('')[symbolIndex]].includes(Direction.Top);
  },
  [Direction.Left]: function verifyLeft(puzzleMap: string[], lineIndex: number, symbolIndex: number) {
    return symbolIndex !== 0 &&
      symbolsMap[puzzleMap[lineIndex].split('')[symbolIndex - 1]].includes(Direction.Right);
  },
  [Direction.Right]: function verifyRight(puzzleMap: string[], lineIndex: number, symbolIndex: number) {
    const currentLineArray = puzzleMap[lineIndex].split('');
    return symbolIndex < currentLineArray.length - 1 &&
      symbolsMap[currentLineArray[symbolIndex + 1]].includes(Direction.Left);
  },
}

const getAdjacentIndexes = (direction: Direction, lineIndex: number, symbolIndex: number) => {
  let newLineIndex = lineIndex;
  let newSymbolIndex = symbolIndex;
  const adjacentIndexes = {
    [Direction.Top]: () => newLineIndex--,
    [Direction.Bottom]: () => newLineIndex++,
    [Direction.Left]: () => newSymbolIndex--,
    [Direction.Right]: () => newSymbolIndex++,
  };
  adjacentIndexes[direction]()
  return `${newLineIndex},${newSymbolIndex}`
}

export const rotationMap: Record<string, string> = {
  '╻': '╸',
  '╺': '╻',
  '╹': '╺',
  '╸': '╹',
  '┗': '┏',
  '┏': '┓',
  '┓': '┛',
  '┛': '┗',
  '━': '┃',
  '┃': '━',
  '┫': '┻',
  '┳': '┫',
  '┻': '┣',
  '┣': '┳',
  '╋': '╋'
};

export function checkConnections(puzzleMap: string[], oldConnections: RootState['connections']['value']) {
  let connections = [...oldConnections.map(group => ({elements: [...group.elements], color: group.color}))]
  for (let lineIndex = 0; lineIndex < puzzleMap.length; lineIndex++) {
    const currentLineArray = puzzleMap[lineIndex].split('');
    for (let symbolIndex = 0; symbolIndex < currentLineArray.length; symbolIndex++) {
      const otherDirections = Object.keys(verificationMap)
      for (let direction of symbolsMap[currentLineArray[symbolIndex]]) {
        otherDirections.splice(otherDirections.indexOf(direction), 1)
        if (verificationMap[direction](puzzleMap, lineIndex, symbolIndex)) {
          let adjacentIndexes = getAdjacentIndexes(direction, lineIndex, symbolIndex);
          let indicesString = `${lineIndex},${symbolIndex}`;
          let groupIndex = connections.findIndex(group => group.elements.includes(indicesString));
          let otherGroupIndex = connections.findIndex(group => group.elements.includes(adjacentIndexes));
          if (groupIndex > -1) {
            if (!connections[groupIndex].elements.includes(adjacentIndexes)) {
              if (otherGroupIndex > -1) {
                connections[otherGroupIndex].elements = [...connections[groupIndex].elements, ...connections[otherGroupIndex].elements]
                connections.splice(groupIndex, 1);
              } else {
                connections[groupIndex].elements = [...connections[groupIndex].elements, adjacentIndexes]
              }
            }
          } else {
            if (otherGroupIndex > -1) {
              connections[otherGroupIndex].elements = [...connections[otherGroupIndex].elements, indicesString]
            } else {
              const newGroup = {elements: [indicesString, adjacentIndexes], color: `#${generateColor()}`}
              connections = [...connections, newGroup]
            }
          }
        }
      }
    }
  }
  return connections
}

const generateColor = () => {
  return Math.random().toString(16).slice(-6)
}

function getGroupBase(connectionDirections: Direction[], connections: RootState['connections']['value'], lineIndex: number, segmentIndex: number, groupIndex: number, map: string[]) {
  for (let i = 0; i < connectionDirections.length; i++) {
    let adjacentIndexes = getAdjacentIndexes(connectionDirections[i], lineIndex, segmentIndex)
    let currentIndices = `${lineIndex},${segmentIndex}`
    if (connections[groupIndex].elements.includes(adjacentIndexes)) {
      return [currentIndices, adjacentIndexes]
    }
    let adjacentIndicesArray = adjacentIndexes.split(',')
    let adjacentElement = map[parseInt(adjacentIndicesArray[0])]?.split('')[parseInt(adjacentIndicesArray[1])]
    let adjacentDirections = symbolsMap[adjacentElement] ?? []
    for (let j = 0; j < adjacentDirections.length; j++) {
      if (getAdjacentIndexes(adjacentDirections[j], parseInt(adjacentIndicesArray[0]), parseInt(adjacentIndicesArray[1])) === currentIndices) {
        return [currentIndices, adjacentIndexes]
      }
    }
  }

  return []
}

export function removeOldConnections(map: string[], connections: RootState['connections']['value'], lineIndex: number, segmentIndex: number): any {
  let currentIndices = `${lineIndex},${segmentIndex}`
  let groupIndex = connections.findIndex(group => group.elements.includes(currentIndices))

  if (groupIndex < 0) {
    return connections
  }
  
  let newConnections = [...connections.map(group => ({elements: [...group.elements], color: group.color}))]
  let element = map[lineIndex].split('')[segmentIndex]
  let oldConnectedDirections = symbolsMap[element]
  let newElement = rotationMap[element]
  let connectionDirections = symbolsMap[newElement]

  let groupBase: Array<string> = []
  
  let disconnected = oldConnectedDirections.filter(direction => !connectionDirections.includes(direction))
  let remainingDirections = oldConnectedDirections.filter(direction => connectionDirections.includes(direction))

  if (disconnected.length > 0) {
    if (remainingDirections.length > 0) {
      groupBase = getGroupBase(connectionDirections, connections, lineIndex, segmentIndex, groupIndex, map)
    } 
    if (groupBase.length < 1) {
      getNewGroupElements()
    }
  }

  function getNewGroupElements() {
    for (let i = 0; i < disconnected.length; i++) {
      let adjacentIndexes = getAdjacentIndexes(disconnected[i], lineIndex, segmentIndex)
      let newGroupIndex = connections.findIndex(group => group.elements.includes(adjacentIndexes))
      if (newGroupIndex > -1) {
        let adjacentIndicesArray = adjacentIndexes.split(',')
        let adjacentElement = map[parseInt(adjacentIndicesArray[0])].split('')[parseInt(adjacentIndicesArray[1])]
        let otherDirections = symbolsMap[adjacentElement]
        for (let j = 0; j < otherDirections.length; j++) {
          let secondAdjacentIndices = getAdjacentIndexes(otherDirections[j], parseInt(adjacentIndicesArray[0]), parseInt(adjacentIndicesArray[1]))
          if (secondAdjacentIndices !== currentIndices) {
            let secondAdjacent = secondAdjacentIndices.split(',')
            if (parseInt(secondAdjacent[0]) < map.length && parseInt(secondAdjacent[1]) < map[0].length
              && parseInt(secondAdjacent[0]) >= 0 && parseInt(secondAdjacent[1]) >= 0) {
              let secondAdjacentDirections = getOtherDirections(map, secondAdjacent)
              for (let directionIndex = 0; directionIndex < secondAdjacentDirections.length; directionIndex++) {
                if (getAdjacentIndexes(secondAdjacentDirections[directionIndex], parseInt(secondAdjacent[0]), parseInt(secondAdjacent[1])) === adjacentIndexes) {
                  groupIndex = newGroupIndex
                  groupBase = [adjacentIndexes, secondAdjacentIndices]
                }
              }
            }
          }
        }
      }
    }
  }

  function getOtherDirections(map: string[], adjacentIndexes: string[]) { 
    let adjacentElement = map[parseInt(adjacentIndexes[0])].split('')[parseInt(adjacentIndexes[1])]
    return symbolsMap[adjacentElement]
  }

  if (groupBase.length < 1) {
    newConnections.splice(groupIndex, 1)
  } else {
    newConnections[groupIndex].elements = groupBase
  }

  return newConnections
}
