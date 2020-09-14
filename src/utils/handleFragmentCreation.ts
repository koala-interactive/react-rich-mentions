import { TMentionConfig, TMentionContext } from '../RichMentionsContext';
import { setCursorPosition } from './setCursorPosition';
import { deleteSelection } from './deleteSelection';

export function handleFragmentCreation(
  event: React.FormEvent<HTMLDivElement>,
  selection: Selection,
  configs: TMentionConfig<any>[],
  ctx: TMentionContext
): void {
  const { anchorNode, anchorOffset } = selection;

  if (event.defaultPrevented || !anchorNode) {
    return;
  }

  // @ts-ignore Find a property type instead of React.FormEvent<HTMLDivElement> ?
  const insertion: string = event.data;
  let text = anchorNode.textContent || '';

  const prevChar = text.charAt(anchorOffset - 1);
  // Start fragment
  if (anchorOffset && prevChar && !/\W/.test(prevChar)) {
    return;
  }

  const config = configs.find(cfg => insertion.match(cfg.query));
  if (!config) {
    return;
  }

  // If there is text selection, delete it.
  // We need to do it manually because of the preventDefault() :'(
  // Update 'text' variable as the content could be updated
  deleteSelection(selection);
  text = anchorNode.textContent || '';

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
  const secondPart = text.substr(anchorOffset);
  const after = document.createTextNode(
    /^\s/.test(secondPart) ? secondPart : ' ' + secondPart
  );

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
