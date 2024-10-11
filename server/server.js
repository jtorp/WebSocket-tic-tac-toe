
const colors = require('colors');
const log = console.log;

const winningCombinations = [
  
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6],
];

const http = require('http');
const WebSocket = require('ws');
const app = require('./game');
const httpServer = http.createServer();
const wss = new WebSocket.Server({ server: httpServer, clientTracking: true });



let clientIDCounter = 0;
const clientConnections = {};
let clientIDsWaitingConnection = [];
const opponents = {}


wss.on('error', (error) => {
    console.error('Server Error:', error);
});
function logConnectedClients() {
    wss.clients.forEach((client) => {
        console.log(`Client ID: ${client._socket.remoteAddress}`);
    });
}

function matchclients(clientID) {
    clientIDsWaitingConnection.push(clientID)
    if (clientIDsWaitingConnection.length < 2) {
        return
    };
    const clientID1 = clientIDsWaitingConnection.shift()
    const clientID2 = clientIDsWaitingConnection.shift()
    opponents[clientID1] = clientID2;
    opponents[clientID2] = clientID1;

    clientConnections[clientID1].send(JSON.stringify({
        method: 'join',
        symbol: 'X',
        turn: 'X',
        message: 'You have been matched with player ' + clientID2
    }))
    clientConnections[clientID2].send(JSON.stringify({
        method: 'join',
        symbol: 'O',
        turn: 'X',
        message: 'You have been matched with player ' + clientID1
    }))
}

function handleMove(result, clientID) {
    const opponentClientID = opponents[clientID];

    if (checkForWin(result.cellGrid)) {
        [clientID, opponentClientID].forEach((cID) => {
            clientConnections[cID].send(JSON.stringify({
                method: 'win',
                message: `Game over. ${result.symbol} won!`,
                cellGrid: result.cellGrid,
                combinations: winningCombinations
            }))
        })
        return
    }
    if (checkForDraw(result.cellGrid)) {
        [clientID, opponentClientID].forEach((cID) => {
            clientConnections[cID].send(JSON.stringify({
                method: 'draw',
                message: `Game over. It's a draw!`,
                cellGrid: result.cellGrid
            }))
        })
        return
    }

    [clientID, opponentClientID].forEach((cID) => {
        clientConnections[cID].send(JSON.stringify({
            method: 'update',
            turn: result.symbol === 'X' ? 'O' : 'X',
            cellGrid: result.cellGrid
        }))
    })
}
function createClientID() {
    clientIDCounter++
    return clientIDCounter
}

function checkForWin(cellGrid) {
    return winningCombinations.some(combination => {
        const [winningCell1, winningCell2, winningCell3] = combination;
        return cellGrid[winningCell1] !== '' && cellGrid[winningCell1] === cellGrid[winningCell2] && cellGrid[winningCell1] === cellGrid[winningCell3]
    })
}
function checkForDraw(cellGrid) {
    return cellGrid.every(cell => cell === 'X' || cell === 'O')

}
wss.on('connection', (connection) => {
    const clientID = createClientID();
    //const clientID = connection._socket.remoteAddress;
    console.log(`Client ${clientID} connected. Total connected clients: ${wss.clients.size}`);
    clientConnections[clientID] = connection;
    logConnectedClients();

    const startMsg = JSON.stringify({
        method: 'welcome',
        connections: wss.clients.size,
        message: 'Searching for an opponent...'
    })
    connection.send(startMsg)
    matchclients(clientID)

    connection.on('message', (message) => {
        const result = JSON.parse(message)
        if (result.method === 'move') {
            handleMove(result, clientID)
        }
    })
    connection.on('close', () => {
        closeClient(connection, clientID)
        log(`Client ${clientID} disconnected. Total connected clients: ${wss.clients.size} `);
        logConnectedClients();
    })
})

function closeClient(connection, clientID) {
    connection.close();
    //find who disconnected
    const disconnectedClient = clientIDsWaitingConnection.some(
        unmatchedClientID => unmatchedClientID === clientID);
    //if true delete clientID from clientIDsWaitingConnection
    if (disconnectedClient) {
        clientIDsWaitingConnection = clientIDsWaitingConnection.filter(
            unmatchedClientID => unmatchedClientID !== clientID
        )
    } else {
        // case when matched player disconnected from the game
        const opponentClientID = opponents[clientID];
        clientConnections[opponentClientID].send(JSON.stringify({
            method: 'left',
            message: `Searching for an opponent...`
        }))
    }
}

const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val
    }
    if (port >= 10) return port;
    return false
}
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
app.listen(port, () => console.log(`Server is listening on ${port}`))

