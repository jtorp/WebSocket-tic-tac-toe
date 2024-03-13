// TODO: minimax algorithm for computer to play with computer
// TODO: add gif to README

let ws = new WebSocket('ws://web-socket-tic-tac-toe.vercel.app/:8081');
let symbol = null;
let turn = null;
let isGameActive = false;
let cellsGrid = [
    '', '', '',
    '', '', '',
    '', '', ''
];

const wsMsg = document.getElementById('wsMessage');
const cells = document.querySelectorAll('.cell');
const player = document.getElementById('player');
const timer = document.getElementById('speed-mode-timer');
const refresh = document.getElementById('refresh');

ws.onmessage = (message) => {
    const response = JSON.parse(message.data);
    if (response.method === 'welcome') {
        wsMsg.textContent = response.message
    }

    if (response.method === 'join') {
        symbol = response.symbol;
        turn = response.turn;
        wsMsg.innerHTML = `${response.symbol}`
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
    if (response.method === 'win') {
        cellsGrid = response.cellGrid
        updateGrid();
        winAnimation();
        isGameActive = false;
        wsMsg.textContent = response.message;
        setTimeout(() => {
            showPopup(`${response.message}`, () => {
                startOver();
            }, 1000)
        })
    }
    if (response.method === 'draw') {
        cellsGrid = response.cellGrid
        updateGrid();
        drawAnimation();
        isGameActive = false;
        wsMsg.textContent = response.message;
        setTimeout(() => {
            showPopup(`${response.message}`, () => {
                startOver();
            })
        }, 1000)

    }
    if (response.method === 'left') {
        isGameActive = false;
        isGameActive = symbol === turn;
        setTimeout(() => {
            showPopup(`${response.message}`, () => {
                startOver();
            });
        }, 1000);
    }
}

function updateMessage() {
    wsMsg.textContent = symbol === turn ? 'Your Move' : `Awaiting ${turn}'s turn`;
}

function updateGrid() {
    cells.forEach((cell, index) => {
        cell.classList.remove('X', 'O', 'winner');
        cellsGrid[index] !== '' && cell.classList.add(cellsGrid[index]);
      
    });
}
function drawAnimation(){
    cells.forEach((cell) => {
        cell.classList.add('draw');
    })
}
function winAnimation(){
    cells.forEach((cell) => {
        cell.classList.add('winner');
    })
    congrads()
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
    }));
}
function showPopup(message, callback) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = message;

    const buttons = document.createElement('span');
    buttons.classList.add('buttons');
    const okButton = document.createElement('button');
    okButton.classList.add('button-ok');
    okButton.textContent = 'OK';
    okButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        if (callback) callback(false);
    });
    buttons.appendChild(okButton);
    popup.appendChild(buttons);

    document.body.appendChild(popup);
    popup.addEventListener('click', () => {
        if (callback) callback(true);
        popup.remove();
    });
}

function startOver() {
    window.location.reload();
}

const confettiColors = ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590', '#1D3557', '#ffffff'];

function congrads() {
    confetti({ particleCount: 200, spread: 400, gravity: 0, origin: { y: 0.7 }, colors: confettiColors })    

}

refresh.addEventListener('click', startOver)