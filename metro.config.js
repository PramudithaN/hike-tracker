const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const mapsStub = path.resolve(__dirname, 'lib/stubs/react-native-maps.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === 'react-native-maps' &&
    platform !== 'ios' &&
    platform !== 'android'
  ) {
    return { filePath: mapsStub, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
