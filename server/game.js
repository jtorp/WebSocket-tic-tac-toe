const express = require('express');
const game = express();
const path = require('path');
const cors = require('cors');

game.use(cors(
    {
        origin: 'https://web-socket-tic-tac-toe-oh4d.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true
    }
));
game.use(express.static(path.join(__dirname, "..", "client")));

game.get('/help', (req, res) => {
    const date = new Date().toString().trim(20)
    const helpMsg = `<p>Players take turns putting their marks in empty squares. The first player to get 3 of her marks in a row (up, down, across, or diagonally) is the winner. When all 9 squares are full, the game is over. If no player has 3 marks in a row, the game ends in a tie </p>`
    res.send(`<main> ${date} ${helpMsg}
    </main>`);
})

module.exports = game