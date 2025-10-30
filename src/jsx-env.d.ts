// Ambient JSX typings to satisfy TypeScript when @types/react is not installed

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};



