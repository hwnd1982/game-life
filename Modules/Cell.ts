import { CellController } from "../Controllers/CellController"

export class Cell {
  #controller: CellController
  y: number
  x: number
  state: number = 0

  constructor(controller: CellController, y: number, x: number, state: number, alive: number) {
    this.#controller = controller;
    this.y = y;
    this.x = x;

    if ((state && alive > 1 && alive < 4) || (!state && alive === 3)) {
      this.state = 1;
      controller.emit('next', y, x, 1);
    }

    if (state !== this.state) {
      controller.change;
      controller.emit('change', y, x, this.state);
    }
  }
}
