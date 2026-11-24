declare module '@react-native/eslint-plugin' {
  import type { ESLint } from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}

declare module 'eslint-plugin-deprecate';
declare module 'eslint-plugin-jsx-a11y';
declare module 'eslint-plugin-promise';
declare module 'eslint-plugin-react-native-globals';

declare module 'eslint-plugin-expo' {
  import type { ESLint } from 'eslint';

  const plugin: ESLint.Plugin;
  export default plugin;
}
