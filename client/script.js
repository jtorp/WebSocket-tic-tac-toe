let ws = new WebSocket('ws://localhost:8081');
const wsMsg =document.getElementById('ws')
ws.onmessage =  (msg) => {
    const resp = JSON.parse(msg.data);
    console.log(resp)
    if(resp.message.includes('Welcome to the Tic Tac Toe Game')) {
        document.getElementById('ws').innerHTML = resp.message
    }
ws.send(JSON.stringify({message: 'Hi, from client'}))
}