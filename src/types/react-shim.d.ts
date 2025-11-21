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
  export function useCallback(callback: () => void, deps?: any[]): () => void;
  export function useMemo(callback: () => any, deps?: any[]): any;
  export function useEffect(
    effect: () => void | (() => void),
    deps?: any[]
  ): void;
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

// Type declarations for react-helmet-async
declare module 'react-helmet-async' {
  export const Helmet: any;
  export const HelmetProvider: any;
}

// Type declarations for react-router-dom
declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const NavLink: any;
  export const Navigate: any;
  export const Outlet: any;
  export function useNavigate(): (to: string, options?: any) => void;
  export function useParams<T = any>(): T;
  export function useLocation(): { pathname: string; search: string; hash: string; state: any };
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void];
}
