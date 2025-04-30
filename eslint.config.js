// Using .js extension as recommended by ESLint v9+
const { FlatCompat } = require("@eslint/eslintrc");
const tseslint = require("typescript-eslint");
const reactNativeCommunity = require("@react-native-community/eslint-config");

// Initialize FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

module.exports = [
  // Base config from @react-native-community (using FlatCompat)
  ...compat.config(reactNativeCommunity),

  // Prettier integration (using FlatCompat)
  ...compat.extends("plugin:prettier/recommended"),

  // Ignore configuration files from project-based parsing
  {
    ignores: [
      "eslint.config.js",
      "jest.config.ts",
      "babel.config.js",
      "metro.config.js",
      ".expo/**/*",
      "coverage/**/*",
    ],
  },

  // Override for TypeScript/TSX files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
];
