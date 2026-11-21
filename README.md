# Pipes Puzzle

A game client for a "Pipes" puzzle.

## How it works

When rotation of a puzzle part is made we go through the puzzle map and verify every element.\
Verifier knows which directions any possible element have
and checks if adjacent elements are directed to the verifying element.

## How to launch

###`npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Game backend

The client can use either the existing Elixir WebSocket server or the TypeScript
HTTP API in `api/game.ts`. Set `REACT_APP_GAME_TRANSPORT=http` to use the HTTP
API; the default is `websocket`. For local HTTP API development, configure
`REACT_APP_GAME_TRANSPORT=http` and `GAME_STATE_SECRET`, then run the project
with `npx vercel dev` so the API function is available. In production, set a
strong `GAME_STATE_SECRET` value in the Vercel project environment.

The HTTP API is stateless: it returns a signed, expiring token with each game
state update, so it does not need a process-local session or external database.

### Open the solution deployed in Vercel:

https://pipes-flame.vercel.app/
