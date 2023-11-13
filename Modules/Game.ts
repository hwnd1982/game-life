import { EventEmiter } from "../services/EventEmiter"
import { Scene } from "../Types/types"

export class Game extends EventEmiter {
  #state: 'play' | 'end' = 'end'
  #width: number
  #height: number
  #scene: Scene
  #currentGenAlive: [number, number][] = []
  #nextGenAlive: [number, number][] = []
  #checkedCells: string[] = []
  #changedCells: [number, number, number][] = []
  #isCalculating: boolean = false

  constructor(width: number, height: number) {
    super();
    this.#width = width;
    this.#height = height;
    this.#scene = new Array(height).fill(0).map(() => new Array(width).fill(0));
  }

  get scene() {
    return this.#scene;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  set width(value: number) {
    if (value === this.#width) return;

    if (value < this.#width) {
      this.#scene.forEach(row => row.length = value);
    }

    if (value > this.#width) {
      this.#scene.forEach(row => row.push(...(new Array(value - this.#width).fill(0))));
    }

    this.#width = value;
  }

  set height(value: number) {
    if (value === this.#height) return;

    if (value < this.#height) {
      this.#scene.length = value;
    }

    if (value > this.#height) {
      this.scene.push(...(new Array(value - this.#height).fill(0).map(() => new Array(this.#width).fill(0))));
    }

    this.#height = value;
  }

  get change() {
    return this.#changedCells;
  }

  step() {
    if (this.#isCalculating) return;

    const start = Date.now();

    this.#isCalculating = true;
    this.#changedCells.length = 0;

    if (this.#state === 'end') {
      this.#state = 'play';
      this.emit('play');
    }

    for (let i = 0; i < this.#currentGenAlive.length; i++) {
      const [y, x] = this.#currentGenAlive[i];
      const cell = this.#scene[y][x];
      const id = `${y}/${x}`;

      if (cell && !this.#checkedCells.includes(id)) {
        this.#checkedCells.push(id);
        this.toBeAlive(y, x, cell);
      }
    }

    this.render();

    if (!this.#checkedCells.length || !this.#changedCells.length) {
      this.#state = 'end';
      this.emit('end');
    }

    this.reset();
    console.log('gen', Date.now() - start);
    this.#isCalculating = false;
  }

  toBeAlive(y: number, x: number, state: number) {
    let aliveNearby = 0, newState = 0;

    for (let i = y - 1; i <= y + 1; i++) {
      for (let j = x - 1; j <= x + 1; j++) {
        if (i !== y || j !== x) {
          const ny = (i + this.#height) % this.#height;
          const nx = (j + this.#width) % this.#width;
          const id = `${ny}/${nx}`;

          if (state && !this.#checkedCells.includes(id)) {
            this.#checkedCells.push(id);
            this.toBeAlive(ny, nx, this.#scene[ny][nx]);
          }

          aliveNearby += this.#scene[ny][nx];
        }
      }
    }

    if (
      (state && aliveNearby > 1 && aliveNearby < 4) ||
      (!state && aliveNearby === 3)
    ) {
      newState = 1;
      this.#nextGenAlive.push([y, x]);
    }

    if (this.#scene[y][x] !== newState) {
      this.#changedCells.push([y, x, newState]);
      this.emit('change', y, x, newState);
    }
  }

  render() {
    for (let i = 0; i < this.#changedCells.length; i++) {
      const [y, x, state] = this.#changedCells[i];
      this.#scene[y][x] = state;
    }
  }

  reset() {
    this.#currentGenAlive = [...this.#nextGenAlive];
    this.#nextGenAlive.length = 0;
    this.#checkedCells.length = 0;
  }

  fill(density: number = 5) {
    const start = Date.now();
    const count = Math.round(this.#width * this.#height / 100 * density);
    const cells: string[] = [];

    while (cells.length < count || cells.length < 5) {
      const x = Math.round(Math.random() * (this.#width - 1));
      const y = Math.round(Math.random() * (this.#height - 1));
      const id = `${y}/${x}`

      if (!cells.includes(id)) {
        this.emit('change', y, x, 1);
        this.#currentGenAlive.push([y, x]);
        this.#scene[y][x] = 1;

        cells.push(id);
      }
    }

    console.log('fill', Date.now() - start);
    return this
  }
}