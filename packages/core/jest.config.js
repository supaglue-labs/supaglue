/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: '@supaglue/core',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
