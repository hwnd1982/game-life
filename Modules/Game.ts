import { CellController } from "../Controllers/CellController";
import { GameState } from "../Types/Types";

export class Game extends CellController {
  #state: GameState = 'stop'
  #gen: number = 0

  constructor(height: number, width: number) {
    super(height, width);
  }

  get gen() {
    return this.#gen;
  }

  get state() {
    return this.#state;
  }

  set state(state: GameState) {
    this.#state = state;
  }

  setPoint(y: number, x: number, state: number) {
    if (this.#state === 'calc' || this.#state === 'play' || y >= this.height || x >= this.width) return;

    this.setCurrent(y, x, state);
  }

  async step() {
    if (this.#state === 'calc') return;

    let task: [number, number] | null = null;
    let processing = performance.now();
    const start = processing;
    const state = this.#state;
    const startCount = this.alive;

    this.#gen += 1;
    this.#state = 'calc';

    while (this.alive || task) {
      task = this.task;

      if (task) {
        this.next(task);
      }

      if (performance.now() - processing > 500) {
        if (await this.progress((startCount - this.alive) / startCount, processing - start)) {
          this.emit('stop');
          return;
        }

        processing = performance.now();
      }
    }
    this.#state = state;

    if (!this.checked) {
      this.#state = 'stop';
      this.emit('stop');
    }

    if (!this.changed) {
      this.#state = 'pause';
      this.emit('pause');
    }

    this.reset();
    this.emit('gen', this.#gen, this.alive, processing - start);
  }

  async progress(progress: number, processing: number) {
    return new Promise((resolve) => {
      this.emit('progress', progress, processing);

      setTimeout(() => resolve(this.#state === 'stop'));
    });
  }

  async stop() {
    this.state = 'stop';
    await super.stop();
  }
}