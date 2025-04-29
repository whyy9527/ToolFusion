// Using .js extension as recommended by ESLint v9+
const { FlatCompat } = require("@eslint/eslintrc");
const tseslint = require("typescript-eslint");
const reactNativeCommunity = require("@react-native-community/eslint-config");

// Initialize FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

module.exports = tseslint.config(
  // Base config from @react-native-community (using FlatCompat)
  // This likely includes necessary TypeScript rules and the plugin
  ...compat.config(reactNativeCommunity),

  // Prettier integration (using FlatCompat)
  ...compat.extends("plugin:prettier/recommended"),

  // Custom rules and language options (ensure parser is set if not covered by community config)
  {
    // Ignore configuration files from project-based parsing
    ignores: [
      "eslint.config.js",
      "jest.config.ts",
      "babel.config.js",
      "metro.config.js",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Add any project-specific overrides here
    },
  },
);
