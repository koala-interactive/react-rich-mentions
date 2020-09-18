import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  initialContext,
  MentionContext,
  TMentionItem,
  TMentionContext,
  TMentionConfig,
} from './RichMentionsContext';

import { getFragment } from './utils/getFragment';
import { fixCursorInsertion } from './utils/fixCursorInsertion';
import { insertFragment as insertFragmentUtils } from './utils/insertFragment';
import { getTransformedValue as getTransformedValueUtils } from './utils/getTransformedValue';
import { handleFragmentEscape } from './utils/handleFragmentEscape';
import { removeBrokenFragments } from './utils/removeBrokenFragments';
import { handleFragmentCreation } from './utils/handleFragmentCreation';
import { handleFragmentDeletion } from './utils/handleFragmentDeletion';
import { getConfigsInitialValue } from './utils/getConfigsInitialValue';
import { transformFinalFragment } from './utils/transformFinalFragment';
import { deleteSelection } from './utils/deleteSelection';

interface TProps<T = object> {
  children: React.ReactNode | React.ReactNode[];
  configs: TMentionConfig<T>[];
  getContext?:
    | React.MutableRefObject<TMentionContext>
    | ((ref: TMentionContext) => void);
  getInitialHTML?: (text: string) => string;
}

export function RichMentionsProvider<T = object>({
  children,
  configs,
  getContext,
  getInitialHTML = getConfigsInitialValue(configs),
}: TProps<T>) {
  // The reference to always have function context working
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
    setActiveItemIndex,
    getTransformedValue,
    insertFragment,
    setValue,
  });

  // The state to controls react rendering
  const [__ctx__, setState] = useState<TMentionContext>(ref.current);
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

  // Expose reference with new context
  useEffect(() => {
    if (typeof getContext === 'function') {
      getContext(__ctx__);
    } else if (typeof getContext === 'object') {
      getContext.current = __ctx__;
    }
  }, [getContext, __ctx__]);

  /**
   * Listener to update autocomplete css fixed position
   * Helpful if you have an input fixed at the top/bottom of your website.
   *
   * @param {boolean} fixed Is input element position fixed ? Help to set correct autocomplete position
   * @returns {void}
   */
  function setPositionFixed(fixed: boolean): void {
    updateState({ fixed });
  }

  /**
   * Listener to set new inputElement.
   * Should be used only by the <InputElement /> to mount/unmount itself
   *
   * @param {HTMLDivElement | null} inputElement input element
   * @returns {void}
   */
  function setInputElement(inputElement: HTMLDivElement | null): void {
    updateState({ inputElement });
  }

  /**
   * Called by the autocomplete to select an item.
   * It will transform the current pending fragment to a final one and
   * reset the autocomplete
   *
   * @param {TMentionItem} item The item from autocomplete to select
   * @returns {void}
   */
  function selectItem(item: TMentionItem<T>): void {
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
  }

  /**
   * Bounded to input.onBeforeInput event.
   * Will help to insert/delete/escape fragment before it already happens to avoid a flash
   *
   * @param {FormEvent<HTMLDivElement>} event
   * @returns {void}
   */
  function onBeforeChanges(event: FormEvent<HTMLDivElement>): void {
    let selection = document.getSelection();
    if (!selection || !selection.anchorNode) {
      return;
    }

    // If there is text selection, delete it.
    // We need to do it manually because of the preventDefault() :'(
    // Update 'text' variable as the content could be updated
    if (deleteSelection(selection)) {
      selection = document.getSelection();
      if (!selection || !selection.anchorNode) {
        return;
      }
    }

    fixCursorInsertion(event, selection);
    handleFragmentDeletion(event, selection);
    handleFragmentEscape(event, selection, configs);
    handleFragmentCreation(event, selection, configs, ref.current);
    removeBrokenFragments<T>(event.currentTarget, configs);
  }

  /**
   * Will handle document.onSelectionChange event
   * In this case, just to know if wha have focus on a fragment to open/close the autocomplete
   *
   * @returns {void}
   */
  function onSelectionChange(): void {
    const selection = document.getSelection();
    const fragment = selection?.anchorNode && getFragment(selection.anchorNode);
    const shouldOpened = fragment && !fragment.hasAttribute('data-integrity');
    const opened = ref.current.opened;

    if (opened && !shouldOpened) {
      closeAutocomplete();
    } else if (
      shouldOpened &&
      fragment &&
      (!opened || opened.element !== fragment)
    ) {
      const text = fragment.textContent || '';
      const config = configs.find(cfg => text.match(cfg.query));
      if (config) {
        openAutocomplete(fragment, text, config);
      }
    }
  }

  /**
   * Handle input.onChange event
   * This part is just to remove broken fragment (let say you removed the "@" of a mention) and to
   * Open/Close autocomplete based on the new cursor position.
   *
   * @param {FormEvent<HTMLDivElement>} event
   * @returns {void}
   */
  function onChanges(event: FormEvent<HTMLDivElement>): void {
    const inputElement = event.currentTarget;
    const selection = document.getSelection();

    removeBrokenFragments<T>(inputElement, configs);

    // Autocomplete
    const fragment = selection?.anchorNode && getFragment(selection.anchorNode);

    if (fragment && !fragment.hasAttribute('data-integrity')) {
      const text = fragment.textContent || '';
      const config = configs.find(cfg => text.match(cfg.query));
      if (config) {
        openAutocomplete(fragment, text, config);
      }
    } else if (ref.current.opened) {
      closeAutocomplete();
    }
  }

  /**
   * Handle input.onKeyDown event
   * Just to manage the selected item on the autocomplete if opened
   *
   * @param {KeyboardEvent<HTMLDivElement>} event
   * @returns {void}
   */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
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
  }

  /**
   * Public method to close the autocomplete
   *
   * @returns {void}
   */
  function closeAutocomplete(): void {
    updateState({
      opened: null,
      loading: false,
      results: [],
      index: 0,
    });
  }

  /**
   * Public method to open the autocomplete
   *
   * @param {HTMLElement} node Selected fragment where to open the autocomplete (for position)
   * @param {string} text The fragment text we are autocompleting for
   * @param {TMentionConfig} config The config object linked to the mention
   * @returns {void}
   */
  function openAutocomplete<T>(
    node: HTMLElement,
    text: string,
    config: TMentionConfig<T>
  ): void {
    const fixed = ref.current.fixed;
    const rect = node.getBoundingClientRect();
    const y = fixed ? 0 : window.pageYOffset;
    const x = fixed ? 0 : window.pageXOffset;
    const bottom = rect.bottom + 300 > window.innerHeight;

    updateState({
      loading: true,
      index: 0,
      opened: {
        config,
        fixed,
        bottom,
        element: node,
        x:
          rect.left + 10 + 200 + x < window.innerWidth
            ? rect.left + x + 10
            : window.innerWidth - 200,
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
  }

  /**
   * Just set the active item in the autocomplete based on the index.
   * Will work only if autocomplete is already opened
   *
   * @param {number} index The active element in autocomplete to hover
   * @returns {void}
   */
  function setActiveItemIndex(index: number): void {
    updateState({ index });
  }

  /**
   * Transform input html content to usable text by transforming the
   * fragments to valid text and erasing all invalid fragments.
   *
   * @returns {string}
   */
  function getTransformedValue(): string {
    return getTransformedValueUtils(ref.current.inputElement);
  }

  /**
   * Helper to be able to insert a fragment "<@test|U211212>" inside the text
   *
   * @param {string} code The code to insert as fragment (preprocess by configs). Ex: "<@test|U211212>"
   * @returns {void}
   */
  function insertFragment(code: string): void {
    insertFragmentUtils<T>(code, configs, ref.current.inputElement);
  }

  /**
   * Helper to be able to change the input content externaly
   *
   * @param {string} text The text to insert
   * @returns {void}
   */
  function setValue(text: string): void {
    if (ref.current.inputElement) {
      ref.current.inputElement.innerHTML = getInitialHTML(text);
    }
    closeAutocomplete();
  }

  return (
    <MentionContext.Provider value={__ctx__}>
      {children}
    </MentionContext.Provider>
  );
}
