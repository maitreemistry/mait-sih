module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'nativewind/babel', // Temporarily disabled due to bundling issues
      'react-native-reanimated/plugin',
    ],
  };
};
