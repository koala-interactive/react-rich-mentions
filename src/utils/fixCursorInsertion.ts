import { nodeToHtmlElement } from './nodeToHtmlElement';
import { escapeFragmentWithValue } from './escapeFragmentWithValue';

export function fixCursorInsertion(
  event: React.FormEvent<HTMLDivElement>,
  selection: Selection
): void {
  if (event.defaultPrevented) {
    return;
  }

  // @ts-ignore
  const insertion: string = event.data;
  const container = event.currentTarget;

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);

    // Same element
    if (range.startContainer === range.endContainer) {
      const element = nodeToHtmlElement(range.startContainer);

      if (!container.contains(element)) {
        continue;
      }

      // If outside pending fragment, insert char inside
      if (range.startContainer instanceof Text && range.startOffset === 0) {
        const previousChild = range.startContainer.previousSibling;
        const previousElement = range.startContainer.previousElementSibling;
        if (
          previousChild &&
          previousElement &&
          previousChild === previousElement &&
          previousElement.hasAttribute('data-rich-mentions') &&
          !previousElement.hasAttribute('data-integrity')
        ) {
          previousElement.appendChild(document.createTextNode(insertion));
          event.preventDefault();
          continue;
        }
      }

      // TODO range.endContainer
      if (
        !element ||
        container === element ||
        !element.hasAttribute('data-rich-mentions')
      ) {
        continue;
      }

      // At first position of fragment, move before it
      if (range.endOffset === 0) {
        escapeFragmentWithValue(element, insertion, 'before');
        event.preventDefault();
        continue;
      }

      const isFinal = element.hasAttribute('data-integrity');
      const text = element.textContent || '';

      // Move outside final fragment
      if (isFinal && range.startOffset === text.length) {
        escapeFragmentWithValue(element, insertion, 'after');
        event.preventDefault();
        continue;
      }
    }
  }
}
