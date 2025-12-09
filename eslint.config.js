import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Flat config for ESLint 9+. We keep the previous rules and ignore generated docs assets.
export default [
  {
    ignores: [
      "docs/api/assets/**",
      "docs/api/**/*.html",
      "_site/**",
      "dist/**",
      "coverage/**",
      ".trunk/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
