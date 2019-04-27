'use strict';

const OFF = 0;

module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['import'],
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    $: false,
    ons: false,
    knzk: false
  },
  rules: {
    'no-console': 'off',
    'no-undef': 'off'
  }
};
