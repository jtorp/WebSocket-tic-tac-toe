// 
// TODO: handle winning( add a winning animation/pop up with who won)
// TODO: handle when opponent doesn't respond/disconnected
// TODO: minimax algorithm for computer to play
// TODO: READme file with gif
// TODO: netlify deploy
// TODO: check for console erros for icons



let ws = new WebSocket('ws://localhost:8081');
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
const refresh = document.getElementById('refresh');



const winningCombinations = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
];
ws.onmessage = (message) => {
    const response = JSON.parse(message.data);
    if (response.method === 'welcome') {
        player.textContent = `player connected: ${response.connections}`
        wsMsg.textContent = response.message
    }

    if (response.method === 'join') {
        symbol = response.symbol;
        turn = response.turn;
        player.innerHTML = `${response.symbol}`
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
    if (response.method === 'win') {
        cellsGrid = response.cellGrid
        updateGrid();
        isGameActive = false;
    }
    if (response.method === 'draw') {
        cellsGrid = response.cellGrid
        updateGrid();
        isGameActive = false;
        setTimeout(() => {
            wsMsg.textContent = response.message;
            showPopup(`${response.message}`, (result) => {
                result ? startOver() : '';
            })
        }, 1000)
    }
    if (response.method === 'left') {
        isGameActive = false;
        isGameActive = symbol === turn;
        setTimeout(() => {
            showPopup(`${response.message}`, (result) => {
                result ? startOver() : startOver();
            });
        }, 200);
    }
}

function updateMessage() {
    wsMsg.textContent = symbol === turn ? 'Your Move' : `Awaiting ${turn}'s turn`;
}

function updateGrid() {
    cells.forEach((cell, index) => {
        cell.classList.remove('X', 'O', 'winner');
        cellsGrid[index] !== '' && cell.classList.add(cellsGrid[index]);

        // Check if the current cell is part of any winning combination and add 'winner' class
        const isWinner = winningCombinations.some(combination => combination.includes(index) && combination.every(cellIndex => cellsGrid[cellIndex] === cellsGrid[index]));
        if (isWinner) {
            cellsGrid[index] !== '' && cell.classList.add('winner');
            if (cell.classList.contains('winner')) {
                confetti()
            } else {

                setTimeout(() => {
                    showPopup(`${response.message}`, (result) => {
                        result ? startOver() : '';
                    });
                }, 100)
            }
        }
    });
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

function showPopup(message, callback) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.textContent = message;

    const buttons = document.createElement('span');
    buttons.classList.add('buttons')
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('button-cancel')
    cancelButton.textContent = 'OK';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(popup);
        callback(false);
    });
    buttons.appendChild(cancelButton);
    popup.appendChild(buttons);

    document.body.appendChild(popup);
    // Remove the popup after 3000 milliseconds (3 seconds)
    setTimeout(() => {
        document.body.removeChild(popup);
        callback(false); // Assuming you want to trigger the callback with false when auto-removal occurs
    }, 3000);

    popup.addEventListener('click', () => {
        callback(true);
        popup.remove();
    });
}


function startOver() {
    window.location.reload();
}



refresh.addEventListener('click', startOver)