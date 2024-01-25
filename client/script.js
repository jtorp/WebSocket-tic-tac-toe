let ws = new WebSocket('ws://localhost:8081');
let symbol = null;
let turn = null;
let isGameActive = false;
let serverMsg='';
let cellsGrid = [
    '', '', '',
    '', '', '',
    '', '', ''
]

const wsMsg = document.getElementById('wsMessage');
const cells = document.querySelectorAll('.cell');

cells.forEach((cell, index) => {
    cell.addEventListener('click', (event) => {
      makeMove(event.target, index);   
})
})

function makeMove(cell, index) {
}

ws.onmessage = (message) => {
    const response = JSON.parse(message.data);
    if (response.method === 'join') {
        symbol = response.symbol;
        turn = response.turn;
        isGameActive = symbol === turn;
        updateMessage();
    }
}

function updateMessage() {
    if (symbol === turn) {
        wsMsg.textContent = 'Your Move';
    } else {
        wsMsg.textContent = `Awaiting ${turn}'s turn`;
    }
}