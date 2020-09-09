export function nodeToHtmlElement(node: Node): HTMLElement | null {
  return node.nodeType === Node.TEXT_NODE
    ? node.parentElement
    : (node as HTMLElement);
}
