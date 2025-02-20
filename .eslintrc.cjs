module.exports = {
  env: { browser: true, es2021: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
  ],
  overrides: [
    {
      env: { node: true },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: { sourceType: "script" },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "react"],
  ignorePatterns: ["/dist/*"],
  rules: {
    "react/react-in-jsx-scope": "off", // React 17+ ではJSXトランスフォームが不要
    "@typescript-eslint/no-explicit-any": "warn", // any型の使用を警告（エラーにしたい場合は`error`）
    "no-unused-vars": "off",
  },
};
