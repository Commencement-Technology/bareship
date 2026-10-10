const path = require('node:path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaults = getDefaultConfig(__dirname);

// zod re-exports every language through one barrel file; ship English only (metro/zod-locales.js).
const ZOD_ENTRY = /[\\/]node_modules[\\/]zod[\\/]v4[\\/](classic|core|mini)[\\/]/;
const ZOD_LOCALES = /^\.\.\/locales\/index\.c?js$/;
const ZOD_LOCALES_STUB = path.join(__dirname, 'metro', 'zod-locales.js');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (ZOD_LOCALES.test(moduleName) && ZOD_ENTRY.test(context.originModulePath)) {
        return { type: 'sourceFile', filePath: ZOD_LOCALES_STUB };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaults, config);
