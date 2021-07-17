module.exports = {
  extends: [
    "@flyyer/eslint-config",
    "@flyyer/eslint-config/typescript",
    "@flyyer/eslint-config/jest",
    "@flyyer/eslint-config/prettier",
  ],
  rules: {
    "@typescript-eslint/no-shadow": "off",
  },
};
