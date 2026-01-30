import { chromium, type Page } from "playwright";
import { parse } from "node-html-parser";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { StoreItem, CrawlResult } from "../src/types";

const BASE_URL = "https://www.ffxiv.com.tw";
const AJAX_URL = `${BASE_URL}/web/Ajax/ajax_store.aspx`;

// Category structure from the store navigation
const CATEGORIES = [
  {
    mainId: "1",
    mainName: "外觀與造型",
    subs: [
      { subId: "1", subName: "幻想藥水" },
      { subId: "2", subName: "時尚美學" },
      { subId: "3", subName: "臉部彩繪" },
      { subId: "4", subName: "時尚飾品" },
    ],
  },
  {
    mainId: "2",
    mainName: "角色成長",
    subs: [
      { subId: "1", subName: "主線進度" },
      { subId: "2", subName: "光之戰士的旅程" },
    ],
  },
  {
    mainId: "3",
    mainName: "移動與夥伴",
    subs: [
      { subId: "1", subName: "坐騎" },
      { subId: "2", subName: "迷你寵物" },
      { subId: "3", subName: "陸行鳥裝備" },
    ],
  },
  {
    mainId: "4",
    mainName: "戰鬥與裝備",
    subs: [
      { subId: "1", subName: "武器" },
      { subId: "2", subName: "防具" },
      { subId: "3", subName: "工具" },
    ],
  },
  {
    mainId: "5",
    mainName: "社交與情感",
    subs: [
      { subId: "1", subName: "情感動作" },
      { subId: "2", subName: "永結同心" },
    ],
  },
  {
    mainId: "6",
    mainName: "住宅與裝飾",
    subs: [
      { subId: "1", subName: "房屋裝潢" },
      { subId: "2", subName: "管弦樂譜" },
    ],
  },
  {
    mainId: "7",
    mainName: "顏色與風格",
    subs: [{ subId: "1", subName: "染劑" }],
  },
  {
    mainId: "8",
    mainName: "組合包",
    subs: [
      { subId: "1", subName: "限時組合包" },
      { subId: "2", subName: "季節組合包" },
    ],
  },
];

interface AjaxResponse {
  list: string;
  count: number;
  page: string;
  keyword: string;
  msg: string;
}

function parseItemsFromHtml(html: string): Omit<StoreItem, "mainCategoryId" | "mainCategoryName" | "subCategoryId" | "subCategoryName">[] {
  const root = parse(html);
  const items: Omit<StoreItem, "mainCategoryId" | "mainCategoryName" | "subCategoryId" | "subCategoryName">[] = [];

  for (const itemDiv of root.querySelectorAll(".item")) {
    const anchor = itemDiv.querySelector("a");
    if (!anchor) continue;

    const href = anchor.getAttribute("href") || "";
    const idMatch = href.match(/id=([^&]+)/);
    if (!idMatch) continue;

    const id = idMatch[1];
    const img = itemDiv.querySelector("img");
    const imageUrl = img?.getAttribute("src") || "";
    const name = itemDiv.querySelector(".name h3")?.text?.trim() || "";
    const priceText = itemDiv.querySelector(".price span")?.text?.trim() || "0";
    const price = parseInt(priceText.replace(/,/g, ""), 10) || 0;
    const promotionText = itemDiv.querySelector(".promotion .red")?.text?.trim() || "";
    const promotion = promotionText.length > 0;

    const detailUrl = href.startsWith("http")
      ? href
      : `${BASE_URL}/web/store/${href}`;

    items.push({ id, name, price, imageUrl, detailUrl, promotion });
  }

  return items;
}

async function fetchPage(
  page: Page,
  params: { pkind: string; pMainID?: string; pSubID?: string; pPage: number }
): Promise<AjaxResponse> {
  const body = new URLSearchParams({
    type: "StoreList",
    pkind: params.pkind,
    pMainID: params.pMainID || "",
    pSubID: params.pSubID || "",
    pOrderBy: "",
    pPage: String(params.pPage),
  }).toString();

  const result = await page.evaluate(
    async ({ url, body }: { url: string; body: string }) => {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      return resp.json();
    },
    { url: AJAX_URL, body }
  );

  return result as AjaxResponse;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  page: Page,
  params: { pkind: string; pMainID?: string; pSubID?: string; pPage: number },
  maxRetries = 3
): Promise<AjaxResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetchPage(page, params);
      // If we got an empty list but count > 0, the session might have expired
      if (resp.list === "" && resp.count === 0 && attempt < maxRetries) {
        console.log(`   ⚠️  Empty response, refreshing session (attempt ${attempt}/${maxRetries})...`);
        await page.goto(`${BASE_URL}/web/store/`, { waitUntil: "networkidle" });
        await delay(1000);
        continue;
      }
      return resp;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.log(`   ⚠️  Fetch error, retrying (attempt ${attempt}/${maxRetries})...`);
      await page.goto(`${BASE_URL}/web/store/`, { waitUntil: "networkidle" });
      await delay(1000);
    }
  }
  throw new Error("Max retries exceeded");
}

async function main() {
  console.log("🚀 Starting FFXIV TW Crystal Store crawler...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the store page first to establish session
  await page.goto(`${BASE_URL}/web/store/`, { waitUntil: "networkidle" });
  console.log("✅ Connected to store\n");

  const allItems = new Map<string, StoreItem>();
  let requestCount = 0;

  // Phase 1: Crawl by sub-category to get category metadata
  for (const cat of CATEGORIES) {
    for (const sub of cat.subs) {
      console.log(`📁 Category: ${cat.mainName} > ${sub.subName} (main=${cat.mainId}, sub=${sub.subId})`);

      let currentPage = 1;
      let totalCount = 0;

      do {
        // Refresh session periodically
        requestCount++;
        if (requestCount % 20 === 0) {
          console.log("   🔄 Refreshing session...");
          await page.goto(`${BASE_URL}/web/store/`, { waitUntil: "networkidle" });
          await delay(500);
        }

        const resp = await fetchWithRetry(page, {
          pkind: "5",
          pMainID: cat.mainId,
          pSubID: sub.subId,
          pPage: currentPage,
        });

        totalCount = resp.count;
        const parsed = parseItemsFromHtml(resp.list);

        for (const item of parsed) {
          if (!allItems.has(item.id)) {
            allItems.set(item.id, {
              ...item,
              mainCategoryId: cat.mainId,
              mainCategoryName: cat.mainName,
              subCategoryId: sub.subId,
              subCategoryName: sub.subName,
            });
          }
        }

        console.log(`   Page ${currentPage}: ${parsed.length} items (total in category: ${totalCount})`);

        if (parsed.length === 0) break;
        currentPage++;
        await delay(300);
      } while ((currentPage - 1) * 12 < totalCount);

      await delay(500);
    }
  }

  console.log(`\n📊 Items from categories: ${allItems.size}`);

  // Phase 2: Completeness pass with pkind=4 (all items)
  console.log("\n🔍 Running completeness pass (all items)...");
  // Refresh session before completeness pass
  await page.goto(`${BASE_URL}/web/store/`, { waitUntil: "networkidle" });
  await delay(500);

  // First get total count
  const firstResp = await fetchWithRetry(page, { pkind: "4", pPage: 1 });
  const allCount = firstResp.count;
  console.log(`   Total items on server: ${allCount}`);

  const totalPages = Math.ceil(allCount / 12);

  for (let completenessPage = 1; completenessPage <= totalPages; completenessPage++) {
    // Refresh session periodically
    requestCount++;
    if (requestCount % 20 === 0) {
      console.log("   🔄 Refreshing session...");
      await page.goto(`${BASE_URL}/web/store/`, { waitUntil: "networkidle" });
      await delay(500);
    }

    const resp = completenessPage === 1
      ? firstResp
      : await fetchWithRetry(page, { pkind: "4", pPage: completenessPage });

    const parsed = parseItemsFromHtml(resp.list);

    let newItems = 0;
    for (const item of parsed) {
      if (!allItems.has(item.id)) {
        allItems.set(item.id, {
          ...item,
          mainCategoryId: "",
          mainCategoryName: "未分類",
          subCategoryId: "",
          subCategoryName: "未分類",
        });
        newItems++;
      }
    }

    console.log(`   Page ${completenessPage}/${totalPages}: ${parsed.length} items (${newItems} new)`);

    if (parsed.length === 0) break;
    await delay(300);
  }

  await browser.close();

  // Output results
  const result: CrawlResult = {
    crawledAt: new Date().toISOString(),
    totalItems: allItems.size,
    items: Array.from(allItems.values()),
  };

  const outDir = join(process.cwd(), "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "items.json");
  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf-8");

  console.log(`\n✅ Done! Crawled ${result.totalItems} items`);
  console.log(`📄 Output: ${outPath}`);

  // Category summary
  const catCounts = new Map<string, number>();
  for (const item of result.items) {
    const key = item.mainCategoryName || "未分類";
    catCounts.set(key, (catCounts.get(key) || 0) + 1);
  }
  console.log("\n📋 Category breakdown:");
  for (const [cat, count] of catCounts.entries()) {
    console.log(`   ${cat}: ${count}`);
  }
}

main().catch((err) => {
  console.error("❌ Crawler error:", err);
  process.exit(1);
});
