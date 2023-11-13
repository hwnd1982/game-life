import { AppElement } from "./AppElement";

export interface CellElementInterface {
  setState: () => void
}

export class CellElement extends AppElement implements CellElementInterface {
  setState: () => void

  constructor(state: number) {
    super('td', { className: `cell${state ? ' alive' : ''}` });

    this.setState = () => {
      if (this instanceof HTMLElement) {
        const state = !(this as HTMLElement).classList.contains('alive');

        (this as HTMLElement).classList[state ? 'add' : 'remove']('alive');
      }
    }
  }
}
