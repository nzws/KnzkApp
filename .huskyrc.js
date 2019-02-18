'use strict';

const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit': tasks(['pretty-quick --staged', 'lint-staged'])
  }
};
