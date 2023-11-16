import { GameController } from "../Controllers/GameController";
import { AppElement } from "./AppElement";

export class ButtomElement extends AppElement {
  constructor(callback: () => void, className: string, textContent: string,) {
    super('button', { className: `button${' ' + className || ''}`, textContent }, {
      cb(element) {
        (element as HTMLElement).addEventListener('click', () => {
          callback();
        });
      },
    })
  }
}