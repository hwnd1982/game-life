import { CellState, Scene } from "../Types/types";

export class Cell {
  #x: number
  #y: number
  #alive: number
  #height: number
  #width: number
  #changed: boolean = false;
  #checked: boolean = false;
  #scene: Scene
  #side: { t: number, r: number, b: number, l: number }


  constructor(x: number, y: number, scene: Scene, cellsState: [
    CellState,
    CellState,
    CellState,
    CellState,
    CellState,
    CellState,
    CellState,
    CellState
  ], full: boolean = false) {

    this.#scene = scene;
    this.#height = scene.length;
    this.#width = scene[0].length;
    this.#side = {
      t: (y - 1 + this.#height) % this.#height,
      r: (x + 1 + this.#width) % this.#width,
      b: (y + 1 + this.#height) % this.#height,
      l: (x - 1 + this.#width) % this.#width,
    };


  }
}