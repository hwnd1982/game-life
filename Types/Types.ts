export type Scene = number[][];
export type CellState = number | undefined;
export type Task = {
  top?: [number, number, number],
  right?: [number, number, number],
  bottom?: [number, number, number],
  left?: [number, number, number]
}