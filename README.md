# [Tic-Tac-Toe 🔗](https://acute-ossified-utensil.glitch.me/)

This pet project is a real-time, multiplayer game built using Node.js and lightweight WebSockets. It connects two players, assigns X and O, and lets them play the classic 3x3 grid tic-tac-toe.

#### [Try the live demo](https://acute-ossified-utensil.glitch.me/)

> 
>  Open two browser tabs and test the multiplayer feature by playing against yourself.
> 
>  Share the link with a friend to play against each other in real-time.
>

## Built With

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)  
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)  
![WebSocket](https://img.shields.io/badge/WebSocket-0080FF?style=for-the-badge&logo=websocket&logoColor=white)  
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

## What's in this project?

- **`client/`**: Holds the basic HTML page, styling, and the script for managing game logic on the client side.
- **`server.js`**: The main server script that handles WebSocket connections and game state.

### Features

- [x] Real-time multiplayer support using WebSocket.
- [x] Players are automatically assigned the symbols "X" or "O".
- [x] Detects win conditions and handles game resets.
- [x] Displays messages and popup 💬 for wins and draws.

### Roadmap

- [ ] Play against an AI opponent (Minimax) 🤖.
- [ ] Implement automatic reconnection, fallbacks (e.g., to HTTP long-polling) 🔌 or simply use higher-level library _Socket.io_.

## Installation

You can set up the project locally and run the server by following the steps below.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) and npm installed on your machine.

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jtorp/WebSocket-tic-tac-toe.git

2. **Install dependancies:**

   ```bash
   npm install

3. **Update port confguration for local development:**

Make sure the WebSocket and HTTP servers are listening on appropriate ports. 
   ```javascript
const wss = new WebSocket.Server({ server: httpServer });
httpServer.listen(8080); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express app listening on ${PORT}`);
});

   ```
4. **Start both the WebSocket and Express app server:**

```
npm run start 
```
5. **Test in your browser:**

Open two tabs on http://localhost:3000 to simulate a multiplayer game locally.

## Deploying

Here are some options for deployment:

- **Vercel**: [Using Express with Vercel](https://vercel.com/guides/using-express-with-vercel)
- **Heroku**: [Deploying Node.js applications](https://devcenter.heroku.com/articles/deploying-nodejs)
- **Glitch**: I used [Glitch](https://glitch.com) with free 1000 hours.
