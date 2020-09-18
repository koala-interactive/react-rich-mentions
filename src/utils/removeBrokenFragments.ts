import { TMentionConfig } from '../RichMentionsContext';

export function removeBrokenFragments<T>(
  inputElement: HTMLDivElement,
  configs: TMentionConfig<T>[]
) {
  Array.from(inputElement.children).forEach(element => {
    // Chrome is adding empty div when pressing {enter} key
    // For now we can just allow it and keep it on the DOM
    if (element instanceof HTMLDivElement && !element.attributes.length) {
      return;
    }

    const text = element.textContent || '';

    // Fixes a Chrome bug:
    // - Add a span with color on a contenteditable.
    // - Remove the span with backspace.
    // - Type text.
    // Chrome will try to restore the style by adding a <font> with specific styles.
    if (
      !(element instanceof Text) &&
      !element.hasAttribute('data-rich-mentions')
    ) {
      inputElement.insertBefore(document.createTextNode(text), element);
      inputElement.removeChild(element);
      return;
    }

    // On final fragments, avoid edition.
    // The data-integrity attribute contains the original fragment content.
    // If it does not match, just remove the entire fragment.
    if (element.hasAttribute('data-integrity')) {
      // final fragment, if not valid remove it completely
      if (element.getAttribute('data-integrity') !== element.innerHTML) {
        inputElement.removeChild(element);
      }
      return;
    }

    // If we have a pending fragment that is now invalid since the last (let
    // say you just removed the '@' from it, then we can safely extract the
    // text, remove the fragment, and insert the text back without it.
    const isValid = configs.some(cfg => text.match(cfg.query));
    if (!isValid) {
      inputElement.insertBefore(
        document.createTextNode(text),
        element.nextSibling
      );
      inputElement.removeChild(element);
    }
  });
}
