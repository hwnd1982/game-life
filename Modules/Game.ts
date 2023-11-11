export class Game {
  #width: number
  #height: number
  #current: number[][]
  #next: number[][]
  #checkedCells: string[] = []

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;
    this.#current = new Array(width).fill(0).map(() => new Array(height).fill(0));
    this.#next = new Array(width).fill(0).map(() => new Array(height).fill(0));
  }

  step() {
    for (let x = 0; x < this.#width; x++) {
      for (let y = 0; y < this.#height; y++) {
        const id = `${x}/${y}`;
        const cell = this.#current[x][y];

        if (cell && !this.#checkedCells.includes(id)) {
          this.toBeAlive(x, y, cell);
        }
      }
    }

    this.reset();

    return this.#current;
  }

  toBeAlive(x: number, y: number, state: number) {
    let aliveNearby = 0;

    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (i !== x || j !== y) {
          const nx = (i + this.#width) % this.#width;
          const ny = (j + this.#height) % this.#height;
          const id = `${nx}/${ny}`;

          if (!this.#checkedCells.includes(id)) {
            this.#checkedCells.push(id);
            this.toBeAlive(nx, ny, this.#current[nx][ny]);
          }

          aliveNearby += this.#current[nx][ny];
        }
      }
    }

    if (state && aliveNearby > 1 && aliveNearby < 4) {
      this.#next[x][y] = 1;
    }

    if (!state && aliveNearby === 3) {
      this.#next[x][y] = 1;
    }
  }

  reset() {
    this.#next.forEach((row, x) => row.forEach((cell, y) => {
      this.#current[x][y] = cell;
      this.#next[x][y] = 0;
      this.#checkedCells.length = 0;
    }));
  }

  setAlive(x: number, y: number) {
    this.#current[x][y] = 1;
  }
}