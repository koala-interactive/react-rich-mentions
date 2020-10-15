# react-rich-mentions

![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/koala-interactive/react-rich-mentions/dev/react)
[![Cypress.io](https://img.shields.io/badge/tested%20with-Cypress-04C38E.svg)](https://www.cypress.io/)
![lint](https://github.com/koala-interactive/react-rich-mentions/workflows/lint/badge.svg?branch=master)
![e2e](https://github.com/koala-interactive/react-rich-mentions/workflows/e2e/badge.svg?branch=master)

React library to handle **@mentions**, **#channels**, **:smileys:** and whatever with styles.

## Getting started

Install the _react-rich-mentions_ package via npm:

```
npm install react-rich-mentions --save
```

Or yarn:

```
yarn add react-rich-mentions
```

The package exports React components for rendering the mentions autocomplete and contenteditable :

```ts
import {
  RichMentionsInput,
  RichMentionsAutocomplete,
  RichMentionsContext,
  RichMentionsProvider,
} from 'react-rich-mentions';
```

- `RichMentionsProvider` - Feed it with your components and the mention configs
- `RichMentionsInput` - The div[contenteditable] used as TextField
- `RichMentionsAutocomplete` - The default Autocomplete component given with the library (can be overwritten)
- `RichMentionsContext` - Use it to create your own Autocomplete or custom controller.

Example:

```tsx
const configs = [
  {
    // The fragment to transform to readable element.
    // For example, slack is using `<[name]|[id]>` -> `<vince|U82737823>`
    match: /<(@\w+)\|([^>]+)>/g,

    // Use it in combinaison with .match to choose what to display to your user instead of the fragment
    // Given the regex `/<(@\w+)\|([^>]+)>/g` and the fragment `<vince|U82737823>`
    // - $& -> <vince|U82737823>
    // - $1 -> vince
    // - $2 -> U82737823
    matchDisplay: '$1',

    // The query that will start the autocomplete
    // In this case it will match:
    // - @
    // - @test
    // _ @test_
    // Can be changed to catch spaces or some special characters.
    query: /@([a-zA-Z0-9_-]+)?/,

    // The function that will search for autocomplete result.
    // The argument is the searchable text (for example '@test').
    // It can return a promise. The result have to contains for each item:
    // - a prop "ref" -> let say `<@vince|U23872783>`
    // - a prop "name" -> the display name
    async onMention(text) {
      const query = text.substr(1); // remove the '@'
      const results = await callYourAPI(query);

      return results.map(user => ({
        ref: `<@${user.nickname}|${user.id}>`,
        name: user.nickname,
      }));
    },

    // Called to customize visual elements inside input.
    // Can be used to add classes, aria, ...
    // `final` is a boolean to know if the fragment is resolved still
    // waiting for user to select an entry in autocomplete
    customizeFragment(span: HTMLSpanElement, final: boolean) {
      span.className = final ? 'final' : 'pending';
    },
  },
];

const MyComponent = () => {
  const ref = useRef();
  const onClear = () => ref.current.setValue('');
  const onSubmit = () => {
    console.log(ref.current.getTransformedValue());
  };

  return (
    <RichMentionsProvider configs={configs} getContext={ref}>
      <RichMentionsInput defaultValue="The default Text" />
      <RichMentionsAutocomplete fixed={false} />
      <button type="button" onClick={onSubmit}>
        Send
      </button>
      <button type="reset" onClick={onClear}>
        Clear
      </button>
    </RichMentionsProvider>
  );
};
```

### RichMentionsInput props

| Prop name    | Type   | Default value | Description                                        |
| ------------ | ------ | ------------- | -------------------------------------------------- |
| defaultValue | string | `''`          | The default value of the input (cannot be updated) |

### RichMentionsAutocomplete props

| Prop name | Type                 | Default value | Description                                       |
| --------- | -------------------- | ------------- | ------------------------------------------------- |
| fixed     | boolean _(optional)_ | `false`       | Is the autocomplete on a fixed position element ? |

### RichMentionsProvider props

| Prop name      | Type                  | Default value | Description                                                           |
| -------------- | --------------------- | ------------- | --------------------------------------------------------------------- |
| configs        | TMentionConfig[]      | `undefined`   | List of configs to fetch mentions                                     |
| getContext     | function _(optional)_ | `undefined`   | Get rich mention context (can be used with a useRef)                  |
| getInitialHTML | function _(optional)_ | `undefined`   | Can be used to overwrite the function used to preprocess `value` data |

### RichMentionsPublicContext props

The context returned by `getContext` props.

| Prop name           | Type     | Example                                  | Description                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | -------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| getTransformedValue | function | `const text = ctx.getTransformedValue()` | Get the input value with fragment transformed to valid code                                                                                                                                                                                                                                                                                              |
| setValue            | function | `ctx.setValue('Hello <@world\|U15151>')` | Change the input value, will transform the code with valid fragment. It's possible to insert HTML so make sure to sanitize your user's input. Note that for a valid html to be set, you will have to add the following html attribute so it's not remove from the engine `data-rich-mentions=":smile:"` where ":smile:" is the final extracted reference |
| insertFragment      | function | `ctx.insertFragment('<@world\|U45454>')` | Add a fragment at the current cursor position                                                                                                                                                                                                                                                                                                            |

## Building Locally

After cloning the repository, install all dependencies :

```
yarn
```

or

```
npm install
```

### Testing

To test this project, we use cypress : https://docs.cypress.io/guides/overview/why-cypress.html

```
cd ./examples
yarn (OR npm install)
cd ..
yarn cypress:headless
```

If you develop a new feature, be sure to add tests in the `cypress` folder, following documentation from the above website.
