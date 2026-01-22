/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig, devices } from '@playwright/test';

type BrowserPathConfig = Record<string, string>;
type BrowserPathConfigs = Record<string, BrowserPathConfig>;

const browserPaths: BrowserPathConfigs = {
  // Chromium 140.0.7339.186 (bundled with Playwright 1.55, as chromium-1193)
  // Installed automatically using `npm run pretest:install-chrome-140`
  // This version is picked because it has no support for document.activeViewtransition (but does have Cross-Doc support)
  "chromium-140": {
    darwin: './custom-browsers/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
    linux: './custom-browsers/chromium-1193/chrome-linux/chrome',
    win32: './custom-browsers/chromium-1193/chrome-win/chrome.exe', // @TODO: Verify path
  },
  // Safari 18.5 (bundled with Playwright 1.53, as webkit-2182)
  // Installed automatically using `npm run pretest:install-webkit-18`
  // This version is picked because it has no support for document.activeViewtransition (but does have Cross-Doc support)
  "webkit-18": {
    darwin: './custom-browsers/webkit-2182/pw_run.sh',
    linux: './custom-browsers/webkit-2182/pw_run.sh',
    win32: './custom-browsers/webkit-2182/webkit-win64/Playwright.exe', // @TODO: Verify path
  },
};


export default defineConfig({
  testDir: './tests',
  tsconfig: './tsconfig.json',
  workers: 3,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'chromium-140',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: browserPaths['chromium-140'][process.platform],
        },
      },
    },
    {
      name: 'webkit-18',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: {
          executablePath: browserPaths['webkit-18'][process.platform],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run test:serve',
    port: 7357,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});