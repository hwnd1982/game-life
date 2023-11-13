import { AppElement } from "../Elements/AppElement";

export class GameVeiwCanvas extends AppElement {
  ctx: CanvasRenderingContext2D | null = null
  render: (change: [number, number, number][]) => void
  change: (y: number, x: number, state: number) => void

  constructor(width: number, height: number, parent: AppElement) {
    super('canvas', { className: 'canvas', width: `${7 * width}`, height: `${7 * height}` }, {
      parent
    });

    if (this instanceof HTMLCanvasElement) {
      this.ctx = this.getContext('2d');

      this.change = (y: number, x: number, state: number) => {
        if (!this.ctx) return;

        this.ctx.beginPath();
        this.ctx.arc(3 + x * 7, 3 + y * 7, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = state ? '#50c843' : '#fff';
        this.ctx.fill();
      }

      this.render = (change: [number, number, number][]) => {
        if (!this.ctx) return;

        for (let i = 0; i < change.length; i++) {
          const [y, x, state] = change[i];

          this.change(y, x, state);
        }
      }
    }
  }
}
