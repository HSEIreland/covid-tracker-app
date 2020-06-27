module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:react-native-a11y/all'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'comma-dangle': "off"
  }
};
