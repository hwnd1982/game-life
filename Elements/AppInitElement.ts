import { GameController } from "../Controllers/GameController";
import { AppElement } from "./AppElement";

export class AppInitElement extends AppElement {
  controller: GameController

  constructor(parent: AppElement) {
    const controller = new GameController(300, 300, parent);
    const genEl = new AppElement('span', { className: 'text' });
    const popEl = new AppElement('span', { className: 'text' });
    const timeEl = new AppElement('span', { className: 'text' });

    const start = new AppElement('button', { className: 'button start', textContent: 'Старт' }, {
      cb(element) {
        (element as HTMLElement).addEventListener('click', () => {
          controller.start();
        });
      },
    });

    const pause = new AppElement('button', { className: 'button pause none', textContent: 'Пауза' }, {
      cb(element) {
        (element as HTMLElement).addEventListener('click', () => {
          controller.pause();
        });
      },
    });

    const stop = new AppElement('button', { className: 'button stop none', textContent: 'Стоп' }, {
      cb(element) {
        (element as HTMLElement).addEventListener('click', () => {
          controller.stop();
        });
      },
    });

    const fill = new AppElement('button', { className: 'button fill', textContent: 'Заполнить +5%' }, {
      cb(element) {
        (element as HTMLElement).addEventListener('click', () => {
          controller.fill(5);
        });
      },
    });

    const progress = new AppElement('div', { className: 'progress none' }, {
      append: new AppElement('div', { className: 'progress-line' }, {
        append: new AppElement('div', { className: 'progress-bg' }),
        cb(element) {
          controller.on('progress', (event: string, progress: number, time: number) => {
            (element as HTMLElement).parentElement?.classList.remove('none');
            (element as HTMLElement).style.width = `${(progress * 100).toFixed(2)}%`;
          })
        },
      })
    })

    super('div', { className: 'controls' }, {
      appends: [start, fill, pause, stop,
        new AppElement('p', { className: 'info' }, {
          appends: [genEl, popEl, timeEl]
        }),
        progress
      ],
      parent
    });

    this.controller = controller;
    this.controller.on('gen', (event: string, gen: number, alive: number, time: number) => {
      (genEl as HTMLElement).textContent = `Поколение: ${gen};`;
      (popEl as HTMLElement).textContent = `Популяция: ${alive} (${(alive / controller.area * 100).toFixed(2)}%);`;
      (timeEl as HTMLElement).textContent = `Время генерации: ${(time / 1000).toFixed(2)}c;`;
      (progress as HTMLElement).classList.add('none');
    });
    this.controller.on('fill', (event: string, density: number, alive: number, time: number) => {
      (genEl as HTMLElement).textContent = `Поколение: X;`;
      (popEl as HTMLElement).textContent = `Популяция: ${alive} (${density.toFixed(2)}%);`;
      (timeEl as HTMLElement).textContent = `Время генерации: ${(time / 1000).toFixed(2)}c;`;
    });
    this.controller.on('start', () => {
      (start as HTMLElement).classList.add('none');
      (fill as HTMLElement).classList.add('none');
      (pause as HTMLElement).classList.remove('none');
      (stop as HTMLElement).classList.remove('none');
    });
    this.controller.on('pause', () => {
      (start as HTMLElement).classList.remove('none');
      (fill as HTMLElement).classList.remove('none');
      (pause as HTMLElement).classList.add('none');
      (stop as HTMLElement).classList.add('none');
    });
    this.controller.on('stop', () => {
      (start as HTMLElement).classList.remove('none');
      (fill as HTMLElement).classList.remove('none');
      (pause as HTMLElement).classList.add('none');
      (stop as HTMLElement).classList.add('none');
    });
  }
}