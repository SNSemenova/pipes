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
    return symbolIndex < currentLineArray.length &&
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

export function verify(puzzleMap: string[]) {
  for (let lineIndex = 0; lineIndex < puzzleMap.length; lineIndex++) {
    const currentLineArray = puzzleMap[lineIndex].split('');
    for (let symbolIndex = 0; symbolIndex < currentLineArray.length; symbolIndex++) {
      for (let direction of symbolsMap[currentLineArray[symbolIndex]]) {
        if (!verificationMap[direction](puzzleMap, lineIndex, symbolIndex)) {
          return false;
        }
      }
    }
  }
  return true;
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

export function checkConnections(puzzleMap: string[], connections: Array<string>[], lineIndex: number, symbolIndex: number) {
  let newElement = rotationMap[puzzleMap[lineIndex][symbolIndex]]
  let newConnections = [...connections];
  for (let direction of symbolsMap[newElement]) {
    if (verificationMap[direction](puzzleMap, lineIndex, symbolIndex)) {
      let adjacentIndexes = getAdjacentIndexes(direction, lineIndex, symbolIndex);
      let groupIndex = connections.findIndex(group => group.includes(`${lineIndex},${symbolIndex}`));
      if (groupIndex > -1) {
        if (!newConnections[groupIndex].includes(adjacentIndexes)) {
          console.log('group:', newConnections[groupIndex])
          newConnections[groupIndex] = [...newConnections[groupIndex], adjacentIndexes]
        }
      } else {
        const newGroup = [`${lineIndex},${symbolIndex}`, adjacentIndexes]
        newConnections = [...newConnections, newGroup]
      }
    }
  }
  return newConnections;
}
