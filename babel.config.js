module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // React Compiler must run first. See docs/decisions/0005-architecture-and-boundaries.md
    ['babel-plugin-react-compiler', { target: '19' }],
    // Zod 4 (and other ESM packages) use `export * as ns`, which the RN preset doesn't transform.
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.js',
          '.json',
        ],
        alias: { '@': './src' },
      },
    ],
  ],
};
