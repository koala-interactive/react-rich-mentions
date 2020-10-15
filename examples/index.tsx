import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  RichMentionsInput,
  RichMentionsProvider,
  RichMentionsAutocomplete,
  TMentionContext,
} from '../src';
const unicornImage = require('./unicorn.png');

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
  const insertPseudo = () => ref.current?.insertFragment('<@vincent|u3>');
  const insertSmiley = () => {
    const img = new Image(20, 20);
    img.src = unicornImage;
    ref.current?.insertFragment(':unicorn:', img);
  };
  const customSetValue = () => {
    ref.current?.setValue(
      `<span data-rich-mentions=":smile:" class="emojione" style="font-size: 19px; line-height: 19px;">😉</span>    <span data-rich-mentions=":smile:" class="emojione" style="font-size: 19px; line-height: 19px;">😉</span> <img data-rich-mentions=":smile:" src="${unicornImage}" width="19" height="19" class="emojione vaM" />`
    );
  };

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
      <button data-cy="insert" type="button" onClick={insertPseudo}>
        Insert name
      </button>
      <button data-cy="insert-custom" type="button" onClick={insertSmiley}>
        Insert unicorn
      </button>
      <button data-cy="set-value" type="button" onClick={customSetValue}>
        Custom set value
      </button>
      <pre data-cy="result">{result}</pre>
    </RichMentionsProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById('root'));
