export function deleteSelection(selection: Selection) {
  for (let i = 0; i < selection.rangeCount; ++i) {
    const range = selection.getRangeAt(i);

    if (
      range.startContainer === range.endContainer &&
      range.startOffset !== range.endOffset
    ) {
      const text = range.startContainer.textContent || '';
      range.startContainer.textContent =
        text.substr(0, range.startOffset) +
        text.substr(range.endOffset, text.length);
    }

    // TODO add support for multiple container range
  }
}
