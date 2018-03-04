let grid;
let current;
let path = [];
let colors = {};
let running;

// DOM input
let fps_slider;
let reset_btn;

function setup() {
  // Canvas and colours
  createCanvas(600, 600);

  colors.visited = color(50, 50, 200);
  colors.current = color(0, 200, 100);
  colors.path = color(0, 200, 10, 50);

  // Grid generation
  let w = 40;
  let cols = floor(width / w);
  let rows = floor(height / w);

  grid = new Grid(rows, cols);
  grid.fill(w);

  // DOM inputs
  reset_btn = createButton('Reset');
  reset_btn.mousePressed(reset);

  fps_slider = createSlider(0, 100, 5);
  fps_slider.position(10, 10);

  running = false;
}

function reset() {
  current = undefined;
  path = [];
  grid.fill(grid.cells[0].w);
}

function draw() {
  frameRate(fps_slider.value());
  background(80);

  // Show cells
  grid.cells.forEach(cell => cell.show());

  // Highlight path
  if (path.length > 0) {
    path.forEach(cell => cell.highlight(colors.path));
  }

  if (!current) {
    running = false;
  } else {
    running = true;

    current.highlight(colors.current);
    current.visited = true;

    let next = grid.pickNext(current);
    if (next === undefined) {
      current = path.pop();
    } else {
      path.push(current);
      Cell.removeWall(current, next);
      current = next;
    }
  }
}

function mouseClicked() {
  if (grid.mouseOver()) {
		reset();
    current = grid.cells.find(cell => cell.mouseOver());
  }
}

class Grid {
  constructor(rows, cols) {
    this.cols = cols;
    this.rows = rows;
    this.cells = [];
  }

  fill(w) {
    this.cells = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.cells.push(new Cell(i, j, w))
      }
    }
  }

	mouseOver() {
		// Horribly inefficient placeholder check
		return this.cells.some(cell => cell.mouseOver());
	}

  neighbours(cell) {
    return this.cells.filter(other => other.dist(cell) == 1);
  }

  pickNext(current) {
    let neighbours = this.neighbours(current);
    let unvisited = neighbours.filter(cell => !cell.visited);
    return random(unvisited);
  }
}

class Cell {
  constructor(i, j, w) {
    this.i = i;
    this.j = j;
    this.w = w;

    this.setXY();

    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };

    this.visited = false;
  }

  setXY() {
    this.x = this.j * this.w;
    this.y = this.i * this.w;
  }

  dist(other) {
    return abs(this.i - other.i) + abs(this.j - other.j);
  }

  mouseOver() {
    return this.contains(mouseX, mouseY);
  }

  contains(x, y) {
    let w = this.w;

    if (x < this.x || x > this.x + w) {
      return false;
    }

    if (y < this.y || y > this.y + w) {
      return false;
    }

    return true;
  }

  highlight(color) {
    push();

    noStroke();
    fill(color);

    rect(this.x, this.y, this.w, this.w);

    pop();
  }

  show() {
    let x = this.x;
    let y = this.y;
    let w = this.w;

    if (this.visited) {
      noStroke();
      fill(colors.visited);

      rect(x, y, w, w);
    }

    stroke(250);
    strokeWeight(2);
    noFill();

    if (this.walls.top) {
      line(x, y, x + w, y);
    }
    if (this.walls.right) {
      line(x + w, y, x + w, y + w);
    }
    if (this.walls.bottom) {
      line(x + w, y + w, x, y + w);
    }
    if (this.walls.left) {
      line(x, y + w, x, y);
    }
  }

  static removeWall(a, b) {
    let di = a.i - b.i;
    let dj = a.j - b.j;

    if (dj == 1) {
      a.walls.left = false;
      b.walls.right = false;
    } else if (dj == -1) {
      b.walls.left = false;
      a.walls.right = false;
    }

    if (di == 1) {
      a.walls.top = false;
      b.walls.bottom = false;
    } else if (di == -1) {
      b.walls.top = false;
      a.walls.bottom = false;
    }
  }
}
