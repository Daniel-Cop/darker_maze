let mazeSize = localStorage.getItem("mazeSize");
let number = localStorage.getItem("number");

let newMaze;

document.addEventListener("keydown", move);

function generateMaze() {
  newMaze = new Maze(mazeSize, number, number);
  newMaze.setup();
  newMaze.draw();
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

function gameOver() {
  console.log("Game Over");
}

generateMaze();
newMaze.draw(radius);
