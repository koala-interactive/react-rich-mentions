export function deleteSelection(selection: Selection) {
  for (let i = 0; i < selection.rangeCount; ++i) {
    const range = selection.getRangeAt(i);
    range.deleteContents();
  }
}
