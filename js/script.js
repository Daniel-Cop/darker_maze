const MAZE = document.querySelector("#maze");
const FOG = document.querySelector("#fog-of-war");

let ctx = MAZE.getContext("2d");
let ctxFog = FOG.getContext("2d");

let generationComplete = false;

// Fog of Ward radius
let radius = localStorage.getItem("mazeSize") * 0.75;
let cellNum = localStorage.getItem("number");
let current;
let goal;
let multiverse = [];

let game = {
  over: false,
  victory: false,
  score: 1000,
  time: {
    start: null,
  },
};

class Maze {
  constructor(size, rows, columns) {
    this.size = size;
    this.rows = rows;
    this.columns = columns;
    this.grid = [];
    this.stack = [];
    this.solution;
  }

  // Set the grid: Create new this.grid array based on number of instance rows and columns
  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        // Create a new instance of the Cell class for each element in the 2D array and push to the maze grid array
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
    // Set the starting grid
    current = this.grid[0][0];
    this.grid[this.rows - 1][this.columns - 1].goal = true;
  }
  // Draw the canvas by setting the size and placing the cells in the grid array on the canvas.
  draw() {
    MAZE.width = this.size;
    MAZE.height = this.size;
    MAZE.style.background = "black";
    // Set the first cell as visited
    current.visited = true;
    // Loop through the 2d grid array and call the show method for each cell instance
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }
    // This function will assign the variable 'next' to random cell out of the current cells available neighbouting cells
    let next = current.checkNeighbours();
    // If there is a non visited neighbour cell
    if (next) {
      next.visited = true;
      // Add the current cell to the stack for backtracking
      this.stack.push(current);
      // this function will highlight the current cell on the grid. The parameter columns is passed
      // in order to set the size of the cell
      current.highlight(this.columns);
      // This function compares the current cell to the next cell and removes the relevant walls for each cell
      current.removeWalls(current, next);
      // Set the nect cell to the current cell
      current = next;

      // Else if there are no available neighbours start backtracking using the stack
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      current = cell;
      current.highlight(this.columns);
    }
    // If no more items in the stack then all cells have been visted and the function can be exited
    if (this.stack.length === 0) {
      generationComplete = true;
      current.highlight(this.columns);
      if (game.time.start === null) {
        game.time.start = new Date().getTime();
      }
      this.drawFoW(radius);

      return;
    }
    // Recursively call the draw function. This will be called up until the stack is empty
    // window.requestAnimationFrame(() => {
    //   this.draw();
    // });

    if (!generationComplete) {
      this.draw();
    }
  }

  drawFoW(rad) {
    FOG.height = this.size;
    FOG.width = this.size;

    let x =
      current.colNum * (this.size / this.columns) +
      this.size / this.columns / 2;
    let y =
      current.rowNum * (this.size / this.rows) + this.size / this.rows / 2;

    ctxFog.globalCompositeOperation = "xor";

    ctxFog.beginPath();

    ctxFog.arc(x, y, rad, 0, 2 * Math.PI);
    ctxFog.fillStyle = "red";
    ctxFog.fill();

    ctxFog.fillStyle = "black";
    ctxFog.fillRect(0, 0, FOG.width, FOG.height);
  }

  solver() {
    let explorer = this.grid[0][0];
    let goalReached = false;
    let tmp_branch = new Branch([explorer], this.grid);
    let counter = 0;
    multiverse.push(tmp_branch);
    while (!goalReached) {
      counter++;
      for (let branch of multiverse) {
        branch.step();
        branch.isArrived();
        if (branch.arrived || counter === 100) {
          console.log("end");
          goalReached = true;
          this.solution = branch;
          break;
        }
      }
    }
  }
}

class Cell {
  // Constructor takes in the rowNum and colNum which will be used as coordinates to draw on the canvas.
  constructor(rowNum, colNum, parentGrid, parentSize) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    // parentGrid is passed in to enable the checkneighbours method.
    // parentSize is passed in to set the size of each cell on the grid
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
    this.goal = false;
    this.torch = false;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    // The following lines push all available neighbours to the neighbours array
    // undefined is returned where the index is out of bounds (edge cases)
    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 - 1 ? grid[row][col - 1] : undefined;

    // if the following are not 'undefined' then push them to the neighbours array
    if (top && !top.visited) {
      neighbours.push(top);
    }
    if (right && !right.visited) {
      neighbours.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbours.push(bottom);
    }
    if (left && !left.visited) {
      neighbours.push(left);
    }

    // Choose a random neighbour from the neighbours array
    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }

  // Wall drawing functions for each cell. Will be called if relevent wall is set to true in cell constructor
  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }
  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }
  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }
  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  // Highlights the current cell on the grid. Columns is once again passed in to set the size of the grid.
  highlight(columns) {
    // Additions and subtractions added so the highlighted cell does cover the walls
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;

    ctx.fillStyle = "purple";
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }

  removeWalls(cell1, cell2) {
    // compares to two cells on x axis
    let x = cell1.colNum - cell2.colNum;
    // Removes the relevant walls if there is a different on x axis
    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }
    // compares to two cells on x axis
    let y = cell1.rowNum - cell2.rowNum;
    // Removes the relevant walls if there is a different on x axis
    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }
  }

  // Draws each of the cells on the maze canvas
  show(size, rows, columns) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;

    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;

    if (this.walls.topWall) {
      this.drawTopWall(x, y, size, columns, rows);
    }
    if (this.walls.rightWall) {
      this.drawRightWall(x, y, size, columns, rows);
    }
    if (this.walls.bottomWall) {
      this.drawBottomWall(x, y, size, columns, rows);
    }
    if (this.walls.leftWall) {
      this.drawLeftWall(x, y, size, columns, rows);
    }
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
    if (this.goal) {
      ctx.fillStyle = "rgb(83,247,43)";
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
  }

  checkPath(comingFrom) {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let walls = {
      topWall: this.walls.topWall,
      rightWall: this.walls.rightWall,
      bottomWall: this.walls.bottomWall,
      leftWall: this.walls.leftWall,
    };
    let possibileWay = [];

    // The following lines push all available neighbours to the neighbours array
    // undefined is returned where the index is out of bounds (edge cases)
    let top =
      !walls.topWall && comingFrom !== grid[row - 1][col]
        ? grid[row - 1][col]
        : undefined;
    let right =
      !walls.rightWall && comingFrom !== grid[row][col + 1]
        ? grid[row][col + 1]
        : undefined;
    let bottom =
      !walls.bottomWall && comingFrom !== grid[row + 1][col]
        ? grid[row + 1][col]
        : undefined;
    let left =
      !walls.leftWall && comingFrom !== grid[row][col - 1]
        ? grid[row][col - 1]
        : undefined;

    // if the following are not 'undefined' then push them to the neighbours array
    if (top) {
      possibileWay.push(top);
    }
    if (right) {
      possibileWay.push(right);
    }
    if (bottom) {
      possibileWay.push(bottom);
    }
    if (left) {
      possibileWay.push(left);
    }

    return possibileWay;
    // // Choose a random neighbour from the neighbours array
    // if (neighbours.length !== 0) {
    //   let random = Math.floor(Math.random() * neighbours.length);
    //   return neighbours[random];
    // } else {
    //   return undefined;
    // }
  }
}

class Branch {
  constructor(path, grid) {
    this.path = path;
    this.grid = grid;
    this.deadEnd = false;
    this.arrived = false;
    this.lastStep = null;
  }

  isArrived() {
    for (let cell of this.path) {
      if (cell.rowNum === cellNum - 1 && cell.colNum === cellNum - 1) {
        this.arrived = true;
        break;
      }
    }
  }

  clone() {
    let clone = new Branch(this.path, this.grid);
    clone.lastStep = this.lastStep;
    return clone;
  }

  step() {
    const LAST_CELL_VISITED = this.path[this.path.length - 1];
    let finder = this.grid[LAST_CELL_VISITED.rowNum][LAST_CELL_VISITED.colNum];

    let possibleDirection = finder.checkPath(this.lastStep);
    console.log(finder);
    console.log(possibleDirection);

    for (let i = 0; i < possibleDirection.length; i++) {
      if (i === possibleDirection.length - 1) {
        let next = possibleDirection[i];
        this.lastStep = finder;
        this.path.push(next);
      } else {
        let clone = this.clone();
        let next = possibleDirection[i];
        clone.lastStep = finder;
        clone.path.push(next);
        // let cloneBranch = new Branch(this.path, this.grid);
        // let cloneNext = possibleDirection[i];
        // cloneBranch.lastStep = finder;
        // cloneBranch.path.push(cloneNext);
        // multiverse.push(cloneBranch);
      }
    }
  }
}

// const clone = structuredClone(object);
