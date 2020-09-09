import { TMentionContext } from '../RichMentionsContext';

export function getTransformedValue(
  inputElement: TMentionContext['inputElement']
): string {
  if (!inputElement) {
    return '';
  }

  let html = inputElement.innerHTML;
  if (html === '<br>') {
    return '';
  }

  let result = '';
  Array.from(inputElement.childNodes).forEach(element => {
    if (element instanceof Text) {
      result += element.textContent || '';
    } else if (element instanceof HTMLBRElement) {
      result += '\n';
    } else if (element instanceof Element) {
      const text =
        element.getAttribute('data-rich-mentions') || element.textContent || '';
      if (element instanceof HTMLDivElement) {
        result += `\n${text}\n`;
      } else {
        result += text;
      }
    }
  });

  return result.replace(/\u00A0/g, ' ').trim();
}
