declare module 'simplex-noise' {
  export function createNoise2D(randomFn?: () => number): (x: number, y: number) => number;
  export function createNoise3D(randomFn?: () => number): (x: number, y: number, z: number) => number;
  export function createNoise4D(randomFn?: () => number): (x: number, y: number, z: number, w: number) => number;
} 