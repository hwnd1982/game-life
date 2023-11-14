import { GameController } from "../Controllers/GameController";
import { AppElement } from "./AppElement";

export class AppInitElement extends AppElement {
  controller: GameController

  constructor(parent: AppElement) {
    const controller = new GameController(200, 100, parent);
    super('div', { className: 'controls' }, {
      appends: [
        new AppElement('button', { className: 'button start', textContent: 'Старт' }, {
          cb(element) {
            (element as HTMLElement).addEventListener('click', () => {
              controller.start();
            });
          },
        }),
        new AppElement('button', { className: 'button fill', textContent: 'Заполнить' }, {
          cb(element) {
            (element as HTMLElement).addEventListener('click', () => {
              controller.fill(15);
            });
          },
        })
      ],
      parent
    });

    this.controller = controller;
  }
}