const express = require('express');
const game = express();
const path = require('path');

game.use(express.static(path.join(__dirname, "..", "client")));

game.get('/help', (req, res) => {
    const date = new Date().toString().trim(20)
    const helpMsg = `<p>Check Internet Connection: Ensure that your device has a stable internet connection.
    Restart the Game: Close and reopen the game to refresh the connection.
    Update the App: Make sure you have the latest version of the Tic Tac Toe app installed.
    Device Restart: Occasionally, restarting your device can help resolve connectivity issues.
    Contact Support: If problems persist, reach out to the game's support team for assistance.} </p>`
    res.send(`<main> ${date} ${helpMsg}
    </main>`);
})

module.exports = game