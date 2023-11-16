import { AppElement } from "../Elements/AppElement";
import { Scene } from "../Types/types";

export class GameVeiwCanvas extends AppElement {
  ctx: CanvasRenderingContext2D | null = null
  sceneHeight: number
  sceneWidth: number
  size: number
  render: () => void
  change: (y: number, x: number, state: number) => void
  draw: (event: MouseEvent) => void
  resize: (event?: WindowEventHandlers) => void

  setSize: () => void
  getState: (y: number, x: number) => number
  getGen: () => void

  constructor(
    sceneHeight: number,
    sceneWidth: number,
    parent: AppElement,
    setPoint: (y: number, x: number, state: number) => void,
    // getState: (y: number, x: number) => number,
    getGen: () => [number, number][]
  ) {

    const sizeY = (window.innerHeight - 40) / sceneHeight;
    const sizeX = (window.innerWidth - 250) / sceneWidth;

    super('canvas', { className: 'canvas' }, { parent });

    this.size = Math.min(sizeY, sizeX);
    this.sceneHeight = sceneHeight;
    this.sceneWidth = sceneWidth;

    if (this instanceof HTMLCanvasElement) {
      this.ctx = this.getContext('2d');
      this.height = this.size * sceneHeight;
      this.width = this.size * sceneWidth;

      this.setSize = () => {
        if (this instanceof HTMLCanvasElement) {
          const sizeY = (window.innerHeight - 40) / sceneHeight;
          const sizeX = (window.innerWidth - 250) / sceneWidth;

          this.size = Math.min(sizeY, sizeX);

          this.height = this.size * sceneHeight;
          this.width = this.size * sceneWidth;
        }
      }

      this.draw = ({ type, target, buttons, button, clientY, clientX }) => {
        if ((!button && type === 'mouseup') || (type === 'mousemove' && !buttons)) return;

        const y = Math.round((clientY - (target as HTMLElement).offsetTop) / this.size);
        const x = Math.round((clientX - (target as HTMLElement).offsetLeft) / this.size);

        if (type == 'mousemove' && buttons) {
          setPoint(y, x, buttons === 2 ? 0 : 1);
          return;
        }

        setPoint(y, x, button === 2 ? 0 : 1);
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

        // const { currentGen, newGen, state } = getGen();


        // currentGen.forEach(([x, y]) => this.change(y, x, state !== 'stop'));
        // newGen.forEach(([x, y]) => this.change(y, x, state !== 'stop'));
        // for (let y = 0; y < this.sceneHeight; y++) {
        //   for (let x = 0; x < this.sceneWidth; x++) {
        //     this.change(y, x, getState(y, x));
        //   }
        // }
      }

      this.resize = () => {
        if (this instanceof HTMLCanvasElement) {
          const sizeY = (window.innerHeight - 40) / sceneWidth;
          const sizeX = (window.innerWidth - 250) / sceneWidth;

          this.size = Math.min(sizeY, sizeX);

          this.height = this.size * sceneWidth;
          this.width = this.size * sceneWidth;
        }
        // this.render();
      }

      this.addEventListener('mouseup', this.draw.bind(this));
      this.addEventListener('mousemove', this.draw.bind(this));
      this.addEventListener('mousedown', this.draw.bind(this));
      window.addEventListener('resize', this.resize.bind(this));
    }
  }
}
