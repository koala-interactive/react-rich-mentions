import { TMentionContext } from '../RichMentionsContext';

export function getTransformedValue(
  inputElement: TMentionContext['inputElement']
): string {
  if (!inputElement || inputElement.innerHTML === '<br>') {
    return '';
  }

  const brCharacter = `_br_${Date.now()}_`;
  const brMatcher = new RegExp(`\\n?${brCharacter}\\n?`, 'g');

  return Array.from(inputElement.childNodes)
    .map(el => getNodeContent(el, brCharacter))
    .join('')
    .replace(/\u00A0/g, ' ') // Replace back insecable spaces
    .replace(/\n{2,}/g, '\n') // Following lines are considered as one in HTML
    .replace(brMatcher, '\n') // Replace <br/> to line break
    .trim();
}

function getNodeContent(element: Node, brCharacter: string): string {
  if (element instanceof Text) {
    return element.textContent || '';
  }

  if (element instanceof HTMLBRElement) {
    return brCharacter;
  }

  if (element instanceof Element) {
    const richValue = element.getAttribute('data-rich-mentions');
    if (richValue) {
      return richValue;
    }

    const char = element instanceof HTMLDivElement ? '\n' : '';
    const result = Array.from(element.childNodes)
      .map(el => getNodeContent(el, brCharacter))
      .join('');

    return `${char}${result}${char}`;
  }

  return '';
}
