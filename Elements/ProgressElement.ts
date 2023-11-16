import { GameController } from "../Controllers/GameController";
import { AppElement } from "./AppElement";

export class ProgressElement extends AppElement {
  constructor(controller: GameController) {
    const percent = new AppElement('span');
    const rest = new AppElement('span');

    super('p', { className: 'progress none' }, {
      appends: [
        new AppElement('span', { className: 'progress-text' }, {
          appends: [
            percent,
            new AppElement('span', { textContent: 'осталось ' }),
            rest
          ]
        }),
        new AppElement('span', { className: 'progress-line' }, {
          append: new AppElement('span', { className: 'progress-bg' }),
          cb(element) {
            controller.on('progress', (event: string, progress: number, time: number) => {
              (element as HTMLElement).parentElement?.classList.remove('none');
              (element as HTMLElement).style.width = `${(progress * 100).toFixed(2)}%`;
              (percent as HTMLElement).textContent = `${(progress * 100).toFixed(2)}%`;
              (rest as HTMLElement).textContent = `~ ${(time / 1000 / progress - time / 1000).toFixed(2)}с`;
            })
          },
        })
      ]
    })
  }
}