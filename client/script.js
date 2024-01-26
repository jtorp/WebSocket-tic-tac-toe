let ws = new WebSocket('ws://localhost:8081');
let symbol = null;
let turn = null;
let isGameActive = false;
let cellsGrid = [
    '', '', '',
    '', '', '',
    '', '', ''
]

const wsMsg = document.getElementById('wsMessage');
const cells = document.querySelectorAll('.cell');
const player = document.getElementById('player');
const refresh = document.getElementById('refresh');

ws.onmessage = (message) => {
    const response = JSON.parse(message.data);
    if (response.method === 'welcome') {
        // player.textContent = `player connected: ${response.connections}`
        wsMsg.textContent = response.message
    }

    if (response.method === 'join') {
        symbol = response.symbol;
        turn = response.turn;
        player.textContent = `${response.symbol}`
        player.classList.add('controls')
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
    if (response.method === 'result') {
        cellsGrid = response.cellGrid
        updateGrid();
        isGameActive = false;
        setTimeout(() => {
            wsMsg.textContent = response.message;
            confirm(`${response.message} \n Would you like to play again?`) ? startOver() : '';
        }, 300)
        
    }
    if (response.method === 'left') {
        isGameActive = symbol === turn;
        setTimeout(() => {
            wsMsg.textContent = response.message
        }, 200)
    }
}

function updateMessage() {
    wsMsg.textContent = symbol === turn ? 'Your Move' : `Awaiting ${turn}'s turn`;
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

    ws.send(JSON.stringify({
        'method': 'move',
        'symbol': symbol,
        'cellGrid': cellsGrid
    }))

}

function startOver() {
    window.location.reload();
}

refresh.addEventListener('click', startOver)