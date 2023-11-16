import { GameController } from "../Controllers/GameController";
import { AppElement } from "./AppElement";
import { ButtomElement } from "./ButtomElement";
import { ProgressElement } from "./ProgressElement";
import { RangeElement } from "./RangeElement";

export class AppInitElement extends AppElement {
  controller: GameController

  constructor(height: number, width: number, parent: AppElement) {
    const controller = new GameController(height, width, parent);
    const genEl = new AppElement('span', { className: 'text' });
    const popEl = new AppElement('span', { className: 'text' });
    const timeEl = new AppElement('span', { className: 'text' });

    const start = new ButtomElement(() => controller.start(), 'start', 'Старт');
    const pause = new ButtomElement(() => controller.pause(), 'button pause none', 'Пауза');
    const stop = new ButtomElement(() => controller.stop(), 'button stop none', 'Стоп');
    const fill = new ButtomElement(() => controller.fill(5), 'button fill', 'Заполнить +5%');

    const rangeHeight = new RangeElement(height, 'Высота поля: ', (value: number) => controller.height(value));
    const rangeWidth = new RangeElement(width, 'Ширина поля: ', (value: number) => controller.width(value));

    const progress = new ProgressElement(controller);

    super('div', { className: 'controls' }, {
      appends: [start, fill, pause, stop,
        new AppElement('p', { className: 'info' }, {
          appends: [genEl, popEl, timeEl]
        }),
        rangeHeight,
        rangeWidth,
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
      (progress as HTMLElement).classList.add('none');
    });
    this.controller.on('start', () => {
      (start as HTMLElement).classList.add('none');
      (fill as HTMLElement).classList.add('none');
      (pause as HTMLElement).classList.remove('none');
      (stop as HTMLElement).classList.remove('none');

      (rangeHeight as HTMLElement).classList.add('none');
      (rangeWidth as HTMLElement).classList.add('none');
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

      (rangeHeight as HTMLElement).classList.remove('none');
      (rangeWidth as HTMLElement).classList.remove('none');
    });
  }
}
