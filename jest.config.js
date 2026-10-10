module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: ['src/shared/**/*.{ts,tsx}', 'src/data/**/*.{ts,tsx}', '!**/*.test.*'],
  coverageThreshold: {
    './src/shared/': { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
