import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  RichMentionsInput,
  RichMentionsProvider,
  RichMentionsAutocomplete,
  TMentionContextPublicMethods,
} from '../src';

const list = ['adrien', 'anna', 'guillaume', 'vincent', 'victor'].map(
  (v, i) => ({
    name: v,
    ref: `<@${v}|u${i + 1}>`,
  })
);

const configs = [
  {
    match: /^@([a-zA-Z0-9_-]+)?$/,
    customizeFragment: (fragment: HTMLSpanElement, final: boolean) => {
      fragment.className = final ? 'final' : 'pending';
      return;
    },
    fragmentToHtml: {
      match: /<(@\w+)\|([^>]+)>/g,
      extractDisplay: '$1',
    },
    htmlToFragment: {
      match: /<span[^>]+data-rich-mentions="([^"]+)"([^>]+)?>@([^>]+)<\/span>/gi,
      replace: '$1',
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
  const ref = React.useRef<TMentionContextPublicMethods | null>(null);
  const getResult = () => setResult(ref.current?.getTransformedValue() || '');
  const getContext = (context: TMentionContextPublicMethods) => {
    ref.current = context;
  };

  return (
    <RichMentionsProvider configs={configs} getContext={getContext}>
      <RichMentionsInput defaultValue={defaultValue} />
      <RichMentionsAutocomplete />
      <button data-cy="parse" type="button" onClick={getResult}>
        Parse
      </button>
      <pre data-cy="result">{result}</pre>
    </RichMentionsProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));
