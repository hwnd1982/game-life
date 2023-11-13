import { AppElement } from "../Elements/AppElement";
import { Game } from "../Modules/Game";
import { GameVeiwCanvas } from "../Veiw/GameVeiwCanvas";
import { GameVeiwHTML } from "../Veiw/GameVeiwHTML";

export class GameController {
  #game: Game
  #veiw: GameVeiwHTML
  // #veiw: GameVeiwCanvas
  #intervalId: number | null = null

  constructor(width: number, height: number, app: AppElement) {
    const start = Date.now();
    this.#game = new Game(width, height);
    const game = Date.now();
    console.log('game', game - start);
    // this.#veiw = new GameVeiwCanvas(width, height, app);
    this.#veiw = new GameVeiwHTML(this.#game.scene, app);
    const veiw = Date.now();
    console.log('veiw', veiw - game);

    this.#game.on('change', this.change.bind(this));
    this.#game.on('end', this.stop.bind(this));
  }

  start() {
    this.#intervalId = setInterval(() => {
      this.#veiw.gameState = 'play';
      this.#game.step();
    }, 1000);
  }

  stop() {
    this.#veiw.gameState = 'end';

    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  };

  change(event: string, y: number, x: number, state: number) {
    this.#veiw.setState[y][x]();
    // this.#veiw.change(y, x, state);
  }

  fill(value: number) {
    this.#game.fill(value);

    return this
  }

  width(value: number) {
    value = value < 3 ? 3 : value;

    this.#game.width = value;
    this.#veiw.setCells(value);

    return this;
  }

  height(value: number) {
    value = value < 3 ? 3 : value;

    this.#game.height = value;
    this.#veiw.setRows(value);

    return this;
  }
}