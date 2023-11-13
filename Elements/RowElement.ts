import { AppElement } from "./AppElement";
import { CellElement } from "./CellElement";

export interface RowElementInterface {
  setState: (() => void)[]
  setCells: (value: number) => void
}

export class RowElement extends AppElement implements RowElementInterface {
  setState: (() => void)[]
  setCells: (value: number) => void

  constructor(state: number[]) {
    const cells = state.map(cell => new CellElement(cell));

    super('tr', { className: 'row' }, {
      appends: cells
    });

    this.setState = cells.map(cell => cell.setState);
    this.setCells = (value: number) => {
      const width = this.setState.length;

      if (value === width) return;

      if (value < width) {
        for (let i = width - 1; i > value - 1; i--) {
          const cell = cells[i]
          if (cell instanceof HTMLElement) {
            cell.remove();
          }
        }

        cells.length = value;
        this.setState.length = value;
        return;
      }

      if (value > width) {
        const newCells = new Array(value - width).fill(0).map(() => new CellElement(0));

        cells.push(...newCells);
        newCells.forEach(cell => {
          if (this instanceof HTMLElement && cell instanceof HTMLElement) {
            this.append(cell as HTMLElement);
            this.setState.push(cell.setState);
          }
        })
      }
    }
  }
}
