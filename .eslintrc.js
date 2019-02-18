'use strict';

const OFF = 0;

module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
    es6: true
  },
  rules: {
    'no-unused-vars': OFF,
    'no-undef': OFF
  }
};
