import config from "@tucchi-/eslint-config";

export default [
  ...config(),
  {
    ignores: ["src-tauri/"],
  },
  {
    languageOptions: {
      globals: { document: "readonly", alert: "readonly", setTimeout: "readonly" },
    },
  },
  {
    files: ["playwright.config.ts", "tests/**/*.ts"],
    rules: {
      "no-ternary": "off",
      "max-nested-callbacks": "off",
      complexity: "off",
      "unicorn/numeric-separators-style": "off",
    },
  },
];
