import { EventEmiter } from "../Services/EventEmiter"
import { Scene } from "../Types/types"

export class Game extends EventEmiter {
  #state: 'play' | 'pause' | 'stop' = 'stop'
  #gen: number = 0
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

    this.#scene[y][x] = state ? this.#gen + 1 : 0;
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
      this.emit('progress', progress, Date.now() - start);

      setTimeout(resolve);
    });
  }

  async step() {
    if (this.#isCalculating) return;

    const start = Date.now();

    this.#gen++;
    this.#isCalculating = true;
    this.#changedCells.length = 0;

    if (this.#state === 'stop' || this.#state === 'pause') {
      this.#state = 'play';
      this.emit('play');
    }

    for (let i = 0; i < this.#currentGenAlive.length; i++) {
      const [y, x] = this.#currentGenAlive[i];

      await this.toBeAlive(y, x);

      if (i && this.#currentGenAlive.length > 7500 && !(i % 1500)) {
        await this.progress(i / this.#currentGenAlive.length, start)
      }
    }

    if (!this.#checkedCells.length) {
      this.emit('stop');
    }

    if (!this.#changedCells.length) {
      this.emit('pause');
    }

    this.emit('gen', this.#gen, this.#nextGenAlive.length, Date.now() - start);
    this.reset();
    this.#isCalculating = false;
  }

  stop() {
    this.#state = 'stop';

    while (this.#currentGenAlive.length || this.#nextGenAlive.length) {
      if (this.#currentGenAlive.length) {
        const [y, x] = this.#currentGenAlive[this.#currentGenAlive.length - 1];
        this.setPoint(y, x, 0);
      }
      if (this.#nextGenAlive.length) {
        const [y, x] = this.#nextGenAlive[this.#nextGenAlive.length - 1];
        this.setPoint(y, x, 0);
      }
    }

    this.#changedCells.length = 0;
    this.#checkedCells.length = 0;
    this.#currentGenAlive.length = 0;
    this.#nextGenAlive.length = 0;
    this.#gen = 0;
  }

  async toBeAlive(y: number, x: number) {
    if (this.#checkedCells.includes(`${y}/${x}`)) return;

    return new Promise(async (resolve: (res: [number, number, number] | null) => void) => {

      this.#checkedCells.push(`${y}/${x}`);

      const state = this.#scene[y][x];

      const t = (y - 1 + this.#height) % this.#height;
      const l = (x - 1 + this.#width) % this.#width;
      const r = (x + 1 + this.#width) % this.#width;
      const b = (y + 1 + this.#height) % this.#height;

      const aliveNearby =
        +(this.#gen === this.#scene[t][l]) +
        +(this.#gen === this.#scene[t][x]) +
        +(this.#gen === this.#scene[t][r]) +
        +(this.#gen === this.#scene[y][l]) +
        +(this.#gen === this.#scene[y][r]) +
        +(this.#gen === this.#scene[b][l]) +
        +(this.#gen === this.#scene[b][x]) +
        +(this.#gen === this.#scene[b][r]);

      const stayAlive = state && aliveNearby > 1 && aliveNearby < 4;
      const newLive = !state && aliveNearby === 3;
      const isAlive = stayAlive || newLive;

      if (state) {
        await this.toBeAlive(t, l);
        await this.toBeAlive(t, x);
        await this.toBeAlive(t, r);
        await this.toBeAlive(y, l);
        await this.toBeAlive(y, r);
        await this.toBeAlive(b, l);
        await this.toBeAlive(b, x);
        await this.toBeAlive(b, r);
      }

      if (isAlive) {
        this.#nextGenAlive.push([y, x]);
        this.#scene[y][x] = this.#gen + 1;
      }

      if (!state === isAlive) {
        this.#changedCells.push([y, x, +isAlive]);
        this.#scene[y][x] = isAlive ? this.#gen + 1 : 0;
        resolve([y, x, +isAlive]);
      }

      resolve(null);
    }).then(res => {
      if (!res) return;

      this.emit('change', ...res);
    });
  }

  pause() {
    this.#state = 'pause';
  }

  reset() {
    this.#currentGenAlive = [...this.#nextGenAlive];
    this.#nextGenAlive.length = 0;
    this.#checkedCells.length = 0;
  }

  fill(density: number = 5) {
    if (this.#isCalculating || this.#state === 'play') return;

    this.#isCalculating = true;

    new Promise(async (resolve) => {
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
          this.#scene[y][x] = this.#gen + 1;

          cells.push(id);

          if (cells.length && !(cells.length % 10000)) {
            await this.progress(cells.length / count, start);
          }
        }
      }

      this.#isCalculating = false;
      this.emit(
        'fill',
        this.#currentGenAlive.length / (this.#width * this.#height) * 100,
        this.#currentGenAlive.length,
        Date.now() - start, cells.length
      );

      resolve(null);
    })

    return this
  }
}
