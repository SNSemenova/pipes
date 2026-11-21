import {
  createStateToken,
  generatePuzzle,
  isValidSolution,
  MAX_LEVEL,
  readStateToken,
  rotateCell,
} from "./_lib/game";

type GameRequest = {
  action?: unknown;
  level?: unknown;
  stateToken?: unknown;
  row?: unknown;
  column?: unknown;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let body: GameRequest;
    try {
      body = (await request.json()) as GameRequest;
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }

    try {
      switch (body.action) {
        case "new": {
          const level = body.level ?? 1;
          if (
            !Number.isInteger(level) ||
            Number(level) < 1 ||
            Number(level) > MAX_LEVEL
          ) {
            return json(
              { error: `Level must be an integer from 1 to ${MAX_LEVEL}` },
              400,
            );
          }
          const map = generatePuzzle(Number(level));
          return json({
            map,
            stateToken: createStateToken(Number(level), map),
          });
        }
        case "map": {
          const state = readStateToken(body.stateToken);
          return json({
            map: state.map,
            stateToken: createStateToken(state.level, state.map),
          });
        }
        case "rotate": {
          const state = readStateToken(body.stateToken);
          if (!Number.isInteger(body.row) || !Number.isInteger(body.column)) {
            return json({ error: "Row and column must be integers" }, 400);
          }
          const map = rotateCell(
            state.map,
            Number(body.row),
            Number(body.column),
          );
          return json({ map, stateToken: createStateToken(state.level, map) });
        }
        case "verify": {
          const state = readStateToken(body.stateToken);
          return json({
            correct: isValidSolution(state.map),
            stateToken: createStateToken(state.level, state.map),
          });
        }
        default:
          return json(
            { error: "Action must be new, map, rotate, or verify" },
            400,
          );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid game request";
      const status = message.includes("GAME_STATE_SECRET") ? 500 : 400;
      return json(
        { error: status === 500 ? "Game service is not configured" : message },
        status,
      );
    }
  },
};
