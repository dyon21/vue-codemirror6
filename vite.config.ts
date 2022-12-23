import { checker } from 'vite-plugin-checker';
import { defineConfig, type UserConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import banner from 'vite-plugin-banner';
import Vue from '@vitejs/plugin-vue';

import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';

const pkg = require('./package.json');

// https://vitejs.dev/config/
export default defineConfig(async ({ mode, command }): Promise<UserConfig> => {
  const config: UserConfig = {
    base: './',
    publicDir: command === 'serve' ? 'public' : false,
    // Resolver
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // for DEMO
        'vue-codemirror6': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // https://vitejs.dev/config/#server-options
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
    },
    plugins: [
      Vue(),
      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: true,
        vueTsc: true,
        eslint: {
          lintCommand: 'eslint',
        },
      }),
      // vite-plugin-banner
      // https://github.com/chengpeiquan/vite-plugin-banner
      banner(`/**
 * ${pkg.name}
 *
 * @description ${pkg.description}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @copyright 2022 By Masashi Yoshikawa All rights reserved.
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @see {@link ${pkg.homepage}}
 */
`),
    ],
    optimizeDeps: {
      exclude: [
        'vue-demi',
        // https://github.com/codemirror/dev/issues/608
        '@codemirror/state',
      ],
    },
    // Build Options
    // https://vitejs.dev/config/#build-options
    build: {
      lib: {
        entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        name: 'CodeMirror',
        formats: ['umd', 'es', 'iife'],
        fileName: format => `index.${format}.js`,
      },
      rollupOptions: {
        makeAbsoluteExternalsRelative: true,
        preserveEntrySignatures: 'strict',
        plugins: [
          mode === 'analyze'
            ? // rollup-plugin-visualizer
              // https://github.com/btd/rollup-plugin-visualizer
              visualizer({
                open: true,
                filename: 'dist/stats.html',
                gzipSize: true,
                brotliSize: true,
              })
            : undefined,
        ],
        external: [
          'vue',
          'lodash/compact',
          'lodash/trim',
          'vue-demi',
          'codemirror',
          '@codemirror/autocomplete',
          '@codemirror/commands',
          '@codemirror/language',
          '@codemirror/lint',
          '@codemirror/search',
          '@codemirror/state',
          '@codemirror/view',
        ],
        output: {
          esModule: true,
          generatedCode: {
            reservedNamesAsProps: false,
          },
          interop: 'compat',
          systemNullSetters: false,
          exports: 'named',
          globals: {
            codemirror: 'codemirror',
            '@codemirror/commands': 'commands',
            '@codemirror/language': 'language',
            '@codemirror/lint': 'lint',
            '@codemirror/state': 'state',
            '@codemirror/view': 'view',
            'vue-demi': 'VueDemi',
            'lodash/compact': 'compact',
            'lodash/trim': 'trim',
            vue: 'Vue',
          },
        },
      },
      // Minify option
      target: 'esnext',
      minify: false,
    },
  };

  // Write meta data.
  fs.writeFileSync(
    fileURLToPath(new URL('./src/Meta.ts', import.meta.url)),
    `import type MetaInterface from '@/interfaces/MetaInterface';

// This file is auto-generated by the build system.
const meta: MetaInterface = {
  version: '${pkg.version}',
  date: '${new Date().toISOString()}',
};
export default meta;
`
  );

  // Export vite config
  return config;
});
