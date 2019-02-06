module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'selector-list-comma-newline-after': 'always-multi-line',
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['/^ons-/']
      }
    ]
  }
};
