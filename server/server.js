const http = require('http');
const WebSocket = require('ws');
const app = require('./game');


const httpServer = http.createServer();
const wss = new WebSocket.Server({ server: httpServer, clientTracking: true });
httpServer.listen(8081, () => {
    console.log('HTTP Server listening on port 8081');
});

wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });
  function logConnectedClients() {
    console.log('Currently connected clients:');
    wss.clients.forEach((client) => {
      console.log(`Client ID: ${client._socket.remoteAddress}`);
    });
  }

  const clientConnections = {};
  let clientIDsWaitingConnection = new Set();
  let opponentMap = new Map();

  function matchclients(clientID){
    clientIDsWaitingConnection.add(clientID)
    if(clientIDsWaitingConnection.size < 2) {
        console.log('waiting for another client')
    };

    const clientID1 = clientIDsWaitingConnection.values().next().value
    const clientID2 = clientIDsWaitingConnection.values().next().value
    clientIDsWaitingConnection.delete(clientID1)
    clientIDsWaitingConnection.delete(clientID2)
    opponentMap.set(clientID1, clientID2)   
    opponentMap.set(clientID2, clientID1)

    clientConnections[clientID1].send(JSON.stringify({
        method: 'join',
        symbol: 'X',
        turn:'X',
        message: 'You have been matched with ' + clientID2
    }))
    clientConnections[clientID2].send(JSON.stringify({
        method: 'join',
        symbol: 'O',
        turn:'O',
        message: 'You have been matched with ' + clientID1
    }))
  }


wss.on('connection', (connection) => {
    const clientID = connection._socket.remoteAddress;
    clientConnections[clientID] = connection;
    matchclients(clientID)




    //connection sends message to client
    // console.log(`New client connected. Total connected clients: ${wss.clients.size}`);
    // logConnectedClients();
    // const msg = JSON.stringify({
    //     message: 'Welcome to the Tic Tac Toe Game, please wait for another player to connect'
    // })
    //connection.send(msg);
    //connection receives message from client
    connection.on('message', (message) => {
        const result = JSON.parse(message)
        console.log('Received message:', result);
       
    })
})

wss.on('close', () => {
    console.log(`Client disconnected. Total connected clients: ${wss.clients.size}`);
    logConnectedClients();
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

