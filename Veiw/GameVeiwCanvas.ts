import { AppElement } from "../Elements/AppElement";
import { Scene } from "../Types/types";

export class GameVeiwCanvas extends AppElement {
  ctx: CanvasRenderingContext2D | null = null
  size: number
  render: () => void
  change: (y: number, x: number, state: number) => void
  draw: (event: MouseEvent) => void
  resize: (event?: WindowEventHandlers) => void
  setSize: () => void

  constructor(scene: Scene, parent: AppElement, setPoint: (y: number, x: number, state: number) => void) {
    const sizeY = window.innerHeight / scene.length;
    const sizeX = (window.innerWidth - 250) / scene[0].length;

    super('canvas', { className: 'canvas' }, { parent });

    this.size = Math.min(sizeY, sizeX);

    if (this instanceof HTMLCanvasElement) {
      this.ctx = this.getContext('2d');
      this.width = this.size * scene[0].length;
      this.height = this.size * scene.length;

      this.setSize = () => {
        if (this instanceof HTMLCanvasElement) {
          const sizeY = window.innerHeight / scene.length;
          const sizeX = (window.innerWidth - 250) / scene[0].length;

          this.size = Math.min(sizeY, sizeX);

          this.height = this.size * scene.length;
          this.width = this.size * scene[0].length;
        }
      }

      this.draw = ({ type, target, buttons, clientY, clientX }) => {
        if (type === 'mousemove' && !buttons) return;

        const y = Math.round((clientY - (target as HTMLElement).offsetTop) / this.size);
        const x = Math.round((clientX - (target as HTMLElement).offsetLeft) / this.size);

        if (buttons || type !== 'mousemove') {
          setPoint(y, x, buttons === 2 ? 0 : 1);
        }
      }

      this.change = (y: number, x: number, state: number) => {
        if (!this.ctx) return;

        this.ctx.beginPath();
        this.ctx.arc(this.size / 2 + x * this.size, this.size / 2 + y * this.size, this.size / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = state ? '#50c843' : '#fff';
        this.ctx.fill();
      }

      this.render = () => {
        if (!this.ctx) return;

        for (let y = 0; y < scene.length; y++) {
          for (let x = 0; x < scene[y].length; x++) {
            this.change(y, x, +!!scene[y][x]);
          }
        }
      }

      this.resize = () => {
        if (this instanceof HTMLCanvasElement) {
          const sizeY = window.innerHeight / scene.length;
          const sizeX = (window.innerWidth - 250) / scene[0].length;

          this.size = Math.min(sizeY, sizeX);

          this.width = this.size * scene[0].length;
          this.height = this.size * scene.length;
        }
        this.render();
      }

      this.addEventListener('mousemove', this.draw.bind(this));
      this.addEventListener('click', this.draw.bind(this));
      window.addEventListener('resize', this.resize.bind(this));
    }
  }
}
