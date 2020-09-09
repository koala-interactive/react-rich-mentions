import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  RichMentionsProvider,
  RichMentionsInput,
  RichMentionsAutocomplete,
} from '../src';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <RichMentionsProvider configs={[]}>
        <RichMentionsInput />
        <RichMentionsAutocomplete />
      </RichMentionsProvider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
