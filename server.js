const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const app = express();
app.use(express.static(path.join(__dirname, "client")));
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

const clientConnections = {};
const opponents = {};
let clientIdsWaitingMatch = [];

function logConnectedClients() {
  wss.clients.forEach((client) => {
    console.log(`Client conencted: ${client._socket.remoteAddress}`);
  });
}

wss.on("connection", (connection) => {
  console.log("Client connected");
  logConnectedClients();

  connection.send(
    JSON.stringify({
      method: "welcome",
      connections: wss.clients.size,
      message: "Searching for an opponent...",
    })
  );

  const clientId = createClientId();
  clientConnections[clientId] = connection;

  matchClients(clientId);

  connection.on("message", (message) => {
    const result = JSON.parse(message);
    if (result.method === "move") {
      moveHandler(result, clientId);
    }
  });

  connection.on("close", () => {
    closeClient(connection, clientId);
  });
});

function matchClients(clientId) {
  clientIdsWaitingMatch.push(clientId);

  if (clientIdsWaitingMatch.length < 2) return;

  const firstClientId = clientIdsWaitingMatch.shift();
  const secondClientId = clientIdsWaitingMatch.shift();

  opponents[firstClientId] = secondClientId;
  opponents[secondClientId] = firstClientId;

  clientConnections[firstClientId].send(
    JSON.stringify({
      method: "join",
      symbol: "X",
      turn: "X",
    })
  );

  clientConnections[secondClientId].send(
    JSON.stringify({
      method: "join",
      symbol: "O",
      turn: "X",
    })
  );
}

function moveHandler(result, clientId) {
  const opponentClientId = opponents[clientId];
  const winningCombo = checkWin(result.field);

  if (winningCombo) {
    [clientId, opponentClientId].forEach((cId) => {
      clientConnections[cId].send(
        JSON.stringify({
          method: "win",
          message: `${result.symbol} wins`,
          field: result.field,
          winningCombo: winningCombo,
        })
      );
    });
    setTimeout(() => {
      resetGame(clientId, opponentClientId);
    }, 2000);
    return;
  }

  if (checkDraw(result.field)) {
    [clientId, opponentClientId].forEach((cId) => {
      clientConnections[cId].send(
        JSON.stringify({
          method: "draw",
          message: "Draw",
          field: result.field,
        })
      );
    });
    setTimeout(() => {
      resetGame(clientId, opponentClientId);
    }, 2000);
    return;
  }

  [clientId, opponentClientId].forEach((cId) => {
    clientConnections[cId].send(
      JSON.stringify({
        method: "update",
        turn: result.symbol === "X" ? "O" : "X",
        field: result.field,
      })
    );
  });
}

function resetGame(clientId, opponentClientId) {
  [clientId, opponentClientId].forEach((cId) => {
    clientConnections[cId].send(
      JSON.stringify({
        method: "reset",
      })
    );
  });
}

function closeClient(connection, clientId) {
  connection.close();
  const isLeftUnmatchedClient = clientIdsWaitingMatch.some(
    (unmatchedClientId) => unmatchedClientId === clientId
  );

  if (isLeftUnmatchedClient) {
    clientIdsWaitingMatch = clientIdsWaitingMatch.filter(
      (unmatchedClientId) => unmatchedClientId !== clientId
    );
  } else {
    const opponentClientId = opponents[clientId];
    if (clientConnections[opponentClientId]) {
      clientConnections[opponentClientId].send(
        JSON.stringify({
          method: "left",
          message: "Opponent left",
        })
      );
    }
  }
}

const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWin(field) {
  const winningCombo = winningCombos.find((combo) => {
    const [first, second, third] = combo;
    return (
      field[first] !== "" &&
      field[first] === field[second] &&
      field[first] === field[third]
    );
  });
  return winningCombo || null;
}

function checkDraw(field) {
  return field.every((symbol) => symbol === "X" || symbol === "O");
}

let clientIdCounter = 0;
function createClientId() {
  clientIdCounter++;
  return clientIdCounter;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});
