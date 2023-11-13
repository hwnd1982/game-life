import { AppElement } from "../Elements/AppElement";
import { CellElement } from "../Elements/CellElement";
import { RowElement } from "../Elements/RowElement";
import { Scene } from "../Types/types";

export class GameVeiwHTML extends AppElement {
  setState: (() => void)[][]
  gameState: 'play' | 'end'
  setRows: (value: number) => void
  setCells: (value: number) => void

  constructor(scene: Scene, parent: AppElement) {
    const start = Date.now();
    const rows = scene.map(row => new RowElement(row));

    super('table', { className: 'scene' }, {
      appends: rows,
      parent,
      cb: (element) => {
        (element as HTMLElement).addEventListener('click', ({ target }) => {

          console.log(this.gameState);
          if (!target || this.gameState === 'play') return;

          const cell = (target as HTMLElement).closest('.cell');

          if (cell && 'setState' in cell) {
            (cell as CellElement).setState();
          }
        });
      }
    });

    this.gameState = 'end';
    this.setState = rows.map(row => row.setState);
    this.setRows = (value: number) => {
      const width = this.setState[0].length;
      const height = this.setState.length;

      if (value === height) return;

      if (value < height) {
        for (let i = height - 1; i > value - 1; i--) {
          const row = rows[i]
          if (row instanceof HTMLElement) {
            row.remove();
          }
        }

        rows.length = value;
        this.setState.length = value;
        return;
      }

      if (value > height) {
        const newRows = new Array(value - height).fill(0).map(() => {
          return new RowElement(new Array(width).fill(0));
        });

        newRows.forEach(row => {
          if (this instanceof HTMLElement && row instanceof HTMLElement) {
            this.append(row as HTMLElement);
          }
        })

        rows.push(...newRows);
        this.setState.push(...newRows.map(row => row.setState));
      }
    }

    this.setCells = (value: number) => {
      rows.forEach(row => {
        row.setCells(value);
      });
    }

    console.log('render', Date.now() - start);
  }
}