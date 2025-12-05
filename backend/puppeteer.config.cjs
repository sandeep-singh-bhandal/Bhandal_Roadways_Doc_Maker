const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a directory inside the project
  // This helps ensure the downloaded browser persists for the deployment.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};