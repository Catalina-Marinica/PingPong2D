const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

const hitSound = new Audio('../Sounds/hitSound.wav')
const scoreSound = new Audio('../Sounds/scoreSound.wav')
const wallHitSound = new Audio('../Sounds/wallHitSound.wav')

const netWidth = 4
const netHeight = canvas.height

const paddleWidth = 10
const paddleHeight = 100

let user1Up = false
let user1Down = false
let user2Up = false
let user2Down = false

const net = {
    x: canvas.width / 2 - netWidth / 2,
    y: 0,
    width: netWidth,
    height: netHeight,
}

let user1 = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    score: 0
}

let user2 = {
    x: canvas.width - (paddleWidth + 10),
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    score: 0
}

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    speed: 7,
    velocityX: 5,
    velocityY: 5,
}

function drawBoard() {
    context.fillStyle = "black"
    context.fillRect(0, 0, canvas.width, canvas.height)
}

function drawNet() {
    context.fillStyle = "white"
    context.fillRect(net.x, net.y, net.width, net.height)
}

function drawScore(x, y, score) {
    context.fillStyle = "white"
    context.font = "35px Noto Serif"
    context.fillText(score, x, y)
}

function drawPaddle(x, y, width, height) {
    context.fillStyle = "white"
    context.fillRect(x, y, width, height)
}

function drawBall(x, y, radius) {
    context.fillStyle = "red"
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.closePath()
    context.fill()
}

function drawGame() {
    drawBoard()
    drawNet()
    drawScore(canvas.width / 4, canvas.height / 8, user1.score)
    drawPaddle(user1.x, user1.y, user1.width, user1.height)
    drawScore(3 * canvas.width / 4, canvas.height / 8, user2.score)
    drawPaddle(user2.x, user2.y, user2.width, user2.height)
    drawBall(ball.x, ball.y, ball.radius)
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(event) {
    const keyCode = event.keyCode
    if (keyCode == 38) user1Up = true
    if (keyCode == 40) user1Down = true
    if (keyCode == 87) user2Up = true
    if (keyCode == 83) user2Down = true
}

function keyUpHandler(event) {
    const keyCode = event.keyCode
    if (keyCode == 38) user1Up = false
    if (keyCode == 40) user1Down = false
    if (keyCode == 87) user2Up = false
    if (keyCode == 83) user2Down = false
}

function resetBall() {
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
    ball.speed = 7
    // changes the direction of ball
    ball.velocityX = -ball.velocityX
    ball.velocityY = -ball.velocityY
}

function paddlesUpdate() {
    if (user1Up && user1.y - 8 > 0)
        user1.y -= 8
    else if (user1Down && (user1.y + 8 < canvas.height - user1.height))
        user1.y += 8

    if (user2Up && user2.y - 8 > 0)
        user2.y -= 8
    else if (user2Down && (user2.y + 8 < canvas.height - user2.height))
        user2.y += 8
}

function collisionWalls() {
    // top & bottom
    if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
        wallHitSound.play()
        ball.velocityY = -ball.velocityY
    }
    // right
    if (ball.x + ball.radius >= canvas.width) {
        scoreSound.play()
        user1.score += 1
        resetBall()
    }
    // left
    if (ball.x - ball.radius <= 0) {
        scoreSound.play()
        user2.score += 1
        resetBall()
    }
}

function collisionWithPlayer(player, ball) {
    player.top = player.y
    player.right = player.x + player.width
    player.bottom = player.y + player.height
    player.left = player.x

    ball.top = ball.y - ball.radius
    ball.right = ball.x + ball.radius
    ball.bottom = ball.y + ball.radius
    ball.left = ball.x - ball.radius

    return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top
}

function collisionPaddle() {
    let player = user2
    if (ball.x < canvas.width / 2) player = user1

    if (collisionWithPlayer(player, ball)) {
        hitSound.play()
        let angle = 0
        if (ball.y < (player.y + player.height / 2)) {
            angle = -1 * Math.PI / 4 // reflect -45deg
        }
        else if (ball.y > (player.y + player.height / 2)) {
            angle = Math.PI / 4 // reflect 45deg
        }
        // change directions
        if (player === user2)
            ball.velocityX = -1 * ball.speed * Math.cos(angle)
        else
            ball.velocityX = ball.speed * Math.cos(angle)
        ball.velocityY = ball.speed * Math.sin(angle)
        // increase ball speed
        ball.speed += 0.2
    }
}

function update() {
    paddlesUpdate()
    collisionWalls()
    ball.x += ball.velocityX
    ball.y += ball.velocityY
    collisionPaddle()
}

function gameLoop() {
    update()
    drawGame()
    if (user1.score >= 10 || user2.score >= 10) {
        clearInterval(game)
        context.fillStyle = "white"
        context.fillRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2)
        context.fillStyle = "black"
        context.font = "37px Noto Serif"
        context.fillText("GAME OVER", 5 * canvas.width / 16, 15 * canvas.height / 32)
        context.fillStyle = "black"
        context.font = "23px Noto Serif"
        if (user1.score > user2.score)
            context.fillText("Player1 wins", 12 * canvas.width / 32, 19 * canvas.height / 32)
        else
            context.fillText("Player2 wins", 12 * canvas.width / 32, 19 * canvas.height / 32)
    }

}

function newGame(){
    user1.x = 10
    user1.y = canvas.height / 2 - paddleHeight / 2
    user1.width = paddleWidth
    user1.height = paddleHeight
    user1.score = 0

    user2.x = canvas.width - (paddleWidth + 10)
    user2.y = canvas.height / 2 - paddleHeight / 2
    user2.width = paddleWidth
    user2.height = paddleHeight
    user2.score = 0

    ball.x = canvas.width / 2
    ball.y = canvas.height / 2
    ball.radius = 7
    ball.speed = 7
    ball.velocityX = 5
    ball.velocityY = 5
}

var game;
drawGame()
const button = document.querySelector("button")
button.addEventListener("click", function (event) {
    newGame()
    clearInterval(game)
    game = setInterval(gameLoop, 1000 / 60)

})


