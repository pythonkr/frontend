import type { JSX as ReactJSX } from "react";

// React 19에서 글로벌 JSX 네임스페이스가 제거되었으나, @types/mdx가 글로벌 JSX.IntrinsicElements에 의존하므로 nested MDX components 타입이 깨짐.
// https://github.com/mdx-js/mdx/issues/2579
declare global {
  namespace JSX {
    type IntrinsicElements = ReactJSX.IntrinsicElements;
    type Element = ReactJSX.Element;
    type ElementClass = ReactJSX.ElementClass;
    type ElementType = ReactJSX.ElementType;
  }
}

declare module "*.mdx" {
  let MDXComponent: (props: string) => JSX.Element;
  export default MDXComponent;
}
