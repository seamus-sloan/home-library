import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '../.auth/user.json');
const testUser = {
    id: 1,
    name: 'Test',
    color: '#3B82F6',
    avatar_image: null,
    created_at: '2025-11-25 19:06:49',
    updated_at: '2025-11-25 19:06:49',
    last_login: '2025-12-25 19:08:38'
}

setup('login', async ({ page, context }) => {
  console.log("Setting up currentUser in localStorage");

  // Create .auth directory if it doesn't exist
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Clear all browser cache and cookies
  await context.clearCookies();

  // Navigate to the app
  await page.goto('/');

  // Clear browser cache via evaluate
  await page.evaluate(() => {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  });

  // Set the currentUser in localStorage
  await page.evaluate((user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, testUser);

  // Save the storage state
  await page.context().storageState({ path: authFile });

  console.log(`Storage state saved to ${authFile}`);
});