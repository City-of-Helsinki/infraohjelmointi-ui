const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      const rules = webpackConfig.module.rules.flatMap((rule) => rule.oneOf ?? [rule]);
      const postcssLoaders = rules
        .flatMap((rule) => rule.use ?? [])
        .filter(
          (loader) =>
            typeof loader !== 'string' &&
            loader.loader?.includes('postcss-loader') &&
            Array.isArray(loader.options?.postcssOptions?.plugins),
        );

      postcssLoaders.forEach((loader) => {
        loader.options.postcssOptions.plugins = loader.options.postcssOptions.plugins.map((plugin) =>
          plugin === 'tailwindcss' ? require('@tailwindcss/postcss') : plugin,
        );
      });

      const cssModuleLoaders = rules
        .flatMap((rule) => rule.use ?? [])
        .filter(
          (loader) =>
            typeof loader !== 'string' &&
            loader.loader?.includes('css-loader') &&
            loader.options?.modules?.mode === 'local',
        );

      cssModuleLoaders.forEach((loader) => {
        loader.options.modules = {
          ...loader.options.modules,
          namedExport: false,
          exportLocalsConvention: 'as-is',
        };
      });

      return webpackConfig;
    },
  },
  eslint: {
    enable: false,
  },
};
