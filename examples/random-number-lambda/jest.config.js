// required by lambda function
process.env.APPCONFIG_APPLICATION_ID = '123';
process.env.APPCONFIG_ENVIRONMENT_ID = 'abc';
process.env.APPCONFIG_CONFIGURATION_PROFILE_ID = 'xyz';

// eslint-disable-next-line import/no-commonjs
module.exports = {
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(tsx?|json?)$': [
      'esbuild-jest',
      {
        sourcemap: true, // correct line numbers in code coverage
      },
    ],
  },
  collectCoverage: false,
  collectCoverageFrom: ['./src/**'],
  coverageThreshold: {
    global: {
      lines: 3,
    },
  },
};
