import React, { HTMLProps, useRef, useContext } from 'react';
import { RichMentionsContext } from './RichMentionsContext';

interface TProps extends HTMLProps<HTMLDivElement> {
  defaultValue?: string;
  singleLine: Boolean;
}

export function RichMentionsInput({
  defaultValue,
  singleLine,
  ...divAttributes
}: TProps) {
  const ref = useRef<string | null>(null);
  const {
    setInputElement,
    onBeforeChanges,
    onKeyDown,
    onChanges,
    getInitialHTML,
  } = useContext(RichMentionsContext);

  if (ref.current === null && defaultValue && getInitialHTML) {
    ref.current = getInitialHTML(defaultValue);
  }

  if (process.env.NODE_ENV !== 'production') {
    // @ts-ignore
    divAttributes['data-cy'] = 'input';
  }

  const mergeOnKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      if (singleLine) {
        event.preventDefault();
      }
    }
    onKeyDown(event);

    if (divAttributes.onKeyDown) {
      divAttributes.onKeyDown(event);
    }
  };

  const onInput = (event: React.FormEvent<HTMLDivElement>) => {
    if (divAttributes.onInput) {
      divAttributes.onInput(event);
    }
    onChanges(event);
  };

  const onBeforeInput = (event: React.FormEvent<HTMLDivElement>) => {
    onBeforeChanges(event);

    if (divAttributes.onBeforeInput) {
      divAttributes.onBeforeInput(event);
    }
  };

  let style = {
    outline: 0,
  };
  if (singleLine) {
    style = { ...style, ...{ whiteSpace: 'nowrap', overflow: 'hidden' } };
  }
  return (
    <div
      ref={setInputElement}
      {...divAttributes}
      contentEditable={true}
      onBeforeInput={onBeforeInput}
      onKeyDown={mergeOnKeyDown}
      onInput={onInput}
      dangerouslySetInnerHTML={{ __html: ref.current || '' }}
      style={style}
    ></div>
  );
}
