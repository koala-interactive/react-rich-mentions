import { TMentionConfig, TMentionContext } from '../RichMentionsContext';
import { setCursorPosition } from './setCursorPosition';

export function handleFragmentCreation(
  event: React.FormEvent<HTMLDivElement>,
  { anchorNode, anchorOffset }: Selection,
  configs: TMentionConfig<any>[],
  ctx: TMentionContext
): void {
  if (event.defaultPrevented || !anchorNode) {
    return;
  }

  // @ts-ignore Find a property type instead of React.FormEvent<HTMLDivElement> ?
  const insertion: string = event.data;
  const text = anchorNode.textContent || '';

  const prevChar = text.charAt(anchorOffset - 1);
  // Start fragment
  if (anchorOffset && prevChar && !/\W/.test(prevChar)) {
    return;
  }

  const config = configs.find(cfg => insertion.match(cfg.match));
  if (!config) {
    return;
  }

  const fragment = document.createElement('span');

  if (config.customizeFragment) {
    config.customizeFragment(fragment, false);
  }

  fragment.setAttribute('data-rich-mentions', '');
  fragment.setAttribute('spellcheck', 'false');

  if (process.env.NODE_ENV !== 'production') {
    fragment.setAttribute('data-cy', 'pending');
  }

  fragment.textContent = insertion;
  const after = document.createTextNode(text.substr(anchorOffset));
  const isContainer = event.currentTarget === anchorNode;
  const parent = isContainer ? anchorNode : anchorNode.parentElement;
  anchorNode.textContent = text.substr(0, anchorOffset);

  if (parent) {
    if (isContainer) {
      parent.appendChild(fragment);
      parent.appendChild(after);
    } else {
      parent.insertBefore(after, anchorNode.nextSibling);
      parent.insertBefore(fragment, anchorNode.nextSibling);
    }
  }

  setCursorPosition(fragment, 1);
  event.preventDefault();
  ctx.openAutocomplete(fragment, insertion, config);
}
