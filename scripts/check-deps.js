'use strict';

const pkg = require('../package.json');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

function validateDependencyObject(object) {
  const dependencies = Object.values(object);

  dependencies.forEach(dependency => {
    if (dependency[0] === '^' || dependency[0] === '~') {
      // eslint-disable-next-line no-console
      console.error(
        logSymbols.error,
        `Dependency ${chalk.bold.bgRed(dependency)} should be pinned.`
      );
      process.exitCode = 1;
    }
  });
}

validateDependencyObject(pkg.dependencies);
validateDependencyObject(pkg.devDependencies);
