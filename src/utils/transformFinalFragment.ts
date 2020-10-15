import { TMentionConfig, TMentionItem } from '../RichMentionsContext';
import { setCursorPosition } from './setCursorPosition';

export function transformFinalFragment<T>(
  span: HTMLSpanElement,
  ref: TMentionItem['ref'],
  config: TMentionConfig<T>
): void {
  const content = ref
    .replace(config.match, config.matchDisplay)
    .replace(/\s/g, '\u00A0');

  span.textContent = content;
  span.setAttribute('data-rich-mentions', ref);
  span.setAttribute('spellcheck', 'false');

  if (process.env.NODE_ENV !== 'production') {
    span.setAttribute('data-cy', 'final');
  }

  if (config.customizeFragment) {
    config.customizeFragment(span, true);
  }

  span.setAttribute('data-integrity', span.innerHTML);

  if (span.parentElement) {
    // TODO only if no space after
    const textNode = document.createTextNode('\u00A0');
    span.parentElement.insertBefore(textNode, span.nextSibling);
    setCursorPosition(textNode, 1);
  }
}
