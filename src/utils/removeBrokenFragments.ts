import { TMentionConfig } from '../RichMentionsContext';

export function removeBrokenFragments<T>(
  inputElement: HTMLDivElement,
  configs: TMentionConfig<T>[]
) {
  Array.from(inputElement.children).forEach(function fixBrokenElement(
    element,
    index
  ) {
    const parent = element.parentElement as HTMLElement;

    // Replace BR with div>br
    // There is a bug on chrome occuring when the cursor is just after a br, the selection is broken and
    // we can't locate its position. By moving them inside a div it fixes the problem
    if (element instanceof HTMLBRElement) {
      if (
        parent.children.length !== 1 &&
        index !== parent.children.length - 1
      ) {
        const div = document.createElement('div');
        parent.insertBefore(div, element);
        div.appendChild(element);
      }
      return;
    }

    if (element instanceof HTMLDivElement && !element.attributes.length) {
      Array.from(element.children).forEach(fixBrokenElement);
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
      parent.insertBefore(document.createTextNode(text), element);
      parent.removeChild(element);
      return;
    }

    // On final fragments, avoid edition.
    // The data-integrity attribute contains the original fragment content.
    // If it does not match, just remove the entire fragment.
    if (element.hasAttribute('data-integrity')) {
      // final fragment, if not valid remove it completely
      if (element.getAttribute('data-integrity') !== element.innerHTML) {
        parent.removeChild(element);
      }
      return;
    }

    // If we have a pending fragment that is now invalid since the last (let
    // say you just removed the '@' from it, then we can safely extract the
    // text, remove the fragment, and insert the text back without it.
    const isValid = configs.some(cfg => text.match(cfg.query));
    if (!isValid) {
      parent.insertBefore(document.createTextNode(text), element.nextSibling);
      parent.removeChild(element);
    }
  });
}
