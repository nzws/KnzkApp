module.exports = {
  '*.js': ['eslint --fix', 'git add'],
  '*.{css,scss}': ['stylelint --fix', 'git add']
};
