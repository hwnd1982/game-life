import { Cell } from "../Modules/Cell"
import { Scene } from "../Modules/Scene"

export class CellController extends Scene {
  #cells: { [id: string]: Cell } = {}
  #tasks: [number, number][] = [];
  #changed: number = 0;
  #current: [number, number][] = []
  #next: [number, number][] = []
  #taskCount: number = 0

  constructor(height: number, width: number) {
    super(height, width);
  }

  get checked() {
    return Object.keys(this.#cells).length;
  }

  get change() {
    this.#changed += 1;

    return this.#changed;
  }

  get changed() {
    return this.#changed;
  }

  get task() {
    let task: [number, number] | null = null;

    if (this.#tasks.length) {
      task = this.#tasks[this.#tasks.length - 1];
      const [y, x] = task;

      if (this.getState(y, x)) {
        this.#taskCount -= 1;
      }

      this.#tasks.length -= 1;
    }

    if (!this.#tasks.length && this.#current.length) {
      task = this.#current[this.#current.length - 1];

      this.#current.length -= 1;
    };

    return task;
  }

  get alive() {
    return this.#current.length - this.#taskCount;
  }

  setCurrent(y: number, x: number, state: number) {
    const index = this.#current.findIndex(point => x === point[1] && y === point[0]);
    const isAdd = index === -1 && state;
    const isRemove = index !== -1 && !state;

    if (isAdd) {
      this.#current.push([y, x]);
    }

    if (isRemove) {
      this.#current.splice(index, 1);
    }

    if (isAdd || isRemove) {
      super.setState(y, x, state);
      this.emit('change', y, x, state);
      this.emit(
        'fill',
        this.#current.length / (this.width * this.height) * 100,
        this.#current.length,
        0,
        0
      );
    }
  }

  next([y, x]: [number, number]) {
    if (this.#cells[`${y}/${x}`] || y >= this.height || x >= this.width) return;

    const {
      side: { t, tt, r, rr, b, bb, l, ll },
      state: [
        yx, tx, tr, yr, br, bx, bl, yl, tl,
        ttl, ttx, ttr, ttrr,
        trr, yrr, brr, bbrr,
        bbr, bbx, bbl, bbll,
        bll, yll, tll, ttll
      ] } = this.getCell(y, x);

    this.cell(y, x, yx, tx + tr + yr + br + bx + bl + yl + tl);

    if (!yx) return;

    if (this.cell(t, x, tx, ttx + ttr + tr + yr + yx + yl + tl + ttl)) {
      this.#tasks.unshift([tt, r], [tt, x], [tt, l]);
      this.#taskCount += ttx + ttr + ttl;
    }

    if (this.cell(t, r, tr, ttr + ttrr + trr + yrr + yr + yx + tx + ttx)) {
      this.#tasks.unshift([tt, rr]);
      this.#taskCount += ttrr;
    }

    if (this.cell(y, r, yr, tr + trr + yrr + brr + br + bx + yx + tx)) {
      this.#tasks.unshift([b, rr], [y, rr], [t, rr]);
      this.#taskCount += brr + yrr + trr;
    }

    if (this.cell(b, r, br, yr + yrr + brr + bbrr + bbr + bbx + bx + yx)) {
      this.#tasks.unshift([bb, rr]);
      this.#taskCount += bbrr;
    }

    if (this.cell(b, x, bx, yx + yr + br + bbr + bbx + bbl + bl + yl)) {
      this.#tasks.unshift([bb, r], [bb, x], [bb, l]);
      this.#taskCount += bbr + bbx + bbl;
    }

    if (this.cell(b, l, bl, yl + yx + bx + bbx + bbl + bbll + bll + yll)) {
      this.#tasks.unshift([bb, ll]);
      this.#taskCount += bbll;
    }

    if (this.cell(y, l, yl, tl + tx + yx + bx + bl + bll + yll + tll)) {
      this.#tasks.unshift([b, ll], [y, ll], [t, ll]);
      this.#taskCount += bll + yll + tll;
    }

    if (this.cell(t, l, tl, ttl + ttx + tx + yx + yl + yll + tll + ttll)) {
      this.#tasks.unshift([tt, ll]);
      this.#taskCount += ttll;
    }
  }

  cell(y: number, x: number, state: number, alive: number) {
    const id = `${y}/${x}`;

    if (this.#cells[id]) return false;

    this.#cells[id] = new Cell(this, y, x, state, alive);

    if (this.#cells[id].state) {
      this.#next.push([y, x]);
      this.setNext(y, x, 1);
    }

    return true;
  }

  async stop() {
    let processing = performance.now();
    const start = processing;
    const startCount = this.#current.length + this.#next.length;

    while (this.#current.length + this.#next.length) {
      if (this.#current.length) {
        const [y, x] = this.#current[this.#current.length - 1];

        this.#current.length -= 1;

        super.setState(y, x, 0);
        this.emit('change', y, x, 0);
      }

      if (this.#next.length) {
        const [y, x] = this.#next[this.#next.length - 1];

        this.#next.length -= 1;

        super.setState(y, x, 0);
        this.emit('change', y, x, 0);
      }

      if (performance.now() - processing > 500) {
        await this.progress((startCount - this.#current.length + this.#next.length) / startCount, processing - start)

        processing = performance.now();
      }
    }

    this.emit('gen', 'X', 0, processing - start);
    this.reset();
  }

  async progress(progress: number, processing: number) {
    return new Promise((resolve) => {
      this.emit('progress', progress, processing);

      setTimeout(resolve);
    });
  }

  reset() {
    super.reset();
    this.#cells = {};
    this.#current = this.#next;
    this.#next = [];
    this.#tasks.length = 0;
    this.#changed = 0;
    this.#taskCount = 0;
  }
}
