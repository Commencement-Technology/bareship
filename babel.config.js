module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // React Compiler must run first. See docs/decisions/0005-architecture-and-boundaries.md
    ['babel-plugin-react-compiler', { target: '19' }],
    // Zod 4 (and other ESM packages) use `export * as ns`, which the RN preset doesn't transform.
    '@babel/plugin-transform-export-namespace-from',
    // MSW's interceptors (dev mock backend) use class static blocks.
    '@babel/plugin-transform-class-static-block',
    // Unistyles 3: rewrites StyleSheet usage under src/ so theme changes don't re-render.
    ['react-native-unistyles/plugin', { root: 'src' }],
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
    // Reanimated 4 / worklets: must be the last plugin.
    'react-native-worklets/plugin',
  ],
};
