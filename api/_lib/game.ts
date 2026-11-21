import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const MAX_LEVEL = 25;
const SESSION_TTL_SECONDS = 30 * 60;

const DIRECTIONS = ["top", "right", "bottom", "left"] as const;
type Direction = (typeof DIRECTIONS)[number];
type Cell = { row: number; column: number };

const SYMBOL_DIRECTIONS: Record<string, Direction[]> = {
  "╻": ["bottom"],
  "╺": ["right"],
  "╹": ["top"],
  "╸": ["left"],
  "┗": ["top", "right"],
  "┏": ["right", "bottom"],
  "┓": ["bottom", "left"],
  "┛": ["left", "top"],
  "━": ["left", "right"],
  "┃": ["top", "bottom"],
  "┫": ["top", "bottom", "left"],
  "┳": ["left", "right", "bottom"],
  "┻": ["left", "right", "top"],
  "┣": ["top", "bottom", "right"],
  "╋": ["top", "right", "bottom", "left"],
};

const SYMBOL_FOR_CONNECTIONS = new Map<string, string>(
  Object.entries(SYMBOL_DIRECTIONS).map(([symbol, dirs]) => [
    [...dirs].sort().join(","),
    symbol,
  ]),
);

const ROTATION_MAP: Record<string, string> = {
  "┛": "┗",
  "┗": "┏",
  "┏": "┓",
  "┓": "┛",
  "┃": "━",
  "━": "┃",
  "╻": "╸",
  "╸": "╹",
  "╹": "╺",
  "╺": "╻",
  "╋": "╋",
  "┫": "┻",
  "┻": "┣",
  "┣": "┳",
  "┳": "┫",
};

const OFFSETS: Record<Direction, Cell> = {
  top: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  bottom: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

const OPPOSITE: Record<Direction, Direction> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

type GameState = {
  version: 1;
  level: number;
  map: string[];
  expiresAt: number;
};

function gameSecret(): string {
  const secret = process.env.GAME_STATE_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("GAME_STATE_SECRET must be configured in production");
  }
  return "local-development-secret-change-before-deploy";
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function signature(payload: string): string {
  return createHmac("sha256", gameSecret()).update(payload).digest("base64url");
}

export function createStateToken(level: number, map: string[]): string {
  const state: GameState = {
    version: 1,
    level,
    map,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payload = encode(JSON.stringify(state));
  return `${payload}.${signature(payload)}`;
}

export function readStateToken(token: unknown): GameState {
  if (typeof token !== "string" || token.length > 10_000) {
    throw new Error("Invalid or missing state token");
  }

  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra !== undefined) {
    throw new Error("Invalid state token");
  }

  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    throw new Error("Invalid state token signature");
  }

  let state: GameState;
  try {
    state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid state token payload");
  }

  if (
    state.version !== 1 ||
    !Number.isInteger(state.level) ||
    state.level < 1 ||
    state.level > MAX_LEVEL ||
    !Number.isInteger(state.expiresAt) ||
    state.expiresAt < Math.floor(Date.now() / 1000) ||
    !isValidMapShape(state.map)
  ) {
    throw new Error("Expired or invalid game state");
  }
  return state;
}

function isValidMapShape(map: unknown): map is string[] {
  if (!Array.isArray(map) || map.length < 1 || map.length > MAX_LEVEL + 4)
    return false;
  const size = map.length;
  return map.every(
    (row) =>
      typeof row === "string" &&
      Array.from(row).length === size &&
      Array.from(row).every((symbol) =>
        Object.hasOwn(SYMBOL_DIRECTIONS, symbol),
      ),
  );
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function cellKey({ row, column }: Cell): string {
  return `${row},${column}`;
}

function generateSolution(size: number): string[] {
  const edges = Array.from({ length: size * size }, () => new Set<Direction>());
  const visited = new Set<string>(["0,0"]);
  const stack: Cell[] = [{ row: 0, column: 0 }];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const options = shuffle([...DIRECTIONS]).filter((direction) => {
      const offset = OFFSETS[direction];
      const next = {
        row: current.row + offset.row,
        column: current.column + offset.column,
      };
      return (
        next.row >= 0 &&
        next.row < size &&
        next.column >= 0 &&
        next.column < size &&
        !visited.has(cellKey(next))
      );
    });

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const direction = options[0];
    const offset = OFFSETS[direction];
    const next = {
      row: current.row + offset.row,
      column: current.column + offset.column,
    };
    edges[current.row * size + current.column].add(direction);
    edges[next.row * size + next.column].add(OPPOSITE[direction]);
    visited.add(cellKey(next));
    stack.push(next);
  }

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => {
      const symbol = SYMBOL_FOR_CONNECTIONS.get(
        [...edges[row * size + column]].sort().join(","),
      );
      if (!symbol) throw new Error("Failed to generate a valid pipe symbol");
      return symbol;
    }).join(""),
  );
}

export function generatePuzzle(level: number): string[] {
  const solved = generateSolution(level + 4);
  const map = solved.map((row) => Array.from(row));
  const cells = map.flatMap((row, r) =>
    row.map((_symbol, c) => ({ row: r, column: c })),
  );
  const total = cells.length;
  const shuffleCount = randomInt(Math.ceil(total / 2), total + 1);

  for (const cell of shuffle(cells).slice(0, shuffleCount)) {
    let symbol = map[cell.row][cell.column];
    const rotations = randomInt(1, 4);
    for (let i = 0; i < rotations; i++) symbol = ROTATION_MAP[symbol];
    map[cell.row][cell.column] = symbol;
  }
  return map.map((row) => row.join(""));
}

export function rotateCell(
  map: string[],
  row: number,
  column: number,
): string[] {
  if (
    !Number.isInteger(row) ||
    !Number.isInteger(column) ||
    row < 0 ||
    row >= map.length ||
    column < 0 ||
    column >= map.length
  ) {
    throw new Error("Rotation coordinates are out of bounds");
  }
  const rows = map.map((line) => Array.from(line));
  rows[row][column] = ROTATION_MAP[rows[row][column]];
  return rows.map((line) => line.join(""));
}

export function isValidSolution(map: string[]): boolean {
  if (!isValidMapShape(map)) return false;
  const size = map.length;
  const visited = new Set<string>();
  const pending: Cell[] = [{ row: 0, column: 0 }];

  while (pending.length > 0) {
    const current = pending.pop()!;
    const key = cellKey(current);
    if (visited.has(key)) continue;
    visited.add(key);
    const symbol = map[current.row][current.column];
    for (const direction of SYMBOL_DIRECTIONS[symbol]) {
      const offset = OFFSETS[direction];
      const next = {
        row: current.row + offset.row,
        column: current.column + offset.column,
      };
      if (
        next.row < 0 ||
        next.row >= size ||
        next.column < 0 ||
        next.column >= size
      )
        return false;
      const neighbor = map[next.row][next.column];
      if (!SYMBOL_DIRECTIONS[neighbor].includes(OPPOSITE[direction]))
        return false;
      pending.push(next);
    }
  }
  return visited.size === size * size;
}
