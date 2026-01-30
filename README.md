# FFXIV TC Shop List

A web application for browsing the Final Fantasy XIV Taiwan Crystal Store and tracking purchased items.

## Features

- Browse all crystal store items organized by main and sub-categories
- Search items by name (supports Chinese characters)
- Filter by hierarchical main/sub-category navigation
- Track purchased items with persistent local storage
- View purchase progress with a visual progress bar
- Crawl the official FFXIV TW store to update the product database

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, static export)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 5
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Playwright](https://playwright.dev/) (web scraping)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

This generates a static export in the `out/` directory, ready for deployment to any static hosting service.

## Data Crawling

To fetch the latest items from the official FFXIV TW crystal store:

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run the crawler
npm run crawl
```

The crawler outputs item data to `data/items.json`.

## Project Structure

```
src/
  app/           # Next.js App Router pages and layout
  components/    # React UI components
  hooks/         # Custom React hooks (purchase tracking)
  lib/           # Data access layer
  types/         # TypeScript type definitions
scripts/
  crawl.ts       # Store crawler script
data/
  items.json     # Pre-crawled product data
```

## License

The source code of this project is licensed under the [Apache License 2.0](LICENSE).

All game content, including but not limited to item names, descriptions, images, and other materials are the property of their respective owners:

> FINAL FANTASY XIV © SQUARE ENIX
> Published by USERJOY Technology Co., Ltd.
> Jointly Published by NADA HOLDINGS

FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd. This project is not affiliated with or endorsed by Square Enix, USERJOY Technology, or NADA HOLDINGS.
