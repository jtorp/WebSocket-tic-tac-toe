//const ws = new WebSocket("wss://acute-ossified-utensil.glitch.me/");
const ws = new WebSocket("ws://localhost:8080/" || "ws://192.168.0.204:3000"); ;

const message = document.getElementById("message");
const cellsElements = document.querySelectorAll(".cell");
const resetButton = document.querySelector(".button-reset");

ws.onopen = () => {
  console.log("Connected to WebSocket server");
};

const cellElements = document.querySelectorAll(".cell");
const messageElement = document.querySelector(".message");

resetButton.addEventListener("click", () => {
  window.location.reload();
});

let field = ["", "", "", "", "", "", "", "", ""];
let isGameActive = false;
let symbol = null;
let turn = null;

const confettiColors = [
  "#F94144",
  "#F3722C",
  "#F8961E",
  "#F9C74F",
  "#90BE6D",
  "#43AA8B",
  "#577590",
  "#1D3557",
  "#ffffff",
];

function congrads() {
  confetti({
    particleCount: 400,
    spread: 400,
    gravity: 0,
    origin: { y: 0.7 },
    colors: confettiColors,
  });
}
function winAnimation(winningCombo) {
  winningCombo.forEach((index) => {
    cellsElements[index].classList.add("win-animation");
  });
}

function drawAnimation() {
  cellsElements.forEach((cell) => {
    cell.classList.add("draw-animation");
  });
}

ws.onmessage = (message) => {
  const response = JSON.parse(message.data);

  if (response.method === "welcome") {
    messageElement.textContent = response.message;
  }

  if (response.method === "join") {
    symbol = response.symbol;
    turn = response.turn;
    message.innerHTML = `${response.symbol}`;
    isGameActive = symbol === turn;
    updateMessage();
  }

  if (response.method === "update") {
    field = response.field;
    turn = response.turn;
    isGameActive = symbol === turn;
    updateBoard();
    updateMessage();
  }
  if (response.method === "win") {
    field = response.field;
    winAnimation(response.winningCombo);
    updateBoard();
    isGameActive = false;
    showPopup(`${response.message}`);
    congrads();
  }

  if (response.method === "draw") {
    field = response.field;
    drawAnimation();
    updateBoard();

    isGameActive = false;
    showPopup(`${response.message}`);
  }

  if (response.method === "left") {
    isGameActive = false;
    messageElement.textContent = response.message;
  }
};

cellElements.forEach((cell, index) =>
  cell.addEventListener("click", (event) => {
    makeMove(event.target, index);
  })
);

function makeMove(cell, index) {
  if (!isGameActive || field[index] !== "") {
    return;
  }
  // Check WebSocket state before trying to send
  if (ws.readyState !== WebSocket.OPEN) {
    alert("Connection is closed. Please refresh the page or try again later.");
    return;
  }

  isGameActive = false;
  cell.classList.add(symbol);
  field[index] = symbol;

  ws.send(
    JSON.stringify({
      method: "move",
      symbol: symbol,
      field: field,
    })
  );
}

function updateBoard() {
  cellElements.forEach((cell, index) => {
    cell.classList.remove("X", "O");
    field[index] !== "" && cell.classList.add(field[index]);
  });
}

function updateMessage() {
  if (symbol === turn) {
    messageElement.textContent = "Your move";
  } else {
    messageElement.textContent = `Waiting ${turn} move`;
  }
}
function resetGame() {
  field = ["", "", "", "", "", "", "", "", ""];
  updateBoard();
  isGameActive = true;
  // Remove any additional classes
  cellsElements.forEach((cell) => {
    cell.classList.remove("win-animation");
    cell.classList.remove("draw-animation");
  });
}

function showPopup(messageText) {
  const popupElement = document.querySelector(".popup");
  const overlayElement = document.querySelector(".overlay");
  const popupMessageElement = document.getElementById("popupMessage");
  const playAgainButtonElement = document.getElementById("playAgainButton");

  const winImageElement = document.querySelector(".win-image");
  const drawImageElement = document.querySelector(".draw-image");

  popupMessageElement.textContent = `${messageText} ₊ ⊹`;
  winImageElement.style.display = messageText === "Draw" ? "none" : "block";
  drawImageElement.style.display = messageText === "Draw" ? "block" : "none";

  setTimeout(() => {
    popupElement.style.display = "block";
    overlayElement.style.display = "block";
  }, 1500);

  playAgainButtonElement.onclick = () => {
    popupElement.style.display = "none";
    overlayElement.style.display = "none";
    resetGame();
  };
}
