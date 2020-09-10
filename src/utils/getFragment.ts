import { nodeToHtmlElement } from './nodeToHtmlElement';

export function getFragment(node: Node): HTMLElement | null {
  const element = nodeToHtmlElement(node);
  return element && element.hasAttribute('data-rich-mentions') ? element : null;
}
