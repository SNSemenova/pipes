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
      for (const direction of symbolsMap[currentLineArray[symbolIndex]]) {
        otherDirections.splice(otherDirections.indexOf(direction), 1)
        if (verificationMap[direction](puzzleMap, lineIndex, symbolIndex)) {
          const adjacentIndexes = getAdjacentIndexes(direction, lineIndex, symbolIndex);
          const indicesString = `${lineIndex},${symbolIndex}`;
          const groupIndex = connections.findIndex(group => group.elements.includes(indicesString));
          const otherGroupIndex = connections.findIndex(group => group.elements.includes(adjacentIndexes));
          if (groupIndex > -1) {
            if (!connections[groupIndex].elements.includes(adjacentIndexes)) {
              if (otherGroupIndex > -1) {
                let groupToUpdate: number
                let groupToRemove: number
                if (otherGroupIndex < groupIndex) {
                  groupToUpdate = otherGroupIndex
                  groupToRemove = groupIndex
                } else {
                  groupToUpdate = groupIndex
                  groupToRemove = otherGroupIndex
                }
                connections[groupToUpdate].elements = [...connections[groupIndex].elements, ...connections[otherGroupIndex].elements]
                connections.splice(groupToRemove, 1);
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

export function removeOldConnections(map: string[], connections: RootState['connections']['value'], lineIndex: number, segmentIndex: number) {
  const currentIndices = `${lineIndex},${segmentIndex}`
  let groupIndex = connections.findIndex(group => group.elements.includes(currentIndices))

  if (groupIndex < 0) {
    return connections
  }
  
  const newConnections = [...connections.map(group => ({elements: [...group.elements], color: group.color}))]
  const element = map[lineIndex].split('')[segmentIndex]
  const oldDirections = symbolsMap[element]
  const newElement = rotationMap[element]
  const connectionDirections = symbolsMap[newElement]
  const newDirections = connectionDirections.filter(direction => !oldDirections.includes(direction))
  const remainingDirections = oldDirections.filter(direction => connectionDirections.includes(direction))
  let groupBase: Array<string> = []
  let groupIndexToRemove: number = -1
  
  getNewGroupElements()

  function getNewGroupElements() {
    // check if old connections remain
    for (let i = 0; i < remainingDirections.length; i++) {
      const adjacentIndexes = getAdjacentIndexes(remainingDirections[i], lineIndex, segmentIndex)
      // check if adjacent element is in the same group
      if (connections[groupIndex].elements.includes(adjacentIndexes)) {
        // check if adjacent element is connected to rotated element
        const adjacentIndicesArray = adjacentIndexes.split(',')
        const adjacentElement = map[parseInt(adjacentIndicesArray[0])].split('')[parseInt(adjacentIndicesArray[1])]
        if (adjacentElement) {
          const otherDirections = symbolsMap[adjacentElement]
          for (let j = 0; j < otherDirections.length; j++) {
            const secondAdjacentIndices = getAdjacentIndexes(otherDirections[j], parseInt(adjacentIndicesArray[0]), parseInt(adjacentIndicesArray[1]))
            if (secondAdjacentIndices === currentIndices) {
              groupBase = [currentIndices, adjacentIndexes]
              return
            }
          }
        }
      }
    }

    // check if elements from old connections are still grouped
    for (let i = 0; i < oldDirections.length; i++) {
      const adjacentIndexes = getAdjacentIndexes(oldDirections[i], lineIndex, segmentIndex)
      const newGroupIndex = connections.findIndex(group => group.elements.includes(adjacentIndexes))
      if (newGroupIndex > -1) {
        const adjacentIndicesArray = adjacentIndexes.split(',')
        const adjacentElement = map[parseInt(adjacentIndicesArray[0])].split('')[parseInt(adjacentIndicesArray[1])]
        const otherDirections = symbolsMap[adjacentElement]
        for (let j = 0; j < otherDirections.length; j++) {
          const secondAdjacentIndices = getAdjacentIndexes(otherDirections[j], parseInt(adjacentIndicesArray[0]), parseInt(adjacentIndicesArray[1]))
          // check if current direction is not to rotated element, because it is already checked
          if (secondAdjacentIndices !== currentIndices) {
            // check if adjacent elements are connected to each other
            const secondAdjacent = secondAdjacentIndices.split(',')
            if (parseInt(secondAdjacent[0]) < map.length && parseInt(secondAdjacent[1]) < map[0].length
              && parseInt(secondAdjacent[0]) >= 0 && parseInt(secondAdjacent[1]) >= 0) {
                const secondAdjacentDirections = getOtherDirections(map, secondAdjacent)
              for (let directionIndex = 0; directionIndex < secondAdjacentDirections.length; directionIndex++) {
                if (getAdjacentIndexes(secondAdjacentDirections[directionIndex], parseInt(secondAdjacent[0]), parseInt(secondAdjacent[1])) === adjacentIndexes) {
                  groupIndex = newGroupIndex
                  groupBase = [adjacentIndexes, secondAdjacentIndices]
                  return
                }
              }
            }
          }
        }
      }
    }
    
    // check new connections if the old group is not found
    for (let i = 0; i < newDirections.length; i++) {
      const adjacentIndexes = getAdjacentIndexes(newDirections[i], lineIndex, segmentIndex)
      const adjacentIndicesArray = adjacentIndexes.split(',')
      // check if adjacent element exists
      if (parseInt(adjacentIndicesArray[0]) < map.length && parseInt(adjacentIndicesArray[1]) < map.length
        && parseInt(adjacentIndicesArray[0]) >= 0 && parseInt(adjacentIndicesArray[1]) >= 0) {
          const adjacentElement = map[parseInt(adjacentIndicesArray[0])].split('')[parseInt(adjacentIndicesArray[1])]
          const otherDirections = symbolsMap[adjacentElement]
        for (let j = 0; j < otherDirections.length; j++) {
          const secondAdjacentIndices = getAdjacentIndexes(otherDirections[j], parseInt(adjacentIndicesArray[0]), parseInt(adjacentIndicesArray[1]))
          // check if adjacent element is connected to rotated element
          if (secondAdjacentIndices === currentIndices) {
            const newGroupIndex = connections.findIndex(group => group.elements.includes(adjacentIndexes))
            // check if adjacent element is in another group
            if (newGroupIndex > -1 && newGroupIndex !== groupIndex) {
              groupIndexToRemove = newGroupIndex
            }
            groupBase = [currentIndices, adjacentIndexes]
            return
          }
        }
      }
    }
  }

  function getOtherDirections(map: string[], adjacentIndexes: string[]) { 
    const adjacentElement = map[parseInt(adjacentIndexes[0])].split('')[parseInt(adjacentIndexes[1])]
    return symbolsMap[adjacentElement]
  }
  
  if (groupBase.length < 1) {
    groupIndexToRemove = groupIndex
  } else {
    newConnections[groupIndex].elements = groupBase
  }

  if (groupIndexToRemove > -1) {
    newConnections.splice(groupIndexToRemove, 1)
  }

  return newConnections
}
