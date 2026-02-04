module.exports = {
    testEnvironment: 'node',
    verbose: true,
    globalSetup: './tests/globalSetup.js',
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 10000
};
