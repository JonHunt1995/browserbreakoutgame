const game = {
  left: 0,
  right: 100,
  top: 0,
  bottom: 100,
  elem: document.querySelector("#game"),
}
game.rect = document.querySelector("#game").getBoundingClientRect();

class Brick {
  constructor(elem, i) {
    this.elem = elem;
    this.top = 12 + (Math.floor(i / 6) * 5);
    this.left = 10 + ((i % 6)*13.5);
    this.width = 12.5;
    this.height = 4;
    this.alive = true;
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
  }
// Left and Right Sides
  bouncedOffLeftRight(ballObject) {
    // Reject when ball is above or below brick
    if (ballObject.cy < this.top || ballObject.cy > this.bottom) {
      return false;
    }
    // Reject when ball is too far left of brick
    if (ballObject.cx + ballObject.radius < this.left) {
      return false;
    }
    // Reject if ball is too far right of brick
    return ballObject.cx - ballObject.radius <= this.right
  }
// Top and Down Sides
  bouncedOffTopDown(ballObject) {
    // Reject when ball is too far left or right
    if (ballObject.cx < this.left || ballObject.cx > this.right) {
      return false;
    }
    // Reject when ball is too high above brick
    if (ballObject.cy + ballObject.radius < this.top) {
      return false;
    }
    // Reject when ball is far below brick
    return ballObject.cy - ballObject.radius <= this.bottom
  }
}
const ball = {
  diameter: 4,
  radius: 2,
  speed: 0.5,
  cx: 50,
  cy: 93,
  elem: document.querySelector("#ball")
}

ball.xVelo = ball.speed * -1;
ball.yVelo = ball.speed * -1;

const paddle = {
  width: 20,
  top: 96,
  cx: 50,
  elem: document.querySelector("#paddle")
}

const bricks = [];
const brickGrid = document.querySelectorAll(".brick");

for (let i =0; i < brickGrid.length; i++) {
  bricks.push(new Brick(brickGrid[i], i));
}

console.log(bricks)
function updatePaddle(e) {
  if (e.pageX === undefined) {
    return;
  }
  let xPos = ((e.pageX - game.rect.left) * 100) / game.rect.width;
  xPos = Math.max(paddle.width / 2, xPos);
  xPos = Math.min(100 - paddle.width / 2, xPos);
  paddle.cx = xPos;
}

function updateBallPosition() {
  ball.cx += ball.xVelo;
  ball.cy += ball.yVelo;
}


function updateBallDirection() {
  if (Math.abs(ball.cx - paddle.cx) <= (paddle.width / 2)) {
  ball.cy = Math.min(paddle.top - ball.radius, ball.cy);
  }
  if (ballBouncesOffSides()) {ball.xVelo *= -1};
  if (ballBouncesOffTop()) {ball.yVelo *= -1};
  for (brick of bricks) {
    if (!brick.alive) {
      continue;
    }
    if (brick.bouncedOffLeftRight(ball)) {
      ball.xVelo *= -1;
      brick.alive = false; 
      brick.elem.style.opacity = '0';
    }
    if (brick.bouncedOffTopDown(ball)) {
      ball.yVelo *= -1;
      brick.alive = false; 
      brick.elem.style.opacity = '0';
    }
  }
  
  if (ballBouncesOffPaddle()) {
    ball.yVelo *= -1;
    // Change Velocity based off of position on paddle
    ball.yVelo = modifyYVeloOffPaddle();
    ball.xVelo = modifyXVeloOffPaddle();
  }
}

function modifyYVeloOffPaddle() {
  let yVelo = ball.yVelo;
  console.log(yVelo, 'ybefore');
  let changeToNeg = yVelo < 0;
  yVelo *= (0.5 + Math.abs(ball.cx - paddle.cx) / (paddle.width / 2));
  console.log(yVelo, 'yafter multiplier');
  yVelo = Math.min(2, Math.abs(yVelo));
  yVelo = Math.max(0.5, Math.abs(yVelo));
  console.log(yVelo, 'yafter');
  if (changeToNeg && yVelo > 0) {yVelo *= -1};
  return yVelo;
}

function modifyXVeloOffPaddle() {
  let changeToNeg = ball.xVelo < 0;
  let xVelo = (Math.abs(ball.cx - paddle.cx) / (paddle.width / 2));
  console.log(xVelo, "xVelo")
  // If hits left quadrant of paddle while going left to right
  // Switches direction
  if (ball.xVelo > 0 && ball.cx < (paddle.cx - (paddle.width / 4))) {
    xVelo *= -1;
  } else if (ball.xVelo < 0 && ball.cx > (paddle.cx + (paddle.width / 4))) {
    xVelo *= -1;
  }
  console.log(xVelo, 'x');
  if (changeToNeg) {xVelo *= -1};
  return xVelo;
}

function ballBouncesOffSides() {
  // If not at left edge, return if on right edge
  if ((ball.cx - ball.radius) > game.left) {
    return (ball.cx + ball.radius) >= game.right;
  }
  // Else we know that it's on the left side
  return true;
}

function ballBouncesOffTop() {
  return (ball.cy - ball.radius) <= game.top;
}

function ballBouncesOffPaddle() {
  if ((ball.cy + ball.radius) < paddle.top) {
    return false;
  }
  return Math.abs(ball.cx - paddle.cx) <= (paddle.width / 2);
}

function updateChanges() {
  updateBallPosition();
  updateBallDirection();
}

function renderBall() {
  ball.elem.style.left = `${ball.cx}%`;
  ball.elem.style.top = `${ball.cy}%`;
}

function renderPaddle() {
  paddle.elem.style.left = `${paddle.cx}%`;
}

document.querySelector("#screen").addEventListener("pointermove", updatePaddle);

function renderChanges() {
  renderBall();
  renderPaddle();
}

function isGameOver() {
  return ball.cy + ball.radius >= 100;
}

function hasWon() {
  return !bricks.some(brick => brick.alive);
}

function gameLoop() {
  updateChanges();
  renderChanges();
  if (isGameOver()) {
    paddle.elem.style.opacity = "0.2";
    game.elem.style.background = "darkred";
    return;
  }
  if (hasWon()) {
    paddle.elem.style.opacity = "0.2";
    game.elem.style.background = "green";
    return;
  }
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);