import { CellController } from "../Controllers/CellController"
import { EventEmiter } from "../Services/EventEmiter"
import { Nearest, Scene, Task } from "../Types/types"

export class Game extends EventEmiter {
  #state: 'play' | 'pause' | 'stop' = 'stop'
  #gen: number = 0
  #width: number
  #height: number
  #scene: Scene
  #newScene: Scene
  #cells: CellController
  #currentGenAlive: [number, number][] = []
  #nextGenAlive: [number, number][] = []
  #checkedCells: string[] = []
  #changedCells: { [key: string]: number }
  #stepTask: [number, number, Task][] = []
  #isCalculating: boolean = false

  constructor(height: number, width: number) {
    super();
    this.#width = width;
    this.#height = height;
    this.#cells = new CellController(height, width);
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

  get state() {
    return this.#state;
  }

  get change() {
    return this.#changedCells;
  }

  set width(value: number) {
    if (value === this.#width) return;

    if (value < this.#width) {
      this.#scene.forEach(row => row.length = value);
      this.#newScene.forEach(row => row.length = value);
    }

    if (value > this.#width) {
      this.#scene.forEach(row => row.push(...(new Array(value - this.#width).fill(0))));
      this.#newScene.forEach(row => row.push(...(new Array(value - this.#width).fill(0))));
    }

    this.#width = value;
    this.#cells.width = value;
  }

  set height(value: number) {
    if (value === this.#height) return;

    if (value < this.#height) {
      this.#scene.length = value;
      this.#newScene.length = value;
    }

    if (value > this.#height) {
      this.#scene.push(...(new Array(value - this.#height).fill(0).map(() => new Array(this.#width).fill(0))));
      this.#newScene.push(...(new Array(value - this.#height).fill(0).map(() => new Array(this.#width).fill(0))));
    }

    this.#height = value;
    this.#cells.height = value;
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
        1
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

    while (this.#currentGenAlive.length || this.#stepTask.length) {
      if (this.#cells.task.length) {
        const [y, x, done] = this.#cells.task[this.#cells.task.length - 1];

        this.#cells.task.length -= 1;
        this.toBeAlive(y, x, done);
      }
      // if (this.#stepTask.length) {
      //   const [y, x, done] = this.#stepTask[this.#stepTask.length - 1];

      //   this.#stepTask.length -= 1;
      //   this.toBeAlive(y, x, done);
      // }

      if (!this.#stepTask.length && this.#currentGenAlive.length) {
        const [y, x] = this.#currentGenAlive[this.#currentGenAlive.length - 1];

        this.#currentGenAlive.length -= 1;
        this.toBeAlive(y, x);
      }

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

  moveDiagonal(y: number, x: number, offsetY: number, offsetX: number, part: number) {
    const [dy, dx] = [
      (y + offsetY + this.#height) % this.#height,
      (x + offsetX + this.#width) % this.#width
    ];

    if (!this.#checkedCells[`${y}/${x}`]) {
      this.checkCell(y, x, part + this.#scene[dy][dx]);
    }

    return this.#scene[dy][dx];
  }

  moveSide(y: number, x: number, offsetY: number, offsetX: number, part: number) {
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
      this.checkCell(y, x, part + res[0] + res[1] + res[2]);
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

  toBeAlive(y: number, x: number, done?: { top?: boolean, right?: boolean, bottom?: boolean, lift?: boolean }) {
    const t = (y - 1 + this.#height) % this.#height;
    const l = (x - 1 + this.#width) % this.#width;
    const r = (x + 1 + this.#width) % this.#width;
    const b = (y + 1 + this.#height) % this.#height;

    const nearest: Nearest = [
      this.#scene[t][x],
      this.#scene[t][r],
      this.#scene[y][r],
      this.#scene[b][r],
      this.#scene[b][x],
      this.#scene[b][l],
      this.#scene[y][l],
      this.#scene[t][l]
    ];
    this.#cells.cell(y, x, nearest, this.#scene[y][x], done || {})

    this.checkCell(y, x,
      this.#scene[t][x] +
      this.#scene[t][r] +
      this.#scene[y][r] +
      this.#scene[b][r] +
      this.#scene[b][x] +
      this.#scene[b][l] +
      this.#scene[y][l] +
      this.#scene[t][l]
    );
    // if (this.#checkedCells.includes(`${y}/${x}`)) return;

    // this.#checkedCells.push(`${y}/${x}`);

    // const t = (y - 1 + this.#height) % this.#height;
    // const l = (x - 1 + this.#width) % this.#width;
    // const r = (x + 1 + this.#width) % this.#width;
    // const b = (y + 1 + this.#height) % this.#height;

    // const aliveNearby =
    //   this.#scene[t][l] +
    //   this.#scene[t][x] +
    //   this.#scene[t][r] +
    //   this.#scene[y][l] +
    //   this.#scene[y][r] +
    //   this.#scene[b][l] +
    //   this.#scene[b][x] +
    //   this.#scene[b][r];

    // const top = done?.top || this.moveSide(t, x, -1, 0,
    //   this.#scene[t][l] +
    //   this.#scene[t][r] +
    //   this.#scene[y][l] +
    //   this.#scene[y][r] +
    //   this.#scene[y][x]
    // );

    // const right = done?.right || this.moveSide(y, r, 0, 1,
    //   this.#scene[t][r] +
    //   this.#scene[t][x] +
    //   this.#scene[b][x] +
    //   this.#scene[b][r] +
    //   this.#scene[y][x]
    // );

    // const bottom = done?.bottom || this.moveSide(b, x, 1, 0,
    //   this.#scene[y][l] +
    //   this.#scene[y][r] +
    //   this.#scene[b][l] +
    //   this.#scene[b][r] +
    //   this.#scene[y][x]
    // );

    // const left = done?.left || this.moveSide(y, l, 0, -1,
    //   this.#scene[t][l] +
    //   this.#scene[t][x] +
    //   this.#scene[b][l] +
    //   this.#scene[b][x] +
    //   this.#scene[y][x]
    // );

    // const tr = this.moveDiagonal(t, r, -1, 1,
    //   top[1] +
    //   top[2] +
    //   right[0] +
    //   right[1] +
    //   this.#scene[t][x] +
    //   this.#scene[y][r] +
    //   this.#scene[y][x]
    // );

    // const br = this.moveDiagonal(b, r, 1, 1,
    //   bottom[1] +
    //   bottom[2] +
    //   right[1] +
    //   right[2] +
    //   this.#scene[b][x] +
    //   this.#scene[y][r] +
    //   this.#scene[y][x]
    // );

    // const bl = this.moveDiagonal(b, l, 1, -1,
    //   bottom[0] +
    //   bottom[1] +
    //   left[1] +
    //   left[2] +
    //   this.#scene[b][x] +
    //   this.#scene[y][l] +
    //   this.#scene[y][x]
    // );

    // const tl = this.moveDiagonal(t, l, -1, -1,
    //   top[0] +
    //   top[1] +
    //   left[0] +
    //   left[1] +
    //   this.#scene[t][x] +
    //   this.#scene[y][l] +
    //   this.#scene[y][x]
    // );

    // if (!this.#checkedCells[`${y}/${x}`]) {
    //   this.checkCell(y, x, aliveNearby);
    // }

    // if (top[0]) {
    //   const ty = (y - 2 + this.#height) % this.#height;
    //   const tx = (x - 1 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].bottom = [left[1], this.#scene[y][l], this.#scene[y][x]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { bottom: [left[1], this.#scene[y][l], this.#scene[y][x]] }]);
    //     }
    //   }
    // }

    // if (top[1]) {
    //   const ty = (y - 2 + this.#height) % this.#height;
    //   const tx = x;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].bottom = [this.#scene[y][l], this.#scene[y][x], this.#scene[y][r]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { bottom: [this.#scene[y][l], this.#scene[y][x], this.#scene[y][r]] }]);
    //     }
    //   }
    // }

    // if (top[2]) {
    //   const ty = (y - 2 + this.#height) % this.#height;
    //   const tx = (x + 1 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].bottom = [this.#scene[y][x], this.#scene[y][r], right[1]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { bottom: [this.#scene[y][x], this.#scene[y][r], right[1]] }]);
    //     }
    //   }
    // }

    // if (right[0]) {
    //   const ty = (y - 1 + this.#height) % this.#height;
    //   const tx = (x + 2 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].left = [top[1], this.#scene[t][x], this.#scene[y][x]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { left: [top[1], this.#scene[t][x], this.#scene[y][x]] }]);
    //     }
    //   }
    // }

    // if (right[1]) {
    //   const ty = y
    //   const tx = (x + 2 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].left = [this.#scene[t][x], this.#scene[y][x], this.#scene[b][x]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { left: [this.#scene[t][x], this.#scene[y][x], this.#scene[b][x]] }]);
    //     }
    //   }
    // }

    // if (right[2]) {
    //   const ty = (y + 1 + this.#height) % this.#height;
    //   const tx = (x + 2 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].left = [this.#scene[t][x], this.#scene[b][x], bottom[1]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { left: [this.#scene[t][x], this.#scene[b][x], bottom[1]] }]);
    //     }
    //   }
    // }

    // if (bottom[0]) {
    //   const ty = (y + 2 + this.#height) % this.#height;
    //   const tx = (x - 1 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].top = [left[1], this.#scene[y][l], this.#scene[y][x]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { top: [left[1], this.#scene[y][l], this.#scene[y][x]] }]);
    //     }
    //   }
    // }

    // if (bottom[1]) {
    //   const ty = (y + 2 + this.#height) % this.#height;
    //   const tx = x;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].top = [this.#scene[y][l], this.#scene[y][x], this.#scene[y][r]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { top: [this.#scene[y][l], this.#scene[y][x], this.#scene[y][r]] }],);
    //     }
    //   }
    // }

    // if (bottom[2]) {
    //   const ty = (y + 2 + this.#height) % this.#height;
    //   const tx = (x + 1 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].top = [this.#scene[y][x], this.#scene[y][r], right[1]];
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { top: [this.#scene[y][x], this.#scene[y][r], right[1]] }]);
    //     }
    //   }
    // }

    // if (left[0]) {
    //   const ty = (y - 1 + this.#height) % this.#height;
    //   const tx = (x - 2 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].right = [top[1], this.#scene[t][x], this.#scene[y][x]]
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { right: [top[1], this.#scene[t][x], this.#scene[y][x]] }]);
    //     }
    //   }
    // }

    // if (left[1]) {
    //   const ty = y
    //   const tx = (x - 2 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].right = [this.#scene[t][x], this.#scene[y][x], this.#scene[b][x]]
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { right: [this.#scene[t][x], this.#scene[y][x], this.#scene[b][x]] }]);
    //     }
    //   }
    // }

    // if (left[2]) {
    //   const ty = (y + 1 + this.#height) % this.#height;
    //   const tx = (x - 2 + this.#width) % this.#width;
    //   const index = this.#currentGenAlive.findIndex(cell => cell[0] === ty && cell[1] === tx);

    //   if (index !== -1 && !this.#checkedCells[`${ty}/${tx}`]) {
    //     const task = this.#stepTask.find(cell => cell[0] === ty && cell[1] === tx);

    //     if (task) {
    //       task[2].right = [this.#scene[t][x], this.#scene[b][x], bottom[1]]
    //     }

    //     if (!task) {
    //       this.#currentGenAlive.splice(index, 1);
    //       this.#stepTask.unshift([ty, tx, { right: [this.#scene[t][x], this.#scene[b][x], bottom[1]] }]);
    //     }
    //   }
    // }
  }

  pause() {
    this.#state = 'pause';
  }

  reset() {
    this.#cells.reset();
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
    const startCount = this.#currentGenAlive.length;
    const count = Math.round(this.#width * this.#height / 100 * density);
    const cells: string[] = this.#currentGenAlive.map(([y, x]) => `${y}/${x}`);

    while (cells.length < count + startCount || cells.length < 5) {
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
          await this.progress((cells.length - startCount) / count, start);
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
}
