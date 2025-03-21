const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let dropSpeed = 500; // Tiempo inicial para la caída
let dropInterval;

highScoreElement.textContent = highScore;

const tetrominos = [
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]],       // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 1, 1, 1]],         // I
    [[1, 1, 0], [1, 1, 0]], // L
    [[0, 1, 0], [1, 1, 1]]  // J
];

let currentTetromino = getRandomTetromino();
let currentPos = { x: 4, y: 0 };

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== 0) {
                context.fillStyle = 'lime';
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#222';
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawTetromino() {
    const shape = currentTetromino[currentPos.y % currentTetromino.length];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                context.fillStyle = 'red';
                context.fillRect((currentPos.x + x) * BLOCK_SIZE, (currentPos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#222';
                context.strokeRect((currentPos.x + x) * BLOCK_SIZE, (currentPos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function getRandomTetromino() {
    return tetrominos[Math.floor(Math.random() * tetrominos.length)];
}

function collision() {
    const shape = currentTetromino[currentPos.y % currentTetromino.length];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] && (board[currentPos.y + y] && board[currentPos.y + y][currentPos.x + x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function rotate() {
    currentTetromino = currentTetromino[0].map((_, index) =>
        currentTetromino.map(row => row[index])
    );
    if (collision()) {
        currentTetromino = currentTetromino[0].map((_, index) =>
            currentTetromino.map(row => row[row.length - 1 - index])
        );
    }
}

function moveDown() {
    currentPos.y++;
    if (collision()) {
        currentPos.y--;
        placeTetromino();
        reset();
        checkRows();
    }
}

function moveLeft() {
    currentPos.x--;
    if (collision()) currentPos.x++;
}

function moveRight() {
    currentPos.x++;
    if (collision()) currentPos.x--;
}

function placeTetromino() {
    const shape = currentTetromino[currentPos.y % currentTetromino.length];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                board[currentPos.y + y][currentPos.x + x] = 1;
            }
        }
    }
}

function checkRows() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += 200 * linesCleared;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
        }
        increaseSpeed();
    }
}

function increaseSpeed() {
    if (score >= 200 && score % 200 === 0) {
        dropSpeed = Math.max(100, dropSpeed - 50); // Aumentar la velocidad pero sin hacerla demasiado rápida
        clearInterval(dropInterval);
        dropInterval = setInterval(moveDown, dropSpeed);
    }
}

function reset() {
    currentTetromino = getRandomTetromino();
    currentPos = { x: 4, y: 0 };
    if (collision()) {
        gameOver();
    }
}

function gameOver() {
    alert("Game Over! Puntaje final: " + score);
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    scoreElement.textContent = score;
    reset();
}

document.getElementById('moveLeft').addEventListener('click', moveLeft);
document.getElementById('moveRight').addEventListener('click', moveRight);
document.getElementById('rotate').addEventListener('click', rotate);
document.getElementById('moveDown').addEventListener('click', moveDown);

function gameLoop() {
    drawBoard();
    drawTetromino();
    moveDown();
}

dropInterval = setInterval(gameLoop, dropSpeed);
