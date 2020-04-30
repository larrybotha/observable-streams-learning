export interface MatrixItem {
  x: number;
  y: number;
  chars: string[];
  remove: boolean;
}

export type Matrix = MatrixItem[];
