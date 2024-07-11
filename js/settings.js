const SCORE_DISPLAY = document.querySelector("#display-score");
const TIME_DISPLAY = document.querySelector("#display-time");
let mazeSize = localStorage.getItem("mazeSize");
let number = localStorage.getItem("number");

let timeInterval;
let newMaze;

document.addEventListener("keydown", move);

async function generateMaze() {
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  await newMaze.draw();
  timeInterval = setInterval(displayTime, 10);
}

function move(e) {
  if (!generationComplete) return;
  let key = e.key;
  let row = current.rowNum;
  let col = current.colNum;
  if (radius > 10) {
    radius -= 10;
  } else {
    gameOver();
  }
  if (game.score > 0) {
    game.score -= 10;
  }
  SCORE_DISPLAY.innerText = game.score;
  if (!game.over) {
    switch (key) {
      case "ArrowUp":
        if (!current.walls.topWall) {
          let next = newMaze.grid[row - 1][col];
          current = next;
          newMaze.draw();

          current.highlight(newMaze.columns);
          // if (current.goal);
        }
        break;

      case "ArrowRight":
        if (!current.walls.rightWall) {
          let next = newMaze.grid[row][col + 1];
          current = next;
          newMaze.draw();

          current.highlight(newMaze.columns);
        }
        break;

      case "ArrowDown":
        if (!current.walls.bottomWall) {
          let next = newMaze.grid[row + 1][col];
          current = next;
          newMaze.draw();

          current.highlight(newMaze.columns);
        }
        break;

      case "ArrowLeft":
        if (!current.walls.leftWall) {
          let next = newMaze.grid[row][col - 1];
          current = next;
          newMaze.draw(radius);
          current.highlight(newMaze.columns);
        }
        break;
    }
  }
  if (current.goal) {
    game.victory = true;
    gameOver();
  }
}

function displayTime() {
  let chrono = Date.now() - game.time.start;
  let ms = chrono % 1000 > 9 ? chrono % 1000 : `0${chrono % 1000}`;
  chrono = (chrono - ms) / 1000;
  let secs = chrono % 60 > 9 ? chrono % 60 : `0${chrono % 60}`;
  chrono = (chrono - secs) / 60;
  let mins = chrono % 60 > 9 ? chrono % 60 : `0${chrono % 60}`;
  TIME_DISPLAY.innerText = `${mins}:${secs}:${Math.floor(ms / 10)}`;
}

function gameOver() {
  clearInterval(timeInterval);
  game.time.end = new Date().getTime();
  game.over = true;

  ctxFog.globalCompositeOperation = "source-over";
  ctxFog.clearRect(0, 0, FOG.width, FOG.height);
  ctxFog.fillStyle = "black";
  ctxFog.globalAlpha = 0.8;
  ctxFog.fillRect(0, 0, FOG.width, FOG.height);

  ctxFog.globalAlpha = 1;
  ctxFog.fillStyle = "white";
  ctxFog.font = "36px monospace";
  ctxFog.textAlign = "center";
  ctxFog.textBaseline = "middle";
  ctxFog.fillText("GAME OVER", FOG.width / 2, FOG.height / 2);
  ctxFog.font = "18px monospace";
  ctxFog.fillText(
    `Time : ${TIME_DISPLAY.innerText}`,
    FOG.width / 2,
    FOG.height / 2 + 80
  );
  ctxFog.fillText(`Score : ${game.score}`, FOG.width / 2, FOG.height / 2 + 40);
}

generateMaze();
//newMaze.solver();
