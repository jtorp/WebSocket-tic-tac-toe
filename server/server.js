const http = require('http');
const WebSocket = require('ws');
const app = require('./game');


const httpServer = http.createServer();
const wss = new WebSocket.Server({ server: httpServer, clientTracking: true });
httpServer.listen(8081, () => {
    console.log('HTTP Server listening on port 8081');
});

wss.on('error', (error) => {
    console.error('Server Error:', error);
  });
  function logConnectedClients() {
    console.log('Currently connected clients:');
    wss.clients.forEach((client) => {
      console.log(`Client ID: ${client._socket.remoteAddress}`);
    });
  }

  let clientIDCounter=0;
  const clientConnections = {};
  let clientIDsWaitingConnection = [];
  const opponents ={}

  function matchclients(clientID){
    clientIDsWaitingConnection.push(clientID)
    if(clientIDsWaitingConnection.length < 2) {
        return
    };

    const clientID1 = clientIDsWaitingConnection.shift()
    const clientID2 = clientIDsWaitingConnection.shift()
    //opponets gets matche with each other
    opponents[clientID1] = clientID2;
    opponents[clientID2] = clientID1;

    clientConnections[clientID1].send(JSON.stringify({
        method: 'join',
        symbol: 'X',
        turn:'X',
        message: 'You have been matched with player ' + clientID2
    }))
    clientConnections[clientID2].send(JSON.stringify({
        method: 'join',
        symbol: 'O',
        turn:'X',
        message: 'You have been matched with player ' + clientID1
    }))
  }

  function handleMove(result, clientID){
    const opponentClientID = opponents[clientID];
    [clientID, opponentClientID].forEach((cID) => {
        clientConnections[cID].send(JSON.stringify({
            method: 'update',
            turn: result.symbol === 'X' ? 'O' : 'X',
            cellGrid: result.cellGrid
        }))
    })
}
  function closeClient(connection, clientID){
      connection.close();

  }

function createClientID() {
     clientIDCounter++
     return clientIDCounter
}


//server wss connection
wss.on('connection', (connection) => {
    const clientID = createClientID();
    //const clientID = connection._socket.remoteAddress;
    clientConnections[clientID] = connection;

       //connection sends message to client console.log(`New client connected. Total connected clients: ${wss.clients.size}`);
       logConnectedClients();

       const startMsg = JSON.stringify({
           method: 'welcome',
           connections: wss.clients.size,
           message: 'Welcome. Searching opponent...'
       })
       connection.send(startMsg)
       matchclients(clientID)
 
    //connection receives message from client
    connection.on('message', (message) => {
        const result = JSON.parse(message)
        if (result.method === 'move') {
            handleMove(result, clientID)
        }       
    })
    connection.on('close', () => {
        closeClient(connection, clientID)
        console.log(`Client ${clientID} disconnected. Total connected clients: ${wss.clients.size}`);
        logConnectedClients();
    })
})

const normalizePort = (val) => {
        const port = parseInt(val, 10);
        if(isNaN(port)){
            return val
        }
        if (port>=10) return port;
        return false
}
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
app.listen(port, () => console.log(`Server is listening on ${port}` ))

