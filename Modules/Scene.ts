import { EventEmiter } from "../Services/EventEmiter";

export class Scene extends EventEmiter {
  #height: number
  #width: number
  #current: number[][]
  #next: number[][]

  constructor(height: number, width: number) {
    super();
    this.#height = height;
    this.#width = width;
    this.#current = new Array(height).fill(0).map(() => new Array(width).fill(0));
    this.#next = new Array(height).fill(0).map(() => new Array(width).fill(0));
  }

  getCell(y: number, x: number) {
    const t = this.t(y);
    const tt = this.t(t);
    const r = this.r(x);
    const rr = this.r(r);
    const b = this.b(y);
    const bb = this.b(b);
    const l = this.l(x);
    const ll = this.l(l);

    return {
      side: { t, tt, r, rr, b, bb, l, ll },
      state: [
        this.#current[y][x],

        this.#current[t][x],
        this.#current[t][r],
        this.#current[y][r],
        this.#current[b][r],
        this.#current[b][x],
        this.#current[b][l],
        this.#current[y][l],
        this.#current[t][l],

        this.#current[tt][l],
        this.#current[tt][x],
        this.#current[tt][r],
        this.#current[tt][rr],

        this.#current[t][rr],
        this.#current[y][rr],
        this.#current[b][rr],
        this.#current[bb][rr],

        this.#current[bb][r],
        this.#current[bb][x],
        this.#current[bb][l],
        this.#current[bb][ll],

        this.#current[b][ll],
        this.#current[y][ll],
        this.#current[t][ll],
        this.#current[tt][ll],
      ]
    };
  }

  setState(y: number, x: number, state: number) {
    this.#current[y][x] = state;
  }

  setNext(y: number, x: number, state: number) {
    this.#next[y][x] = state;
  }

  getState(y: number, x: number) {
    return this.#current[y][x];
  }

  reset() {
    this.#current = this.#next;
    this.#next = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
  }

  t(y: number) {
    return (y - 1 + this.#height) % this.#height;
  }

  r(x: number) {
    return (x + 1 + this.#width) % this.#width;
  }

  b(y: number) {
    return (y + 1 + this.#height) % this.#height;
  }

  l(x: number) {
    return (x - 1 + this.#width) % this.#width;
  }

  get height() {
    return this.#height;
  }

  set height(value: number) {
    if (value === this.#width) return;

    if (value < this.#height) {
      this.#current.length = value;
      this.#next.length = value;
    }

    if (value > this.#height) {
      this.#current.push(...(new Array(value - this.#height).fill(0).map(() => new Array(this.#width).fill(0))));
      this.#next.push(...(new Array(value - this.#height).fill(0).map(() => new Array(this.#width).fill(0))));
    }

    this.#height = value;
  }

  get width() {
    return this.#width;
  }

  set width(value: number) {
    if (value === this.#width) return;

    if (value < this.#width) {
      this.#current.forEach(row => row.length = value);
      this.#next.forEach(row => row.length = value);
    }

    if (value > this.#width) {
      this.#current.forEach(row => row.push(...(new Array(value - this.#width).fill(0))));
      this.#next.forEach(row => row.push(...(new Array(value - this.#width).fill(0))));
    }

    this.#width = value;
  }
}
