module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-async-storage|@react-native-documents|react-native-image-picker)/)',
  ],
};
