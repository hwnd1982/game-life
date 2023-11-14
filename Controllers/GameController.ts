import { AppElement } from "../Elements/AppElement";
import { Game } from "../Modules/Game";
import { GameVeiwCanvas } from "../Veiw/GameVeiwCanvas";

export class GameController {
  #game: Game
  #veiw: GameVeiwCanvas
  #intervalId: number | null = null

  constructor(width: number, height: number, app: AppElement) {
    this.#game = new Game(width, height);
    this.#veiw = new GameVeiwCanvas(this.#game.scene, app, this.setPoint.bind(this));
    this.#game.on('change', this.change.bind(this));
    this.#game.on('end', this.stop.bind(this));
  }

  start() {
    this.#intervalId = setInterval(async () => {
      await this.#game.step();
    }, 500);
  }

  stop() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
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
    this.#veiw.setSize();

    return this;
  }

  height(value: number) {
    value = value < 3 ? 3 : value;

    this.#game.height = value;
    this.#veiw.setSize();

    return this;
  }
}