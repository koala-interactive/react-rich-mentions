import { nodeToHtmlElement } from './nodeToHtmlElement';

const removeIfFinalFragment = (node: Node, container: HTMLDivElement): void => {
  const element = nodeToHtmlElement(node);
  if (!container.contains(element) || container === element) {
    return;
  }

  if (element && element.hasAttribute('data-integrity')) {
    container.removeChild(element);
  }
};

export function handleFragmentDeletion(
  event: React.FormEvent<HTMLDivElement>,
  selection: Selection
): void {
  if (event.defaultPrevented) {
    return;
  }

  const container = event.currentTarget;

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);

    removeIfFinalFragment(range.startContainer, container);
    removeIfFinalFragment(range.endContainer, container);
  }
}
