const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Tambahkan resolver untuk mengatasi masalah dependencies
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.sourceExts.push('css');

// Tambahkan transformer untuk CSS
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = withNativeWind(config, { input: './global.css' });