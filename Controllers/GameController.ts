import { AppElement } from "../Elements/AppElement";
import { Game } from "../Modules/Game";
import { EventEmiter } from "../Services/EventEmiter";
import { GameVeiwCanvas } from "../Veiw/GameVeiwCanvas";

export class GameController extends EventEmiter {
  #game: Game
  #veiw: GameVeiwCanvas
  #intervalId: number | null = null
  #area: number

  constructor(width: number, height: number, app: AppElement) {
    super();
    this.#area = width * height;
    this.#game = new Game(width, height);
    this.#veiw = new GameVeiwCanvas(this.#game.scene, app, this.setPoint.bind(this));
    this.#game.on('change', this.change.bind(this));
    this.#game.on('pause', this.pause.bind(this));
    this.#game.on('gen', this.gen.bind(this));
    this.#game.on('fill', this.gen.bind(this));
    this.#game.on('progress', this.gen.bind(this));
    this.#game.on('stop', this.stop.bind(this));
  }

  get area() {
    return this.#area;
  }

  start() {
    this.emit('start');
    this.#intervalId = setInterval(async () => {
      await this.#game.step();
    }, 500);
  }

  gen(event: string, gen: number, alive: number, time: number) {
    this.emit(event, gen, alive, time);
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
      this.#game.pause();
      this.#intervalId = null;
    }
  };

  setPoint(y: number, x: number, state: number) {
    this.#game.setPoint(y, x, state);
  }

  change(event: string, y: number, x: number, state: number) {
    this.#veiw.change(y, x, state);
  }

  fill(value: number) {
    this.#game.fill(value);


    return this
  }

  width(value: number) {
    value = value < 3 ? 3 : value;

    this.#game.width = value;
    this.#area = this.#game.width * this.#game.height;
    this.#veiw.setSize();

    return this;
  }

  height(value: number) {
    value = value < 3 ? 3 : value;

    this.#game.height = value;
    this.#area = this.#game.width * this.#game.height;
    this.#veiw.setSize();

    return this;
  }
}