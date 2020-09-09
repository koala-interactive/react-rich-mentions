import { TMentionConfig } from '../RichMentionsContext';

export function removeBrokenFragments<T>(
  inputElement: HTMLDivElement,
  configs: TMentionConfig<T>[]
) {
  Array.from(inputElement.children)
    .filter(element => element.hasAttribute('data-rich-mentions'))
    .forEach(element => {
      const text = element.textContent || '';

      if (element.getAttribute('data-integrity')) {
        // final fragment, if not valid remove it completely
        const isValid = element.getAttribute('data-integrity') === text;
        if (!isValid) {
          inputElement.removeChild(element);
        }
      } else {
        // pending fragment, if not valid, replace the fragment with plain text
        const isValid = configs.some(cfg => text.match(cfg.query));
        if (!isValid) {
          inputElement.insertBefore(
            document.createTextNode(text),
            element.nextSibling
          );
          inputElement.removeChild(element);
        }
      }
    });
}
