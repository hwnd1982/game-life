import { AppElement } from "../Elements/AppElement";

export class GameVeiwCanvas extends AppElement {
  ctx: CanvasRenderingContext2D | null = null
  sceneHeight: number
  sceneWidth: number
  size: number
  needRender: boolean

  render: (alive: [number, number][]) => void
  change: (y: number, x: number, state: number) => void
  draw: (event: MouseEvent) => void
  resize: (event?: WindowEventHandlers) => void

  setWidth: (value: number) => void
  setHeight: (value: number) => void

  constructor(
    sceneHeight: number,
    sceneWidth: number,
    parent: AppElement,
    setPoint: (y: number, x: number, state: number) => void,
  ) {

    const sizeY = (window.innerHeight - 40) / sceneHeight;
    const sizeX = (window.innerWidth - 320) / sceneWidth;

    super('canvas', { className: 'canvas' }, { parent });

    this.needRender = false;
    this.size = Math.min(sizeY, sizeX);
    this.sceneHeight = sceneHeight;
    this.sceneWidth = sceneWidth;

    if (this instanceof HTMLCanvasElement) {
      this.ctx = this.getContext('2d');
      this.height = this.size * this.sceneHeight;
      this.width = this.size * this.sceneWidth;

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

      this.render = (alive: [number, number][]) => {
        alive.forEach(([y, x]) => this.change(y, x, 1));

        this.needRender = false;
      }

      this.resize = () => {
        if (this instanceof HTMLCanvasElement) {
          const sizeY = (window.innerHeight - 40) / this.sceneHeight;
          const sizeX = (window.innerWidth - 320) / this.sceneWidth;

          this.size = Math.min(sizeY, sizeX);

          this.height = this.size * this.sceneHeight;
          this.width = this.size * this.sceneWidth;
        }

        this.needRender = true;
      }

      this.setWidth = (value: number) => {
        this.sceneWidth = value;

        this.resize();
      }

      this.setHeight = (value: number) => {
        this.sceneHeight = value;

        this.resize();
      }

      this.addEventListener('mouseup', this.draw.bind(this));
      this.addEventListener('mousemove', this.draw.bind(this));
      this.addEventListener('mousedown', this.draw.bind(this));
      window.addEventListener('resize', this.resize.bind(this));
    }
  }
}
