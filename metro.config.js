const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable CSS support for NativeWind
config.resolver.sourceExts.push('css');

module.exports = config;
