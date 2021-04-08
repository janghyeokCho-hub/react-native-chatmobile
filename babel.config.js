module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./app'],
        alias: {
          '@': './app',
          '@C': './app/components',
          '@COMMON': './app/components/common',
          '@API': './app/lib/api',
        },
      },
    ],
  ],
};
