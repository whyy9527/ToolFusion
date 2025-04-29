import type { Config } from "jest";
// Correct import for jest-expo preset
import { withExpo } from "jest-expo/config";

const config: Config = {
  // Use withExpo to get base Expo/React Native Jest configuration
  ...withExpo(__dirname, {
    // Your project-specific Jest config goes here
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    // Transform patterns might be handled by jest-expo, but keep if needed
    transformIgnorePatterns: [
      "node_modules/(?!(jest-)?@?react-native|@react-navigation|expo-*|react-native-.*)",
    ],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
    collectCoverageFrom: [
      "**/*.{ts,tsx}",
      "!**/node_modules/**",
      "!**/__tests__/**",
      "!jest.config.ts",
      "!jest.setup.ts",
      "!babel.config.js", // Assuming default expo babel config
      "!metro.config.js", // Assuming default expo metro config
    ],
  }),
};

export default config;
