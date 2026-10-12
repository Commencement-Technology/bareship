/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  // Reanimated 4 / worklets ship a resolver that swaps native-only modules for their JS versions.
  resolver: 'react-native-reanimated/jest/resolver',
  setupFiles: [
    '<rootDir>/src/test/pre-setup.ts',
    'react-native-gesture-handler/jestSetup.js',
    '@shopify/flash-list/jestSetup.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // Same transforms as the preset, plus .mjs (MSW's dependencies ship ESM-only builds).
  transform: {
    '^.+\\.(js|mjs|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$':
      require.resolve('@react-native/jest-preset/jest/assetFileTransformer.js'),
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // The RN preset resolves the "react-native" export condition, under which msw/node is null.
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },
  // Many RN libraries ship untranspiled ESM/TS; let Babel handle them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-.*|@shopify|@gorhom|@d11|lucide-react-native|msw|@mswjs|until-async|rettime|@open-draft|zod|@hookform|relative-time-format)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '<rootDir>/dist/',
    '<rootDir>/website/',
  ],
  // dist/npm/template is a packed copy of the app (pnpm pack-template).
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/website/'],
  collectCoverageFrom: [
    'src/shared/**/*.{ts,tsx}',
    'src/data/**/*.{ts,tsx}',
    '!**/*.test.*',
    '!**/index.ts',
    '!src/shared/i18n/i18next.d.ts',
    '!src/shared/i18n/intl-polyfills.ts', // imports only
  ],
  coverageThreshold: {
    './src/shared/': { branches: 70, functions: 80, lines: 80, statements: 80 },
    './src/data/': { branches: 70, functions: 80, lines: 80, statements: 80 },
  },
};
