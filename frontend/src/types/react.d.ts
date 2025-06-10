declare module 'react' {
  export type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
  export type ReactChild = ReactElement | ReactText;
  export type ReactText = string | number;
  export type ReactFragment = {} | ReactNodeArray;
  export interface ReactPortal extends ReactElement {
    key: Key | null;
    children: ReactNode;
  }
  export interface ReactNodeArray extends Array<ReactNode> {}

  export type Key = string | number;
  export type JSXElementConstructor<P> = 
    | ((props: P) => ReactElement<any, any> | null)
    | (new (props: P) => Component<any, any>);

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export interface FC<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export class Component<P = {}, S = {}, SS = any> {
    constructor(props: P);
    setState<K extends keyof S>(
      state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
      callback?: () => void
    ): void;
    render(): ReactNode;
    readonly props: Readonly<P> & Readonly<{ children?: ReactNode }>;
    state: Readonly<S>;
  }

  // React Hooks
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  export function useEffect(effect: () => (void | (() => void | undefined)), deps?: readonly any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(): { current: T | undefined };
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;

  export function createElement<P extends {}>(
    type: string,
    props?: (P & { children?: ReactNode }) | null,
    ...children: ReactNode[]
  ): ReactElement<P>;

  const React: {
    FC: typeof FC;
    Component: typeof Component;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useRef: typeof useRef;
    useCallback: typeof useCallback;
    useMemo: typeof useMemo;
    createElement: typeof createElement;
    ReactNode: ReactNode;
    ReactElement: ReactElement;
  };

  export default React;
}

declare module 'react-dom' {
  export function render(element: React.ReactElement, container: Element | null): void;
  export function createRoot(container: Element | DocumentFragment): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
}

declare module 'react-router-dom' {
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    index?: boolean;
    children?: React.ReactNode;
  }
  
  export interface LinkProps {
    to: string;
    className?: string;
    children: React.ReactNode;
    key?: string | number;
    [key: string]: any;
  }
  
  export function Routes(props: { children: React.ReactNode }): React.ReactElement;
  export function Route(props: RouteProps): React.ReactElement;
  export function Link(props: LinkProps): React.ReactElement;
  export function Outlet(): React.ReactElement;
  export function useLocation(): { pathname: string };
  export function useNavigate(): (to: string) => void;
  export function BrowserRouter(props: { children: React.ReactNode }): React.ReactElement;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }

  namespace React {
    type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
    type ReactChild = ReactElement | ReactText;
    type ReactText = string | number;
    type ReactFragment = {} | ReactNodeArray;
    interface ReactPortal extends ReactElement {
      key: Key | null;
      children: ReactNode;
    }
    interface ReactNodeArray extends Array<ReactNode> {}

    type Key = string | number;
    type JSXElementConstructor<P> = 
      | ((props: P) => ReactElement<any, any> | null)
      | (new (props: P) => Component<any, any>);

    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }

    interface FC<P = {}> {
      (props: P & { children?: ReactNode }): ReactElement<any, any> | null;
      propTypes?: any;
      contextTypes?: any;
      defaultProps?: Partial<P>;
      displayName?: string;
    }

    class Component<P = {}, S = {}, SS = any> {
      constructor(props: P);
      setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
      ): void;
      render(): ReactNode;
      readonly props: Readonly<P> & Readonly<{ children?: ReactNode }>;
      state: Readonly<S>;
    }

    // React Hooks
    export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
    export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    export function useRef<T>(initialValue: T): { current: T };
    export function useRef<T = undefined>(): { current: T | undefined };
    export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    export function useMemo<T>(factory: () => T, deps: any[]): T;

    interface Attributes {
      key?: Key | null;
    }

    interface ClassAttributes<T> extends Attributes {
      ref?: ((instance: T | null) => void) | null;
    }
  }
}

// jsx-runtime for modern React JSX transform
declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function Fragment(props: { children?: any }): any;
}
