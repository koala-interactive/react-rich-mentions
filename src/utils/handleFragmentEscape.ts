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
    const isValid = configs.some(cfg => newText.match(cfg.match));

    if (!isValid) {
      event.preventDefault();
      escapeFragmentWithValue(element, insertion);
    }
  }
}
