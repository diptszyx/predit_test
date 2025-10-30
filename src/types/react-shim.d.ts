// Temporary local React type shims to avoid importing React in every file
// and to support the automatic JSX runtime without @types/react installed.

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "react" {
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prev: S) => S);
  export function useState<S = any>(
    initialState?: S | (() => S)
  ): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(
    effect: () => void | (() => void),
    deps?: any[]
  ): void;
  export function useRef<T = any>(
    initialValue?: T | null
  ): { current: T | null };
  const React: any;
  export default React;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
