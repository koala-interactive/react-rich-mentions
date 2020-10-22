import { createContext } from 'react';
import { noop } from './utils/noop';

export type TMentionItem<T = object> = T & {
  name: string;
  ref: string;
};

export interface TMentionConfig<T = object> {
  query: RegExp;
  match: RegExp;
  matchDisplay: string;
  customizeFragment?: (fragment: HTMLSpanElement, final: boolean) => void;
  onMention: (
    text: string,
    callback?: (results: TMentionItem<T>[]) => void
  ) => void | TMentionItem<T>[] | Promise<TMentionItem<T>[]>;
}

export interface TMentionContext {
  getTransformedValue: () => string;
  setValue: (text: string) => void;
  insertFragment: (ref: string, element?: HTMLElement) => void;
  activeSearch: string;
  inputElement: HTMLDivElement | null;
  setInputElement: (newInputElement: HTMLDivElement | null) => void;
  selectItem: (item: TMentionItem<any>) => void;
  setActiveItemIndex: (index: number) => void;
  opened: null | {
    config: TMentionConfig<any>;
    element: HTMLSpanElement;
    fixed: boolean;
    bottom: boolean;
    right: boolean;
    x: number;
    y: number;
  };
  index: number;
  loading: boolean;
  results: TMentionItem<any>[];
  closeAutocomplete: () => void;
  openAutocomplete: <T>(
    node: HTMLElement,
    value: string,
    config: TMentionConfig<T>
  ) => void;
  onBeforeChanges: (event: React.FormEvent<HTMLDivElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onChanges: (event: React.FormEvent<HTMLDivElement>) => void;
  getInitialHTML?: (value: string) => string;
  fixed: boolean;
  setPositionFixed: (fixed: boolean) => void;
}

export const initialContext: TMentionContext = {
  getTransformedValue: () => '',
  insertFragment: noop,
  setValue: noop,
  activeSearch: '',
  inputElement: null,
  setInputElement: noop,
  selectItem: noop,
  setActiveItemIndex: noop,
  opened: null,
  index: 0,
  loading: false,
  results: [],
  closeAutocomplete: noop,
  openAutocomplete: noop,
  onBeforeChanges: noop,
  onKeyDown: noop,
  onChanges: noop,
  fixed: true,
  setPositionFixed: noop,
};

export const RichMentionsContext = createContext<TMentionContext>(
  initialContext
);
