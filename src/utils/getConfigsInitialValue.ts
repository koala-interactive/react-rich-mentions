import { TMentionConfig } from './../RichMentionsContext';
import { transformFinalFragment } from './transformFinalFragment';

function replaceSpacesWithInsecableSpaces(text: string): string {
  const div = document.createElement('div');
  div.innerHTML = text;

  function recursiveSpaceReplacer(element: HTMLElement) {
    Array.from(element.childNodes).forEach(element => {
      if (element instanceof Text && element.nodeValue) {
        element.nodeValue = element.nodeValue.replace(/( |\t)/g, '\u00A0');
      } else if (element instanceof HTMLElement) {
        recursiveSpaceReplacer(element);

        if (
          element.hasAttribute('data-rich-mentions') &&
          !element.hasAttribute('data-integrity')
        ) {
          element.setAttribute('data-integrity', element.innerHTML);
        }
      }
    });
  }

  recursiveSpaceReplacer(div);

  return div.innerHTML;
}

export function getConfigsInitialValue(configs: TMentionConfig<any>[]) {
  return (text: string): string => {
    // This replace all fragment "<@vince|U515>" to html ones based on your configs
    const formattedTextWithHtml = configs.reduce((acc, config) => {
      return acc.replace(config.match, $0 => {
        const span = document.createElement('span');
        transformFinalFragment(span, $0, config);
        return span.outerHTML;
      });
    }, text);

    // We replace all text spaces with unbreakable ones to avoid problem with contenteditable.
    // Currently, contenteditable remove multiple space but we want to keep it.
    return replaceSpacesWithInsecableSpaces(formattedTextWithHtml);
  };
}
