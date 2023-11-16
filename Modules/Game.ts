import { EventEmiter } from "../Services/EventEmiter"
import { Scene } from "../Types/types"

export class Game extends EventEmiter {
  #state: 'play' | 'pause' | 'stop' = 'stop'
  #gen: number = 0
  #width: number
  #height: number
  #scene: Scene
  #newScene: Scene
  #currentGenAlive: [number, number][] = []
  #nextGenAlive: [number, number][] = []
  #checkedCells: string[] = []
  #changedCells: { [key: string]: number }
  #isCalculating: boolean = false

  constructor(width: number, height: number) {
    super();
    this.#width = width;
    this.#height = height;
    this.#scene = new Array(height).fill(0).map(() => new Array(width).fill(0));
    this.#newScene = new Array(height).fill(0).map(() => new Array(width).fill(0));
  }

  getState(y: number, x: number) {
    return this.#scene[y][x];
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
      this.#scene.push(...(new Array(value - this.#height).fill(0).map(() => new Array(this.#width).fill(0))));
    }

    this.#height = value;
  }

  get state() {
    return this.#state;
  }

  get change() {
    return this.#changedCells;
  }

  setPoint(y: number, x: number, state: number) {
    if (this.#state === 'play' || y >= this.#height || x >= this.#width) return;

    const index = this.#currentGenAlive.findIndex(point => x === point[1] && y === point[0]);
    const isAdd = index === -1 && state;
    const isRemove = index !== -1 && !state;

    this.#scene[y][x] = state ? 1 : 0;
    if (isAdd) {
      this.#currentGenAlive.push([y, x]);
    }

    if (isRemove) {
      this.#currentGenAlive.splice(index, 1);
    }

    if (isAdd || isRemove) {
      this.emit('change', y, x, state);
      this.emit(
        'fill',
        this.#currentGenAlive.length / (this.#width * this.#height) * 100,
        this.#currentGenAlive.length,
        0,
        0
      );
    }
  }

  async progress(progress: number, start: number) {
    return new Promise((resolve) => {
      this.emit('progress', progress, performance.now() - start);

      setTimeout(resolve);
    });
  }

  async step() {
    if (this.#isCalculating) return;

    let interval = performance.now();
    const start = performance.now();
    const startCount = this.#currentGenAlive.length;

    this.#gen++;
    this.#isCalculating = true;
    this.#changedCells = {};

    if (this.#state === 'stop' || this.#state === 'pause') {
      this.#state = 'play';
      this.emit('play');
    }

    while (this.#currentGenAlive.length) {
      const [y, x] = this.#currentGenAlive[this.#currentGenAlive.length - 1];

      this.#currentGenAlive.length -= 1;
      this.toBeAlive(y, x);

      if (performance.now() - interval > 500) {
        interval = performance.now();
        await this.progress((startCount - this.#currentGenAlive.length) / startCount, start)
      }
    }

    if (!this.#checkedCells.length) {
      this.emit('stop');
    }

    if (!Object.keys(this.#changedCells).length) {
      this.emit('pause');
    }

    this.emit('gen', this.#gen, this.#nextGenAlive.length, performance.now() - start);
    this.reset();
    this.#isCalculating = false;
  }

  stop() {
    this.#state = 'stop';

    this.#scene = new Array(this.#height).fill(0).map(() => new Array(this.#width).fill(0));
    this.#newScene = new Array(this.#height).fill(0).map(() => new Array(this.#width).fill(0));

    while (this.#currentGenAlive.length || this.#nextGenAlive.length) {
      if (this.#currentGenAlive.length) {
        const [y, x] = this.#currentGenAlive[this.#currentGenAlive.length - 1];
        this.setPoint(y, x, 0);
      }
      if (this.#nextGenAlive.length) {
        const [y, x] = this.#nextGenAlive[this.#nextGenAlive.length - 1];

        this.emit('change', y, x, 0);
        this.#nextGenAlive.length -= 1;
      }
    }

    this.#changedCells = {};
    this.#checkedCells.length = 0;
    this.#currentGenAlive.length = 0;
    this.#nextGenAlive.length = 0;
    this.#gen = 0;
  }

  moveDiagonal(y: number, x: number, offsetY: number, offsetX: number, partial: number) {
    if (!this.#checkedCells[`${y}/${x}`]) {
      this.checkCell(y, x, partial + this.#scene[
        (y + offsetY + this.#height) % this.#height
      ][
        (x + offsetX + this.#width) % this.#width
      ]);
    }
  }

  moveSide(y: number, x: number, offsetY: number, offsetX: number, partial: number) {
    const res: number[] = [];

    if (offsetY) {
      res.push(
        this.#scene[(y + offsetY + this.#height) % this.#height][(x - 1 + this.#width) % this.#width],
        this.#scene[(y + offsetY + this.#height) % this.#height][x],
        this.#scene[(y + offsetY + this.#height) % this.#height][(x + 1 + this.#width) % this.#width]
      );
    }

    if (offsetX) {
      res.push(
        this.#scene[(y - 1 + this.#height) % this.#height][(x + offsetX + this.#width) % this.#width],
        this.#scene[y][(x + offsetX + this.#width) % this.#width],
        this.#scene[(y + 1 + this.#height) % this.#height][(x + offsetX + this.#width) % this.#width]
      );
    }

    if (!this.#checkedCells[`${y}/${x}`]) {
      this.checkCell(y, x, partial + res[0] + res[1] + res[2]);
    }

    return res;
  }

  checkCell(y: number, x: number, aliveNearby: number) {
    const stayAlive = this.#scene[y][x] && aliveNearby > 1 && aliveNearby < 4;
    const newLive = !this.#scene[y][x] && aliveNearby === 3;
    const isAlive = stayAlive || newLive;

    this.#checkedCells.push(`${y}/${x}`);

    if (isAlive) {
      this.#nextGenAlive.push([y, x]);
      this.#newScene[y][x] = 1;
    }

    if (!this.#scene[y][x] === isAlive) {
      this.#changedCells[`${y}/${x}`] = +isAlive;
      this.#newScene[y][x] = +isAlive;
    }

    if (this.#scene[y][x]) {
      const index = this.#currentGenAlive.findIndex(point => y === point[0] && x === point[1]);

      if (index !== -1) {
        this.#currentGenAlive.splice(index, 1);
      }
    }

    this.emit('change', y, x, +isAlive);
  }

  toBeAlive(y: number, x: number) {
    if (this.#checkedCells.includes(`${y}/${x}`)) return;

    this.#checkedCells.push(`${y}/${x}`);

    const t = (y - 1 + this.#height) % this.#height;
    const l = (x - 1 + this.#width) % this.#width;
    const r = (x + 1 + this.#width) % this.#width;
    const b = (y + 1 + this.#height) % this.#height;

    const aliveNearby =
      this.#scene[t][l] +
      this.#scene[t][x] +
      this.#scene[t][r] +
      this.#scene[y][l] +
      this.#scene[y][r] +
      this.#scene[b][l] +
      this.#scene[b][x] +
      this.#scene[b][r];

    const topPartial = this.moveSide(t, x, -1, 0,
      this.#scene[t][l] +
      this.#scene[t][r] +
      this.#scene[y][l] +
      this.#scene[y][r] +
      this.#scene[y][x]
    );

    const rightPartial = this.moveSide(y, r, 0, 1,
      this.#scene[t][r] +
      this.#scene[t][x] +
      this.#scene[b][x] +
      this.#scene[b][r] +
      this.#scene[y][x]
    );

    const bottomPartial = this.moveSide(b, x, 1, 0,
      this.#scene[y][l] +
      this.#scene[y][r] +
      this.#scene[b][l] +
      this.#scene[b][r] +
      this.#scene[y][x]
    );

    const leftPartial = this.moveSide(y, l, 0, -1,
      this.#scene[t][l] +
      this.#scene[t][x] +
      this.#scene[b][l] +
      this.#scene[b][x] +
      this.#scene[y][x]
    );

    this.moveDiagonal(t, r, -1, 1,
      topPartial[1] +
      topPartial[2] +
      rightPartial[0] +
      rightPartial[1] +
      this.#scene[t][x] +
      this.#scene[y][r] +
      this.#scene[y][x]
    );

    this.moveDiagonal(b, r, 1, 1,
      bottomPartial[1] +
      bottomPartial[2] +
      rightPartial[1] +
      rightPartial[2] +
      this.#scene[b][x] +
      this.#scene[y][r] +
      this.#scene[y][x]
    );

    this.moveDiagonal(b, l, 1, -1,
      bottomPartial[0] +
      bottomPartial[1] +
      leftPartial[1] +
      leftPartial[2] +
      this.#scene[b][x] +
      this.#scene[y][l] +
      this.#scene[y][x]
    );

    this.moveDiagonal(t, l, -1, -1,
      topPartial[0] +
      topPartial[1] +
      leftPartial[0] +
      leftPartial[1] +
      this.#scene[t][x] +
      this.#scene[y][l] +
      this.#scene[y][x]
    );

    if (!this.#checkedCells[`${y}/${x}`]) {
      this.checkCell(y, x, aliveNearby);
    }
  }

  pause() {
    this.#state = 'pause';
  }

  reset() {
    this.#currentGenAlive = [...this.#nextGenAlive];
    this.#scene = this.#newScene;
    this.#newScene = new Array(this.#height).fill(0).map(() => new Array(this.#width).fill(0));
    this.#nextGenAlive.length = 0;
    this.#checkedCells.length = 0;
  }

  async fill(density: number = 5) {
    if (this.#isCalculating || this.#state === 'play') return;

    this.#isCalculating = true;

    let interval = performance.now();
    const start = performance.now();
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

        if (performance.now() - interval > 500) {
          interval = performance.now();
          await this.progress(cells.length / count, start);
        }
      }
    }

    this.#isCalculating = false;
    this.emit(
      'fill',
      this.#currentGenAlive.length / (this.#width * this.#height) * 100,
      this.#currentGenAlive.length,
      performance.now() - start, cells.length
    );

    return this
  }

  getGen() {
    return { currentGen: this.#currentGenAlive, newGen: this.#nextGenAlive, state: this.#state }
  }
}
