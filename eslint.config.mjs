// eslint.config.mjs — strict
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

const ignores = [
  "dist/**",
  "node_modules/**",
  "coverage/**",
  "playwright-report/**",
  "test-results/**",
  "blob-report/**",
  "e2e/**",
];

export default [
  { ignores },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier, // tắt rule xung đột với Prettier

  // TS/TSX (strict)
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { JSX: true },
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // SIẾT: cấm any
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],

      // SIẾT: unused — cho phép _var / _arg để “opt-out” có chủ đích
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // CJS / file cấu hình Node (Tailwind, PostCSS, commitlint, v.v.)
  {
    files: [
      "**/*.cjs",
      "**/*.config.cjs",
      "tailwind.config.cjs",
      "postcss.config.cjs",
      "commitlint.config.cjs",
    ],
    languageOptions: {
      globals: globals.node, // có module/require
      sourceType: "commonjs",
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Cho phép logger dùng mọi console (nếu cần giữ log chi tiết)
  { files: ["src/lib/logger.ts"], rules: { "no-console": "off" } },
];
