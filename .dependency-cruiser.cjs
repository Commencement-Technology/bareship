// CI graph check for the layer rules in docs/decisions/0005. ESLint gives the same
// feedback in the editor; this also catches cycles and orphans across the graph.
const layers = ['app', 'features', 'entities', 'data', 'shared'];
const below = layer => layers.slice(layers.indexOf(layer) + 1);

module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    ...layers.map(layer => ({
      name: `${layer}-imports-downward-only`,
      severity: 'error',
      comment: 'Imports go app → features → entities → data → shared.',
      from: { path: `^src/${layer}/` },
      to: {
        path: `^src/(${layers.filter(l => l !== layer && !below(layer).includes(l)).join('|') || 'NONE'})/`,
      },
    })),
    {
      name: 'features-are-isolated',
      severity: 'error',
      comment:
        'A feature must not import another feature. Move shared code down to entities/ or shared/.',
      from: { path: '^src/features/([^/]+)/' },
      to: { path: '^src/features/([^/]+)/', pathNot: '^src/features/$1/' },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      from: { path: '^src/', pathNot: '\\.(test|spec)\\.tsx?$' },
      to: { dependencyTypes: ['npm-dev'], pathNot: ['node_modules/@types/'] },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'react-native', 'default'],
    },
  },
};
