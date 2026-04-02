import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, eslintPluginPrettierRecommended, {
  ignores: ["dist"],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      React: "readonly",
    },
    parser: tseslint.parser,
    parserOptions: {
      project: "./tsconfig.json",
    },
  },
}, {
  files: ["stories/**/*.{ts,tsx}", ".storybook/**/*.{ts,tsx}"],
  languageOptions: {
    parserOptions: {
      project: "./stories/tsconfig.json",
    },
  },
},
{
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    import: importPlugin,
    "jsx-a11y": jsxA11y,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "prettier/prettier": ["error", { printWidth: 150 }],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal"],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
    "jsx-a11y/alt-text": "error",
    "@typescript-eslint/no-namespace": "off",
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
});
