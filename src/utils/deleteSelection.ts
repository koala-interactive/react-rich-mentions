export function deleteSelection(selection: Selection): boolean {
  let deleted = false;

  for (let i = 0; i < selection.rangeCount; ++i) {
    const range = selection.getRangeAt(i);

    if (
      range.startContainer !== range.endContainer ||
      range.startOffset !== range.endOffset
    ) {
      deleted = true;
      range.deleteContents();
    }
  }

  return deleted;
}
