// ESLint 9 flat config. See docs/decisions/0005 and 0011.
import reactNative from '@react-native/eslint-config/flat';
import boundaries from 'eslint-plugin-boundaries';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

// Layers, top to bottom. A layer may import only from layers below it.
const LAYERS = ['app', 'features', 'entities', 'data', 'shared'];

export default [
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'vendor/**',
      '.bundle/**',
      'assets/bootsplash/**',
    ],
  },
  ...reactNative,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react-native/Libraries/*'],
              message:
                'Deep imports are not part of the public API (RN 0.87 strict types). Import from "react-native".',
            },
            {
              group: ['../../*'],
              message: 'Use the "@/" alias instead of deep relative imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'features', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'entities', pattern: 'src/entities/*', capture: ['entity'] },
        { type: 'data', pattern: 'src/data' },
        { type: 'shared', pattern: 'src/shared' },
      ],
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            'Layer rule broken. Imports go app → features → entities → data → shared, and features never import each other (docs/decisions/0005).',
          policies: LAYERS.map((layer, i) => ({
            from: { element: { type: layer } },
            allow: [
              // Every layer below this one.
              ...LAYERS.slice(i + 1).map(type => ({ to: { element: { type } } })),
              // Within the same layer: a feature only into itself; other layers freely.
              layer === 'features'
                ? {
                    to: {
                      element: {
                        type: 'features',
                        captured: { feature: '{{ from.element.captured.feature }}' },
                      },
                    },
                  }
                : { to: { element: { type: layer } } },
            ],
          })),
        },
      ],
    },
  },
  {
    // Node scripts and config files.
    files: [
      'scripts/**/*.ts',
      '*.config.{js,mjs,cjs}',
      '.dependency-cruiser.cjs',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
    ],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'writable',
        require: 'readonly',
        console: 'readonly',
      },
    },
  },
];
