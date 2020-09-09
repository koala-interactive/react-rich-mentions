import React, { useEffect, useState, useRef } from 'react';
import { getConfigsInitialValue } from './utils/getConfigsInitialValue';
import {
  initialContext,
  MentionContext,
  TMentionItem,
  TMentionContext,
  TMentionContextPublicMethods,
  TMentionConfig,
} from './RichMentionsContext';
import { getTransformedValue } from './utils/getTransformedValue';
import { handleFragmentCreation } from './utils/handleFragmentCreation';
import { handleFragmentDeletion } from './utils/handleFragmentDeletion';
import { getFragment } from './utils/getFragment';
import { removeBrokenFragments } from './utils/removeBrokenFragments';
import { fixCursorInsertion } from './utils/fixCursorInsertion';
import { handleFragmentEscape } from './utils/handleFragmentEscape';
import { transformFinalFragment } from './utils/transformFinalFragment';

interface TProps<T = object> {
  children: React.ReactNode | React.ReactNode[];
  configs: TMentionConfig<T>[];
  getContext?: (ref: TMentionContextPublicMethods) => void;
  getInitialHTML?: (text: string) => string;
}

export function RichMentionsProvider<T = object>({
  children,
  configs,
  getContext,
  getInitialHTML = getConfigsInitialValue(configs),
}: TProps<T>) {
  const setPositionFixed: TMentionContext['setPositionFixed'] = fixed => {
    updateState({ fixed });
  };

  const setInputElement: TMentionContext['setInputElement'] = inputElement => {
    updateState({ inputElement });
  };

  const selectItem: TMentionContext['selectItem'] = item => {
    const opened = ref.current.opened;

    if (opened?.element) {
      transformFinalFragment(opened.element, item.ref, opened.config);
    }

    updateState({
      index: 0,
      results: [],
      opened: null,
      loading: false,
      activeSearch: '',
    });
  };

  const onBeforeChanges: TMentionContext['onBeforeChanges'] = event => {
    const selection = document.getSelection();
    if (!selection || !selection.anchorNode) {
      return;
    }

    fixCursorInsertion(event, selection);
    handleFragmentDeletion(event, selection);
    handleFragmentEscape(event, selection, configs);
    handleFragmentCreation(event, selection, configs, ref.current);
  };

  const onSelectionChange = () => {
    const selection = document.getSelection();
    const fragment =
      selection && selection.anchorNode && getFragment(selection.anchorNode);
    const needAutocomplete =
      fragment && !fragment.hasAttribute('data-integrity');
    const opened = ref.current.opened;

    if (opened && !needAutocomplete) {
      closeAutocomplete();
    } else if (
      needAutocomplete &&
      fragment &&
      (!opened || opened.element !== fragment)
    ) {
      const text = fragment.textContent || '';
      const config = configs.find(cfg => text.match(cfg.query));
      if (config) {
        openAutocomplete(fragment, text, config);
      }
    }
  };

  const onChanges: TMentionContext['onChanges'] = event => {
    const inputElement = event.currentTarget;
    const selection = document.getSelection();

    removeBrokenFragments<T>(inputElement, configs);

    // Autocomplete
    const fragment =
      selection && selection.anchorNode && getFragment(selection.anchorNode);

    if (fragment && !fragment.hasAttribute('data-integrity')) {
      const text = fragment.textContent || '';
      const config = configs.find(cfg => text.match(cfg.query));
      if (config) {
        openAutocomplete(fragment, text, config);
      }
    } else if (ctx.opened) {
      closeAutocomplete();
    }
  };

  const onKeyDown: TMentionContext['onKeyDown'] = event => {
    const {
      opened,
      results,
      index,
      selectItem,
      closeAutocomplete,
    } = ref.current;
    if (!opened || !results.length) {
      return;
    }

    switch (event.keyCode) {
      case 40: // down
        event.preventDefault();
        updateState({
          index: Math.min(index + 1, results.length - 1),
        });
        break;

      case 38: // up
        event.preventDefault();
        updateState({
          index: Math.max(index - 1, 0),
        });
        break;

      case 9: // tab
      case 13: // enter
        if (results[index]) {
          event.preventDefault();
          selectItem(results[index]);
        }
        break;

      case 27: // escape
        closeAutocomplete();
        break;
    }
  };

  const closeAutocomplete: TMentionContext['closeAutocomplete'] = () => {
    updateState({
      opened: null,
      loading: false,
      results: [],
      index: 0,
    });
  };

  const openAutocomplete: TMentionContext['openAutocomplete'] = (
    node,
    text,
    config
  ) => {
    const fixed = ref.current.fixed;
    const rect = node.getBoundingClientRect();
    const y = fixed ? 0 : pageYOffset;
    const x = fixed ? 0 : pageXOffset;
    const bottom = rect.bottom + 300 > innerHeight;

    updateState({
      loading: true,
      index: 0,
      opened: {
        config,
        fixed,
        bottom,
        element: node,
        x:
          rect.left + 10 + 200 + x < innerWidth
            ? rect.left + x + 10
            : innerWidth - 200,
        y: bottom ? rect.top + y - 3 : rect.bottom + y + 3,
      },
    });

    const onResolve = (results: TMentionItem[] = []) => {
      if (ref.current.opened?.element === node) {
        updateState({
          results,
          loading: false,
        });
      }
    };

    const p = config.onMention(text, onResolve);
    if (p instanceof Promise) {
      p.then(onResolve, onResolve);
    } else if (p instanceof Array) {
      onResolve(p);
    }
  };

  const preSelect: TMentionContext['preSelect'] = index => {
    updateState({ index });
  };

  const ref = useRef<TMentionContext>({
    ...initialContext,
    getInitialHTML,
    setPositionFixed,
    setInputElement,
    selectItem,
    onBeforeChanges,
    onChanges,
    onKeyDown,
    closeAutocomplete,
    openAutocomplete,
    preSelect,
  });

  const [ctx, setState] = useState<TMentionContext>(ref.current);
  const updateState = (data: Partial<TMentionContext>) => {
    ref.current = {
      ...ref.current,
      ...data,
    };
    setState(ref.current);
  };

  // Listen for selection change to open/close the autocomplete modal
  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange, false);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange, false);
    };
  }, []);

  // Expose reference with publich methods
  useEffect(() => {
    if (getContext) {
      getContext({
        getTransformedValue: () => getTransformedValue(ctx.inputElement),
      });
    }
  }, [getContext, ctx.inputElement]);

  return (
    <MentionContext.Provider value={ctx}>{children}</MentionContext.Provider>
  );
}
