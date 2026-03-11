import { chromium, devices } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUT_DIR = process.env.OUT_DIR || 'screenshots';

const ADMIN_EMAIL = 'projectlazynotez@gmail.com';

function adminUser() {
  return {
    id: 'admin_1',
    name: 'Admin',
    email: ADMIN_EMAIL,
    role: 'admin',
    provider: 'manual',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
}

function normalUser() {
  return {
    id: 'user_1',
    name: 'Student',
    email: 'student@example.com',
    role: 'user',
    provider: 'manual',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
}

async function ensureDir(page) {
  await page.evaluate(async (dir) => {
    // No-op: directory creation happens in Node below (fs), but keeping a hook if needed later.
    return dir;
  }, OUT_DIR);
}

async function setSession(page, user) {
  await page.addInitScript((u) => {
    localStorage.setItem('currentUser', JSON.stringify(u));
    localStorage.setItem('lazyNotezUser', JSON.stringify(u));
    if (u?.role === 'admin') localStorage.setItem('lazyNotezAdmin', 'true');
    else localStorage.removeItem('lazyNotezAdmin');
  }, user);
}

async function snap(page, path) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path, fullPage: true });
}

async function run() {
  const fs = await import('node:fs/promises');
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });

  // Desktop screenshots
  {
    const page = await desktop.newPage();
    await ensureDir(page);

    await setSession(page, normalUser());
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/1-desktop-user-dashboard.png`, fullPage: true });

    await page.goto(`${BASE_URL}/resources`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/2-desktop-resource-page.png`, fullPage: true });

    await setSession(page, adminUser());
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/3-desktop-admin-dashboard.png`, fullPage: true });

    await page.close();
  }

  // Mobile screenshots
  {
    const page = await mobile.newPage();
    await ensureDir(page);

    await setSession(page, normalUser());
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/4-mobile-user-dashboard.png`, fullPage: true });

    await page.goto(`${BASE_URL}/resources`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/5-mobile-resource-page.png`, fullPage: true });

    await setSession(page, adminUser());
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT_DIR}/6-mobile-admin-dashboard.png`, fullPage: true });

    await page.close();
  }

  await mobile.close();
  await desktop.close();
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

