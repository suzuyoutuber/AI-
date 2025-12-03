const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 80;
const BRICK_OFFSET_LEFT = 35;
const BRICK_WIDTH = (GAME_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
const BRICK_HEIGHT = 25;

// Set canvas size
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Colors
const COLORS = {
    paddle: '#00f2ff',
    ball: '#ffffff',
    brick: ['#ff0055', '#ff9900', '#ffff00', '#00ff66', '#00f2ff']
};

// Game State
let score = 0;
let lives = 3;
let gameRunning = false;
let animationId;

// Input Handling
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
canvas.addEventListener('click', startGame);

function keyDownHandler(e) {
    if (e.key == 'Right' || e.key == 'ArrowRight') {
        rightPressed = true;
    }
    else if (e.key == 'Left' || e.key == 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == 'Right' || e.key == 'ArrowRight') {
        rightPressed = false;
    }
    else if (e.key == 'Left' || e.key == 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('game-title').classList.add('hidden');
        document.getElementById('start-message').classList.add('hidden');
        draw();
    }
}

// Classes
class Paddle {
    constructor() {
        this.width = PADDLE_WIDTH;
        this.height = PADDLE_HEIGHT;
        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 7;
    }

    update() {
        if (rightPressed && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        else if (leftPressed && this.x > 0) {
            this.x -= this.speed;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 5);
        ctx.fillStyle = COLORS.paddle;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.paddle;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.dy = -4;
        this.radius = BALL_RADIUS;
    }

    update() {
        // Wall collisions
        if (this.x + this.dx > canvas.width - this.radius || this.x + this.dx < this.radius) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy < this.radius) {
            this.dy = -this.dy;
        } else if (this.y + this.dy > canvas.height - this.radius) {
            // Paddle collision check (simple)
            if (this.x > paddle.x && this.x < paddle.x + paddle.width) {
                // Calculate angle based on where it hit the paddle
                let hitPoint = this.x - (paddle.x + paddle.width / 2);
                hitPoint = hitPoint / (paddle.width / 2);

                let angle = hitPoint * (Math.PI / 3); // Max 60 degrees

                let speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                // Increase speed slightly
                speed = Math.min(speed * 1.05, 12);

                this.dx = speed * Math.sin(angle);
                this.dy = -speed * Math.cos(angle);

                createParticles(this.x, this.y, COLORS.paddle);
            } else {
                // Game Over logic placeholder
                lives--;
                if (!lives) {
                    // alert("GAME OVER");
                    document.location.reload();
                } else {
                    this.reset();
                    paddle.x = (canvas.width - paddle.width) / 2;
                }
            }
        }

        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.ball;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.ball;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

class Brick {
    constructor(c, r) {
        this.x = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
        this.y = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
        this.status = 1;
        this.color = COLORS.brick[r % COLORS.brick.length];
    }

    draw() {
        if (this.status == 1) {
            ctx.beginPath();
            ctx.roundRect(this.x, this.y, BRICK_WIDTH, BRICK_HEIGHT, 3);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.closePath();
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1.0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.05;
        this.size *= 0.95;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Initialization
const paddle = new Paddle();
const ball = new Ball();
const bricks = [];
let particles = [];

for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
    bricks[c] = [];
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricks[c][r] = new Brick(c, r);
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                if (ball.x > b.x && ball.x < b.x + BRICK_WIDTH && ball.y > b.y && ball.y < b.y + BRICK_HEIGHT) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    document.getElementById('score-display').innerText = `SCORE: ${score}`;
                    createParticles(ball.x, ball.y, b.color);

                    if (score == BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
                        // Win
                        alert("YOU WIN, CONGRATS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            bricks[c][r].draw();
        }
    }

    paddle.draw();
    ball.draw();

    // Particles
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });

    if (gameRunning) {
        paddle.update();
        ball.update();
        collisionDetection();
        requestAnimationFrame(draw);
    }
}

// Initial draw (static)
draw();
