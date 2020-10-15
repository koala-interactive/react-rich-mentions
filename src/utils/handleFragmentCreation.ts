import { TMentionConfig, TMentionContext } from '../RichMentionsContext';
import { setCursorPosition } from './setCursorPosition';
import { getFragment } from './getFragment';

export function handleFragmentCreation(
  event: React.FormEvent<HTMLDivElement>,
  selection: Selection,
  configs: TMentionConfig<any>[],
  ctx: TMentionContext
): void {
  const { anchorNode, anchorOffset } = selection;

  if (event.defaultPrevented || !anchorNode || getFragment(anchorNode)) {
    return;
  }

  // @ts-ignore Find a property type instead of React.FormEvent<HTMLDivElement> ?
  const insertion: string = event.data;
  const fragmentText = anchorNode.textContent || '';

  // Build new text fragment with insertion
  const text =
    fragmentText.substr(0, anchorOffset) +
    insertion +
    fragmentText.substr(anchorOffset);

  // No match
  const config = configs.find(cfg => text.match(cfg.query));
  if (!config) {
    return;
  }

  const matches = text.match(config.query) as RegExpMatchArray;
  const index = matches.index || 0;
  const textBeforeQuery = text.substr(0, index);

  // Do nothing if there is a valid character before.
  // Do nothing if the range overflow the fragment position
  if (
    (textBeforeQuery.length && !/\W$/.test(textBeforeQuery)) ||
    anchorOffset < index ||
    anchorOffset >= index + matches[0].length
  ) {
    return;
  }

  anchorNode.textContent = textBeforeQuery;

  const fragment = document.createElement('span');
  const textQuery = matches[0].substr(
    0,
    anchorOffset - index + insertion.length
  );
  const afterInsertion = text.substr(index + textQuery.length);

  fragment.setAttribute('data-rich-mentions', '');
  fragment.setAttribute('spellcheck', 'false');

  if (process.env.NODE_ENV !== 'production') {
    fragment.setAttribute('data-cy', 'pending');
  }

  fragment.textContent = textQuery;

  if (config.customizeFragment) {
    config.customizeFragment(fragment, false);
  }

  const after = document.createTextNode(
    /^\s/.test(afterInsertion) ? afterInsertion : ' ' + afterInsertion
  );

  const isContainer = event.currentTarget === anchorNode;
  const parent = isContainer ? anchorNode : anchorNode.parentElement;

  if (parent) {
    if (isContainer) {
      parent.appendChild(fragment);
      parent.appendChild(after);
    } else {
      parent.insertBefore(after, anchorNode.nextSibling);
      parent.insertBefore(fragment, anchorNode.nextSibling);
    }
  }

  event.preventDefault();
  setCursorPosition(
    fragment.childNodes[0],
    anchorOffset - textBeforeQuery.length + 1
  );

  ctx.openAutocomplete(fragment, textQuery, config);
}
