const path = require("path");

module.exports = {
  modulePaths: [],

  moduleDirectories: [
    "node_modules",
    // make 'test/utils' available in tests: const {myModule} = require('utils/...')
    path.resolve(__dirname, "./test"),
  ],

  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  moduleFileExtensions: ["ts", "js", "svelte"],

  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  testMatch: ["<rootDir>/**/*.test.ts", "<rootDir>/**/*.test.js"],

  verbose: true,

  transform: {
    "^.+\\.svelte$": ["svelte-jester"],
    "^.+\\.m?(j|t)s$": "babel-jest",
  },
};
