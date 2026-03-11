# Lazy Notez screenshots (submission-ready)

This repo includes a Playwright script that generates clean desktop + mobile screenshots for your report.

## 1) Start the app

In one terminal:

```bash
npm install
npm run dev
```

## 2) Install Playwright (one-time)

```bash
npm i -D playwright
npx playwright install chromium
```

## 3) Generate screenshots

```bash
node scripts/take-screenshots.mjs
```

Outputs land in `screenshots/`:

1. `1-desktop-user-dashboard.png`
2. `2-desktop-resource-page.png`
3. `3-desktop-admin-dashboard.png`
4. `4-mobile-user-dashboard.png`
5. `5-mobile-resource-page.png`
6. `6-mobile-admin-dashboard.png`

## Notes

- The script auto-seeds a session via `localStorage` (no manual login needed).
- To point at a deployed site, run:
  - `BASE_URL=https://your-site-url node scripts/take-screenshots.mjs`

