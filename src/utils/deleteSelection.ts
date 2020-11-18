import { setCursorPosition } from './setCursorPosition';

export function deleteSelection(
  selection: Selection,
  event?: React.FormEvent<HTMLDivElement>
): boolean {
  let deleted = false;
  let lastDeletedRange = null;

  for (let i = 0; i < selection.rangeCount; ++i) {
    const range = selection.getRangeAt(i);

    if (
      range.startContainer !== range.endContainer ||
      range.startOffset !== range.endOffset
    ) {
      deleted = true;
      lastDeletedRange = range;
      range.deleteContents();
    }
  }

  // @ts-ignore
  if (event?.data && lastDeletedRange) {
    // @ts-ignore
    const textNode = document.createTextNode(event.data);
    lastDeletedRange.insertNode(textNode);
    setCursorPosition(textNode, 1);
    event.preventDefault();
  }

  return deleted;
}
