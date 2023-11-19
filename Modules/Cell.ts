import { CellController } from "../Controllers/CellController"
import { Nearest } from "../Types/types"

export class Cell {
  #controller: CellController
  #nearest: Nearest
  #state: null | number = null

  id: string
  y: number
  x: number
  state: number

  constructor(
    controller: CellController,
    y: number,
    x: number,
    nearest: Nearest,
    state: number,
    task: { top?: boolean, right?: boolean, bottom?: boolean, left?: boolean }
  ) {
    const [t, tr, r, br, b, bl, l, tl] = nearest;

    this.id = `${y}/${x}`;
    this.y = y;
    this.x = x;
    this.state = state;
    this.#nearest = nearest;
    this.#controller = controller;
    this.#controller.addCell(this);
    this.check(t + tr + r + br + b + bl + l + tl);

    !this.#controller.neighbor(y, x, 't') && this.#controller.addTask(y, x, 't', {});
    !this.#controller.neighbor(y, x, 'tr') && this.#controller.addTask(y, x, 'tr', {
      // bottom: true,
      // left: true
    });
    !this.#controller.neighbor(y, x, 'r') && this.#controller.addTask(y, x, 't', {});
    !this.#controller.neighbor(y, x, 'br') && this.#controller.addTask(y, x, 'br', {
      // top: true,
      // left: true
    });
    !this.#controller.neighbor(y, x, 'b') && this.#controller.addTask(y, x, 'b', {});
    !this.#controller.neighbor(y, x, 'bl') && this.#controller.addTask(y, x, 'bl', {
      // top: true,
      // right: true
    });
    !this.#controller.neighbor(y, x, 'l') && this.#controller.addTask(y, x, 'l', {});
    !this.#controller.neighbor(y, x, 'tl') && this.#controller.addTask(y, x, 'tl', {
      // bottom: true,
      // right: true
    });

  }

  get neighbor() {
    return this.#nearest;
  }

  check(sum: number) {
    if (!sum) return;

    this.#state = 0;

    if ((this.state && sum > 1 && sum < 4) || (!this.state && sum === 3)) {
      this.#state = 1
    }

    if (this.state !== this.#state) {
      this.#controller.checked = this.id;
    }
  }
}
