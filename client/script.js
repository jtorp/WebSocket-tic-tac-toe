let ws = new WebSocket('ws://localhost:8081');
let symbol = null;
let turn = null;
let isGameActive = false;
let serverMsg = '';
let cellsGrid = [
    '', '', '',
    '', '', '',
    '', '', ''
]

const wsMsg = document.getElementById('wsMessage');
const cells = document.querySelectorAll('.cell');
const players = document.getElementById('players');


ws.onmessage = (message) => {
    const response = JSON.parse(message.data);
    if (response.method === 'welcome') {
        players.textContent = `Players connected: ${response.connections}`
        wsMsg.textContent = response.message
    }

    if (response.method === 'join') {
        symbol = response.symbol;
        turn = response.turn;
        isGameActive = symbol === turn;
        updateMessage();
    }
    if (response.method === 'update') {
        turn = response.turn;
        cellsGrid = response.cellGrid
        isGameActive = symbol === turn;
        updateMessage();
        updateGrid();
    }
}
function updateMessage() {
    if (symbol === turn) {
        wsMsg.textContent = 'Your Move';
    } else {
        wsMsg.textContent = `Awaiting ${turn}'s turn`;
    }
}

function updateGrid() {
    cells.forEach((cell, index) => {
        cell.classList.remove('X', 'O');
        cellsGrid[index] !== '' && cell.classList.add(cellsGrid[index])
    })
}

cells.forEach((cell, index) => {
    cell.addEventListener('click', (event) => {
        makeMove(event.target, index);
    })
})

function makeMove(cell, index) {
    if (!isGameActive || cellsGrid[index] !== '') return;

    isGameActive = false;
    cell.classList.add(symbol);
    cellsGrid[index] = symbol;

    //tell server
    ws.send(JSON.stringify({
        'method': 'move',
        'symbol': symbol,
        'cellGrid': cellsGrid
    }))

}