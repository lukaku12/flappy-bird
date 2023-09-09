const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const startGameText = document.getElementById('startGame');
const scoreHtml = document.getElementById('score');


function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
let gameSpeed = 2;
const MAX_GAME_SPEED = 5;
const BIRD_X_POSITION = 100;
let gameIsStarted = false;
let gameScore = 0;

window.addEventListener('resize', () => { setCanvasSize(); window.location.reload(); });
window.addEventListener('keypress', (e) => {
    startGame(e.key);
    bird.jump(e.key);
});
setCanvasSize();

class Bird {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speedX = 0;
        this.speedY = 0;
        this.gravity = 0.05;
        this.gravitySpeed = 0;
        this.isJumping = false;
        this.birdImage = new Image();
        this.birdImage.src = 'assets/images/bird-wings-up.png';
    }

    draw() {
        ctx.rect(this.x, this.y, this.width, this.height);

        ctx.drawImage(this.birdImage, this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.isColidingWithBottomBorder()) {
            this.gravitySpeed = 0;
            this.y = canvas.height - this.height;
        } else {
            this.gravitySpeed += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY + this.gravitySpeed;
        }
    }

    jump(key) {
        if (key === ' ') {
            if (this.isJumping) return;
            this.birdImage.src = 'assets/images/bird-wings-down.png'
            this.isJumping = true;
            this.gravitySpeed = 0;
            this.gravity = 0;

            const positionYBeforeJump = this.y;

            const interval = setInterval(() => {
                if (this.y <= positionYBeforeJump - 50 || this.isColidingWithTopBorder()) {
                    this.gravity = 0.05;
                    this.gravitySpeed = 0;
                    this.isJumping = false;
                    this.birdImage.src = 'assets/images/bird-wings-up.png'
                    clearInterval(interval);
                } else {
                    this.y -= 1.2;
                }
            }, 1)
        }
    }

    isColidingWithBottomBorder() {
        return this.y + this.height >= canvas.height;
    }

    isColidingWithTopBorder() {
        return this.y <= 0;
    }

    collidesWith(tube) {
        return (
            (this.x < tube.firstX + tube.firstWidth &&
                this.x + this.width > tube.firstX &&
                this.y < tube.firstY + tube.firstHeight &&
                this.y + this.height > tube.firstY)
            ||
            (this.x < tube.secondX + tube.secondWidth &&
                this.x + this.width > tube.secondX &&
                this.y < tube.secondY + tube.secondHeight &&
                this.y + this.height > tube.secondY)
        );
    }

    reset() {
        this.x = BIRD_X_POSITION;
        this.y = canvas.height / 2 - 50;
        this.gravitySpeed = 0;
    }
}

class Background {
    constructor() {
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'assets/background/background.jpg';
        this.firstImageX = 0;
        this.secondImageX = canvas.width;
        this.speed = gameSpeed;
    }

    draw() {
        ctx.drawImage(
            this.backgroundImage,
            this.firstImageX,
            0,
            canvas.width,
            canvas.height
        );
        ctx.drawImage(
            this.backgroundImage,
            this.secondImageX,
            0,
            canvas.width,
            canvas.height
        );
    }

    animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw();

        if (this.firstImageX <= -canvas.width) {
            this.firstImageX = 0;
        } else {
            this.firstImageX -= this.speed;
        }

        if (this.secondImageX <= 0) {
            this.secondImageX = canvas.width;
        } else {
            this.secondImageX -= this.speed;
        }

    }
}

class Tube {
    constructor() {
        this.firstY = 0;
        this.firstWidth = 120;
        this.firstHeight = 400;
        this.firstX = canvas.width;

        this.secondWidth = 120;
        this.secondHeight = 332;
        this.secondX = canvas.width;
        this.secondY = canvas.height - this.secondHeight - 78;
        this.isReadyToDelete = false;
        this.gapBetweenTubes = 145;

        this.tubeHeadWidth = 40;

        this.generateRandomTubes();
    }

    draw() {
        ctx.fillRect(this.firstX, this.firstY, this.firstWidth, this.firstHeight);

        ctx.fillRect(this.firstX - this.tubeHeadWidth / 4,
            this.firstY + this.firstHeight - this.tubeHeadWidth,
            this.firstWidth + this.tubeHeadWidth / 2,
            this.tubeHeadWidth);

        ctx.fillRect(this.secondX, this.secondY, this.secondWidth, this.secondHeight);

        ctx.fillRect(this.secondX - this.tubeHeadWidth / 4,
            this.secondY,
            this.secondWidth + this.tubeHeadWidth / 2,
            this.tubeHeadWidth);

        ctx.fillStyle = 'green';
    }

    animate() {
        if (this.firstX >= -this.firstWidth - this.tubeHeadWidth) {
            this.firstX -= gameSpeed;
        } else {
            this.delete();
        }

        if (this.secondX >= -this.secondWidth - this.tubeHeadWidth) {
            this.secondX -= gameSpeed;
        } else {
            this.delete();
        }
    }

    generateRandomTubes() {
        const number = this.generateNumber(1, 2);
        if (number === 1) {
            this.generateRandomTubeFirst();
        }
        if (number === 2) {
            this.generateRandomTubeSecond();
        }
    }

    generateRandomTubeFirst() {
        const totalHeight = canvas.height;
        const minHeight = canvas.height / 10;
        this.firstHeight = this.generateNumber(totalHeight / 2, minHeight);
        this.secondHeight = totalHeight - this.firstHeight - this.gapBetweenTubes;
        this.secondY = canvas.height - this.secondHeight;
    }

    generateRandomTubeSecond() {
        const totalHeight = canvas.height;
        const minHeight = canvas.height / 10;
        this.secondHeight = this.generateNumber(totalHeight / 2, minHeight);
        this.firstHeight = totalHeight - this.secondHeight - this.gapBetweenTubes;
        this.secondY = canvas.height - this.secondHeight;
    }

    generateNumber(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    delete() {
        this.isReadyToDelete = true;
    }
}

const background = new Background();
const bird = new Bird(BIRD_X_POSITION, canvas.height / 2 - 50, 50, 50);

let spawnTubeInterval = setInterval(spawnTubes, setTubeSpawnInterval());

function setTubeSpawnInterval() {
    if (gameSpeed >= 2 && gameSpeed < 3) {
        return 2000 - (gameSpeed * 100);
    }
    else if (gameSpeed > 3 && gameSpeed < 4) {
        return 2000 - (gameSpeed * 150);
    }
    else if (gameSpeed > 4 && gameSpeed < 6) {
        return 2000 - (gameSpeed * 200);
    }
}

let tubes = [];

function spawnTubes() {
    if (gameIsStarted) {
        clearInterval(spawnTubeInterval);
        tubes.push(new Tube());
        spawnTubeInterval = setInterval(spawnTubes, setTubeSpawnInterval());
    };
}

function animate() {
    background.draw();
    if (gameIsStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.animate();
        bird.draw();
        bird.update();
        tubes.forEach((tube) => {
            tube.draw();
            tube.animate();
            if (bird.collidesWith(tube)) {
                endGame();
            }
            bird.collidesWith(tube);
            if (tube.isReadyToDelete) {
                // remove tube when it exits screen
                tubes.shift();
                gameScore += 1;
                scoreHtml.innerText = gameScore;
            };
        });
    }
    requestAnimationFrame(animate);
}

animate();

let gameSpeedInterval;
function increaseGameSpeed() {
    gameSpeedInterval = setInterval(() => {
        if (gameIsStarted) {
            if (gameSpeed >= MAX_GAME_SPEED) return;
            gameSpeed += 0.1;
        }
    }, 2000)
}
increaseGameSpeed();

function startGame(key) {
    if (!gameIsStarted) {
        if (key === ' ') {
            gameIsStarted = true;
            increaseGameSpeed();
            startGameText.style.visibility = 'hidden';
        }
    }
}

function endGame() {
    gameIsStarted = false;
    startGameText.innerText = 'Score: ' + gameScore + '. Press Space To Restart.';
    startGameText.style.visibility = 'visible';
    gameScore = 0;
    scoreHtml.innerText = gameScore;
    tubes = [];
    gameSpeed = 2;
    clearInterval(gameSpeedInterval);
    bird.reset();
}