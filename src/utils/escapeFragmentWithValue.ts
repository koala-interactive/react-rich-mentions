import { setCursorPosition } from './setCursorPosition';

export function escapeFragmentWithValue(
  element: HTMLElement,
  text: string,
  position: 'after' | 'before' = 'after'
) {
  const textNode = document.createTextNode(text.replace(/\s/g, '\u00A0'));
  const parent = element.parentElement;

  if (parent) {
    if (position === 'after') {
      parent.insertBefore(textNode, element.nextSibling);
    } else {
      parent.insertBefore(textNode, element);
    }
    setCursorPosition(textNode, text.length);
  }
}
