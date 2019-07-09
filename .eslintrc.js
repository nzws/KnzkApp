'use strict';

const OFF = 0;

module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    'no-unused-vars': OFF,
    'no-undef': OFF
  }
};
