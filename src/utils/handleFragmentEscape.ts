import { TMentionConfig } from '../RichMentionsContext';
import { getFragment } from './getFragment';
import { escapeFragmentWithValue } from './escapeFragmentWithValue';

export function handleFragmentEscape(
  event: React.FormEvent<HTMLDivElement>,
  { anchorNode }: Selection,
  configs: TMentionConfig<any>[]
) {
  if (event.defaultPrevented || !anchorNode) {
    return;
  }

  const element = getFragment(anchorNode);

  if (element) {
    // @ts-ignore
    const insertion: string = event.data;
    const newText = element.textContent + insertion;
    const isValid = configs.some(cfg => {
      const matches = newText.match(cfg.query);
      return matches && matches[0] === matches.input;
    });

    if (!isValid) {
      event.preventDefault();
      escapeFragmentWithValue(element, insertion);
    }
  }
}
