import { Cell } from "../Modules/Cell.js";
import { MoveTo } from "../Types/types.js";

export class CellController {
  #height: number
  #width: number
  #checked: string[] = []
  #cells: { [key: string]: Cell } = {}
  #task: [number, number, { top?: boolean, right?: boolean, bottom?: boolean, left?: boolean }][]

  constructor(height: number, width: number) {
    this.#height = height;
    this.#width = width;
  }

  set checked(id: string) {
    this.#checked.push(id);
  }

  get task() {
    return this.#task;
  }

  isChecked(id: string) {
    return this.#checked.includes(id);
  }

  t(y: number, x: number) {
    return [(y - 1 + this.#height) % this.#height, x];
  }

  tr(y: number, x: number) {
    return [(y - 1 + this.#height) % this.#height, (x + 1 + this.#width) % this.#width];
  }

  r(y: number, x: number) {
    return [y, (x + 1 + this.#width) % this.#width];
  }

  br(y: number, x: number) {
    return [(y + 1 + this.#height) % this.#height, (x + 1 + this.#width) % this.#width];
  }

  b(y: number, x: number) {
    return [(y + 1 + this.#height) % this.#height, x];
  }

  bl(y: number, x: number) {
    return [(y + 1 + this.#height) % this.#height, (x - 1 + this.#width) % this.#width];
  }

  l(y: number, x: number) {
    return [y, (x - 1 + this.#width) % this.#width];
  }

  tl(y: number, x: number) {
    return [(y - 1 + this.#height) % this.#height, (x - 1 + this.#width) % this.#width];
  }

  addCell(cell: Cell) {
    this.#cells[cell.id] = cell;
  }

  addTask(cy: number, cx: number, move: MoveTo, done: { top?: boolean, right?: boolean, bottom?: boolean, left?: boolean }) {
    const [y, x] = this[move](cy, cx);
    const task = this.#task.find(([ty, tx]) => ty === y && tx === x);

    if (task) {
      task[2] = { ...task[2], ...done };
      return;
    }

    this.#task.unshift([y, x, done]);
  }

  neighbor(cy: number, cx: number, move: MoveTo) {
    const [y, x] = this[move](cy, cx);

    return this.#cells[`${y}/${x}`] || null;
  }
}