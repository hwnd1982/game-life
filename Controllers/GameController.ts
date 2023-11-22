import { AppElement } from "../Elements/AppElement";
import { Game } from "../Modules/Game";
import { EventEmiter } from "../Services/EventEmiter";
import { GameVeiwCanvas } from "../Veiw/GameVeiwCanvas";


export class GameController extends EventEmiter {
  #game: Game
  #veiw: GameVeiwCanvas
  #intervalId: number | null = null

  constructor(height: number, width: number, app: AppElement) {
    super();
    this.#game = new Game(height, width);
    this.#veiw = new GameVeiwCanvas(height, width, app, this.#game.setPoint.bind(this.#game));
    this.#game.on('change', this.change.bind(this));
    this.#game.on('pause', this.pause.bind(this));
    this.#game.on('gen', this.gen.bind(this));
    this.#game.on('fill', this.gen.bind(this));
    this.#game.on('progress', this.gen.bind(this));
    this.#game.on('stop', this.stop.bind(this));
  }

  get area() {
    return this.#game.height * this.#game.width;
  }

  start() {
    this.emit('start');
    this.#intervalId = setInterval(async () => {
      await this.#game.step();
    }, 500);
  }

  gen(event: string, gen: number, alive: number, time: number) {
    this.emit(event, gen, alive, time);

    if (event === 'gen' && this.#veiw.needRender) {
      this.#veiw.render(this.#game.getAll());
    }
  }

  stop() {
    if (this.#intervalId) {
      this.emit('stop');
      clearInterval(this.#intervalId);
      this.#game.stop();
      this.#intervalId = null;
    }
  }

  pause(): void {
    if (this.#intervalId) {
      this.emit('pause');
      clearInterval(this.#intervalId);
      this.#game.state = 'pause';
      this.#intervalId = null;
    }
  };

  getState(y: number, x: number) {
    return this.#game.getState(y, x);
  }

  change(event: string, y: number, x: number, state: number) {
    this.#veiw.change(y, x, state);
  }

  async fill(density: number) {
    if (this.#game.state === 'calc' || this.#game.state === 'play') return;

    let processing = performance.now();
    const start = performance.now();
    const state = this.#game.state;
    const startCount = this.#game.alive;
    const count = Math.round(this.#game.width * this.#game.height / 100 * density);
    const cells: string[] = [];

    if (startCount >= this.#game.width * this.#game.height) return;

    this.#game.state = 'calc';
    while (cells.length < count) {
      const x = Math.round(Math.random() * (this.#game.width - 1));
      const y = Math.round(Math.random() * (this.#game.height - 1));
      const id = `${y}/${x}`;
      const alive = this.#game.alive;

      this.#game.setCurrent(y, x, 1);

      if (this.#game.alive > alive) {
        this.emit('change', y, x, 1);

        cells.push(id);
      }

      if (performance.now() - processing > 500) {
        await this.#game.progress((this.#game.alive - startCount) / count, processing - start);
        processing = performance.now();
      }

    }

    this.#game.state = state;

    this.emit(
      'fill',
      this.#game.alive / (this.#game.width * this.#game.height) * 100,
      this.#game.alive,
      performance.now() - start, cells.length
    );

    return this
  }

  width(value: number) {
    this.#game.width = value;
    this.#veiw.setWidth(value);

    return this;
  }

  height(value: number) {
    this.#game.height = value;
    this.#veiw.setHeight(value);

    return this;
  }
}