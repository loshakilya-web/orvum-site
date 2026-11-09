import { defineConfig } from 'astro/config';

// Static public website for www.orvum.com (owner decision 9 Nov 2026).
export default defineConfig({
  site: 'https://www.orvum.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'never' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
