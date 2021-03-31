import { getFragment } from './getFragment';
import { deleteSelection } from './deleteSelection';
import { setCursorPosition } from './setCursorPosition';
import { transformFinalFragment } from './transformFinalFragment';
import { TMentionConfig } from '../RichMentionsContext';
import { removeBrokenFragments } from './removeBrokenFragments';

const isSpace = (char: string) => /(\u00A0|\s)/.test(char);

const needSpaceBefore = (
  text: string,
  offset: number,
  node: Node,
  defaultValue: boolean
): boolean => {
  if (offset > 0) {
    return !isSpace(text.charAt(offset - 1));
  }

  // Do not add space if the previous element is a block adding a line break
  if (['DIV', 'BR'].includes(node.nodeName)) {
    return false;
  }

  if (node.previousSibling) {
    // TODO get first previous element with text
    const prevText = node.previousSibling.textContent || '';
    return !!prevText.length && !isSpace(prevText.charAt(prevText.length - 1));
  }

  return defaultValue;
};

const needSpaceAfter = (text: string, offset: number, node: Node): boolean => {
  if (offset < text.length) {
    return !isSpace(text.charAt(text.length - 1));
  }

  if (!node.nextSibling) {
    return true;
  }

  const nextText = node.nextSibling.textContent || '';
  // TODO get first next fragment with content...
  return !nextText.length || !isSpace(nextText.charAt(0));
};

export function insertFragment<T>(
  ref: string,
  customFragment: HTMLElement | null,
  configs: TMentionConfig<T>[],
  inputElement: HTMLDivElement | null
) {
  const config = configs.find(cfg => ref.match(cfg.match));

  // inputElement was removed from DOM for some reasons
  if (!inputElement || (!config && !customFragment)) {
    return;
  }

  let insertAfterNode: Node | null = null;
  let insertBeforeNode: Node | null = null;
  let addSpaceBefore = false;
  let addSpaceAfter = false;

  const selection = document.getSelection();

  // Is selection inside inputElement ?
  // (avoid inserting fragments on other parts of the website)
  if (
    selection &&
    selection.anchorNode &&
    inputElement.contains(selection.anchorNode)
  ) {
    let { anchorNode: node, anchorOffset: offset } = selection;
    let fragment = getFragment(node);

    // Avoid problem with text selection
    // Just delete it before processing
    deleteSelection(selection);

    // If we are at the fragment end when inserting content, we have to
    // change the cursor position to be at first position on the next one.
    // If the next fragment does not exist, add a new one.
    // <span>"text"|<span>   -> <span>"text"</span>"|"
    if (fragment && offset === (node.textContent || '').length) {
      if (!fragment.nextSibling) {
        inputElement.insertBefore(document.createTextNode(''), null);
      }
      node = fragment.nextSibling as Node;
      offset = 0;
      fragment = null;
    }

    if (fragment) {
      // Final fragment can't be edited
      // Just remove it and add the insertion just after.
      if (fragment.hasAttribute('data-integrity')) {
        insertBeforeNode = fragment.nextSibling;
        fragment.parentElement?.removeChild(fragment);
      } else {
        const text = node.textContent || '';

        // In this case, we are in the middle of a pending fragment.
        // <span>@vin|ce</span> -> <span>@vin</span>" [insertion] "ce"
        if (offset > 0 && offset < text.length) {
          const firstPart = text.substr(0, offset);
          const secondPart = text.substr(offset);
          const subFragment = document.createTextNode(secondPart);

          inputElement.insertBefore(subFragment, fragment.nextSibling);
          node.textContent = firstPart;
          addSpaceBefore = true;
          insertBeforeNode = subFragment;
        }

        addSpaceBefore = needSpaceBefore(text, offset, node, addSpaceBefore);
        addSpaceAfter = needSpaceAfter(text, offset, node);
      }
    } else {
      // Text inside the contenteditable (not nested)
      let text = node.textContent || '';

      // If we are at the first position in a fragment, we need to insert the new
      // fragment before it, not after.
      if (offset > 0) {
        insertAfterNode = node;
      } else {
        // If next block is <div><br/></div> we have to replace it to a single <div></div>
        const element = node as HTMLElement;
        if (
          !text &&
          element.nodeName === 'DIV' &&
          !element.attributes.length &&
          element.childNodes.length === 1 &&
          element.firstElementChild instanceof HTMLBRElement
        ) {
          if (element.previousSibling instanceof HTMLDivElement) {
            insertBeforeNode = node;
            element.removeChild(element.firstElementChild);
          } else {
            insertAfterNode = node;
            element.removeChild(element.firstElementChild);
          }
        } else {
          insertBeforeNode = node;
        }
      }

      // In this case, we need to add the insertion at the center of a TextNode.
      // Let say we have "hello|world", as you can't add span inside TextNode, we have
      // to split it in two differents nodes : "Hello" and "world", and insert the span
      // between them.
      if (offset > 0 && offset < text.length) {
        const firstPart = text.substr(0, offset);
        const secondPart = text.substr(offset);

        text = firstPart;
        node.textContent = firstPart;

        node.parentElement?.insertBefore(
          document.createTextNode(secondPart),
          node.nextSibling
        );
      }

      addSpaceBefore = needSpaceBefore(text, offset, node, addSpaceBefore);
      addSpaceAfter = needSpaceAfter(text, offset, node);
    }
  } else {
    // Can't find the selection, let's just insert the fragment at the
    // end of the div[contenteditable]
    const text = inputElement.textContent || '';
    addSpaceAfter = true;
    addSpaceBefore = !isSpace(text.charAt(text.length - 1));
  }

  // Create fragment
  const span = document.createElement('span');
  if (config) {
    transformFinalFragment(span, ref, config);
  } else if (customFragment) {
    span.appendChild(customFragment);
    span.setAttribute('data-rich-mentions', ref);
    span.setAttribute('data-integrity', span.innerHTML);
    span.setAttribute('spellcheck', 'false');

    if (process.env.NODE_ENV !== 'production') {
      span.setAttribute('data-cy', 'final');
    }
  }

  // Insert it at chosen position
  if (insertAfterNode && insertAfterNode !== inputElement) {
    insertAfterNode.parentElement?.insertBefore(
      span,
      insertAfterNode.nextSibling
    );
  } else if (insertBeforeNode && insertBeforeNode !== inputElement) {
    insertBeforeNode.parentElement?.insertBefore(span, insertBeforeNode);
  } else {
    inputElement.appendChild(span);
  }

  // Insert space before if needed
  if (addSpaceBefore) {
    const space = document.createTextNode('\u00A0');
    span.parentElement?.insertBefore(space, span);
  }

  // Insert space after if needed
  if (addSpaceAfter) {
    const space = document.createTextNode('\u00A0');
    span.parentElement?.insertBefore(space, span.nextSibling);
  }

  // Set cursor position (always true)
  if (span.nextSibling) {
    setCursorPosition(span.nextSibling, addSpaceAfter ? 1 : 0);
  }

  // If the user is selecting text and some parts of fragment, we need to be sure to delete it correctly
  // Ex where "[" and "]" are the start and ending of text selection:
  // input: "he[llo <span>@vin]ce</span>"
  // output: "he @insertedfragment <span>ce</span>"
  // In this case, the fragment "ce" need to be deleted.
  removeBrokenFragments<T>(inputElement, configs);
}
