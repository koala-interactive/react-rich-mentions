import React, { HTMLProps, useRef, useContext } from 'react';
import { RichMentionContext } from './RichMentionsContext';

interface TProps extends HTMLProps<HTMLDivElement> {
  defaultValue?: string;
}

export function RichMentionsInput({ defaultValue, ...divAttributes }: TProps) {
  const ref = useRef<string | null>(null);
  const {
    setInputElement,
    onBeforeChanges,
    onKeyDown,
    onChanges,
    getInitialHTML,
  } = useContext(RichMentionContext);

  if (ref.current === null && defaultValue && getInitialHTML) {
    ref.current = getInitialHTML(defaultValue);
  }

  if (process.env.NODE_ENV !== 'production') {
    // @ts-ignore
    divAttributes['data-cy'] = 'input';
  }

  return (
    <div
      ref={setInputElement}
      {...divAttributes}
      contentEditable={true}
      onBeforeInput={onBeforeChanges}
      onKeyDown={onKeyDown}
      onInput={onChanges}
      dangerouslySetInnerHTML={{ __html: ref.current || '' }}
    ></div>
  );
}
