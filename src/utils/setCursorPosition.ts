export function setCursorPosition(
  element: HTMLElement | Node | Text,
  position: number
): void {
  const selection = document.getSelection();
  const range = document.createRange();

  range.setStart(element, position);
  range.collapse(true);

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
