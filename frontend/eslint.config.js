import js from "@eslint/js";

export default [
  { ignores: ["dist", ".vite"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        fetch: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        document: "readonly",
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
];
