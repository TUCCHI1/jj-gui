import config from "@tucchi-/eslint-config";

export default [
  ...config(),
  {
    languageOptions: {
      globals: { document: "readonly", alert: "readonly", setTimeout: "readonly" },
    },
  },
];
