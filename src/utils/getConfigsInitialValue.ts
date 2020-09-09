import { TMentionConfig } from './../RichMentionsContext';
import { transformFinalFragment } from './transformFinalFragment';

export function getConfigsInitialValue(configs: TMentionConfig<any>[]) {
  return (text: string): string => {
    return configs.reduce((acc, config) => {
      const { fragmentToHtml } = config;

      return acc
        .replace(/( |\t)/g, '\u00A0')
        .replace(fragmentToHtml.match, $0 => {
          const span = document.createElement('span');
          transformFinalFragment(span, $0, config);
          return span.outerHTML;
        });
    }, text);
  };
}
