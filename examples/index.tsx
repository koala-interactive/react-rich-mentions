import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  RichMentionsInput,
  RichMentionsProvider,
  RichMentionsAutocomplete,
  TMentionContext,
} from '../src';

const list = ['adrien', 'anna', 'guillaume', 'vincent', 'victor'].map(
  (v, i) => ({
    name: v,
    ref: `<@${v}|u${i + 1}>`,
  })
);

const configs = [
  {
    query: /@([a-zA-Z0-9_-]+)?/,
    match: /<(@\w+)\|([^>]+)>/g,
    matchDisplay: '$1',
    customizeFragment: (fragment: HTMLSpanElement, final: boolean) => {
      fragment.className = final ? 'final' : 'pending';
    },
    onMention: (text: string) => {
      const search = text.substr(1); // remove '@'
      return list.filter(item => !search || item.name.includes(search));
    },
  },
];

const defaultValue = unescape(location.search.substr(1));
const Root = () => {
  const [result, setResult] = React.useState('');
  const ref = React.useRef<TMentionContext | null>(null);
  const getResult = () => setResult(ref.current?.getTransformedValue() || '');
  const clear = () => ref.current?.setValue('');
  const insert = () => ref.current?.insertFragment('<@vincent|u3>');

  return (
    <RichMentionsProvider configs={configs} getContext={ref}>
      <RichMentionsInput defaultValue={defaultValue} />
      <RichMentionsAutocomplete />
      <button data-cy="parse" type="button" onClick={getResult}>
        Parse
      </button>
      <button data-cy="clear" type="button" onClick={clear}>
        Clear
      </button>
      <button data-cy="insert" type="button" onClick={insert}>
        Insert name
      </button>
      <pre data-cy="result">{result}</pre>
    </RichMentionsProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));
