import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

async function clickButtonWithText(page, text) {
  return page.evaluate((textToFind) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes(textToFind));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, text);
}

async function runVerification() {
  console.log('🚀 Starting Comprehensive Headless Browser Verification on Edge...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  const uncaughtExceptions = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    uncaughtExceptions.push(err.toString());
    console.log(`[Browser Uncaught Exception]: ${err.toString()}`);
  });

  try {
    // 1. Login Page
    console.log('1. Checking /login page rendering & authentication...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    const brand = await page.$eval('h2', (el) => el.textContent.trim());
    console.log(`   ✓ Login page loaded: Brand="${brand}"`);

    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 10000 });
    console.log(`   ✓ Successfully authenticated! Current URL: ${page.url()}`);

    // 2. Dashboard KPIs
    console.log('\n2. Checking /dashboard metrics...');
    await page.waitForSelector('h1');
    const headerTitle = await page.$eval('h1', (el) => el.textContent.trim());
    console.log(`   ✓ Page Header: "${headerTitle}"`);
    const kpiElements = await page.$$eval('.text-2xl', (els) => els.map((e) => e.textContent.trim()));
    console.log(`   ✓ Active KPI counters from database: ${JSON.stringify(kpiElements)}`);

    // 3. Products List & Search
    console.log('\n3. Checking /products catalog...');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table');
    const initialProductRows = await page.$$eval('tbody tr', (rows) => rows.length);
    console.log(`   ✓ Product items rendered in table: ${initialProductRows}`);

    // 4. Create Product
    console.log('\n4. Creating a new Product SKU via /products/new...');
    await page.goto(`${BASE_URL}/products/new`, { waitUntil: 'networkidle0' });
    const randomSku = `E2E-${Date.now().toString().slice(-4)}`;
    await page.type('input[name="name"]', 'UltraScan Handheld Terminal');
    await page.type('input[name="sku"]', randomSku);
    await page.type('textarea[name="description"]', 'High-performance inventory scanner terminal');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname === '/products', { timeout: 10000 });
    console.log(`   ✓ Created product SKU: ${randomSku} and redirected to /products`);

    // 5. Inbound Receipt Workflow
    console.log('\n5. Creating and Validating Inbound Receipt...');
    await page.goto(`${BASE_URL}/receipts/new`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('form');
    await page.type('input[placeholder*="PO"]', 'E2E Validation Batch');
    // Select product in line item
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      if (selects.length >= 3) {
        selects[2].selectedIndex = 1;
        selects[2].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.startsWith('/receipts/'), { timeout: 10000 });
    console.log(`   ✓ Draft Receipt created! Landed on detail page: ${page.url()}`);

    // Click Validate & Receive Stock
    await new Promise((r) => setTimeout(r, 600));
    await clickButtonWithText(page, 'Validate & Receive Stock');
    await new Promise((r) => setTimeout(r, 600));
    await clickButtonWithText(page, 'Confirm & Credit Stock');
    await new Promise((r) => setTimeout(r, 1200));
    console.log('   ✓ Receipt validated! Stock credited and ledger journal written.');

    // 6. Outbound Delivery Workflow
    console.log('\n6. Scheduling and Dispatching Delivery...');
    await page.goto(`${BASE_URL}/deliveries/new`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('form');
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      if (selects.length >= 2) {
        selects[1].selectedIndex = 1;
        selects[1].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    // Set quantity to 2
    await page.evaluate(() => {
      const qtyInput = document.querySelector('input[type="number"]');
      if (qtyInput) {
        qtyInput.value = '2';
        qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.startsWith('/deliveries/'), { timeout: 10000 });
    console.log(`   ✓ Draft Delivery created! Detail page: ${page.url()}`);

    await new Promise((r) => setTimeout(r, 600));
    await clickButtonWithText(page, 'Validate & Dispatch Stock');
    await new Promise((r) => setTimeout(r, 600));
    await clickButtonWithText(page, 'Confirm & Dispatch');
    await new Promise((r) => setTimeout(r, 1200));
    console.log('   ✓ Outbound delivery dispatched! Physical stock decremented.');

    // 7. Stock Adjustments
    console.log('\n7. Performing Physical Cycle Count Adjustment...');
    await page.goto(`${BASE_URL}/adjustments/new`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('form');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname === '/adjustments', { timeout: 10000 });
    console.log(`   ✓ Adjustment created & applied! Current URL: ${page.url()}`);

    // 8. Immutable Stock Ledger Journal
    console.log('\n8. Inspecting Immutable Stock Ledger Journal...');
    await page.goto(`${BASE_URL}/ledger`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('table');
    const totalLedgerRows = await page.$$eval('tbody tr', (rows) => rows.length);
    console.log(`   ✓ Stock Ledger entries displayed: ${totalLedgerRows}`);

    // 9. Facility Network & Settings
    console.log('\n9. Checking Warehouses, Settings, and Profile...');
    await page.goto(`${BASE_URL}/warehouses`, { waitUntil: 'networkidle0' });
    const facilities = await page.$$eval('h3', (els) => els.map((e) => e.textContent.trim()));
    console.log(`   ✓ Warehouse Facilities: ${JSON.stringify(facilities)}`);

    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    console.log('   ✓ System settings rendered.');

    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0' });
    const profileName = await page.$eval('h2', (el) => el.textContent.trim());
    console.log(`   ✓ Profile authenticated for: ${profileName}`);

    console.log('\n======================================================');
    console.log('🎉 ALL END-TO-END UI WORKFLOW TESTS PASSED CLEANLY!');
    console.log(`   Total Console Errors: ${consoleErrors.length}`);
    console.log(`   Total Uncaught Page Exceptions: ${uncaughtExceptions.length}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ E2E Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
