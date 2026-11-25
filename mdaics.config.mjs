import { defineConfig } from 'mdaics';

// Generated API reference lives beside the hand-written Diátaxis docs, not on top of them.
export default defineConfig({
  rootSrcDir: 'src',
  rootDistDir: 'dist',
  outDirName: 'docs/api',
  cache: false,
});
