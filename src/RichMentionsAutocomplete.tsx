import React, { useContext, useEffect } from 'react';
import { RichMentionsContext, TMentionItem } from './RichMentionsContext';

interface TProps {
  fixed?: boolean;
}

export function RichMentionsAutocomplete<T = object>({ fixed = true }: TProps) {
  const {
    opened,
    index,
    //loading,
    results,
    setActiveItemIndex,
    selectItem,
    setPositionFixed,
  } = useContext(RichMentionsContext);

  const onSelectItem = (item: TMentionItem<T>) => () => selectItem(item);
  const onHoverItem = (index: number) => () => setActiveItemIndex(index);
  const divAttributes =
    process.env.NODE_ENV !== 'production' ? { 'data-cy': 'autocomplete' } : {};
  const itemAttributes =
    process.env.NODE_ENV !== 'production'
      ? { 'data-cy': 'autocomplete_item' }
      : {};

  useEffect(() => {
    setPositionFixed(fixed);
  }, [fixed]);

  return opened && results.length ? (
    <div
      {...divAttributes}
      className="autocomplete"
      style={{
        position: fixed ? 'fixed' : 'absolute',
        left: opened.x + 'px',
        top: opened.y + 'px',
      }}
    >
      <div
        className="autocomplete-list"
        style={{
          bottom: opened.bottom ? '0px' : 'auto',
          right: opened.right ? '0px' : 'auto',
        }}
      >
        {results.map((item, i) => (
          <button
            className={`autocomplete-item ${
              i === index ? 'autocomplete-item-selected' : ''
            }`}
            type="button"
            key={item.ref}
            onClick={onSelectItem(item)}
            onMouseOver={onHoverItem(index)}
            {...itemAttributes}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  ) : null;
}
