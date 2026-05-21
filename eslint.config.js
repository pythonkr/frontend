import js from "@eslint/js";
import importPlugin from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

const APP_NAMES = ["pyconkr-2025", "pyconkr-2026", "pyconkr-admin", "pyconkr-participant-portal"];
const crossAppZones = APP_NAMES.flatMap((target) =>
  APP_NAMES.filter((from) => from !== target).map((from) => ({
    target: `./apps/${target}`,
    from: `./apps/${from}`,
  }))
);

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/*.tsbuildinfo"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
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
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 패키지는 앱에 의존할 수 없음
            { target: "./packages", from: "./apps" },
            // common은 shop에 의존할 수 없음 (하위 레이어가 상위 레이어를 참조 금지)
            { target: "./packages/common", from: "./packages/shop" },
            // 앱끼리는 서로 import할 수 없음
            ...crossAppZones,
          ],
        },
      ],
    },
    settings: {
      "import-x/resolver": {
        typescript: true,
        node: true,
      },
      "import-x/internal-regex": "^(@apps/|@frontend/)",
    },
  }
);
